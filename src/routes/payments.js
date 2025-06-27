const express = require('express');
const { Payment, Booking } = require('../models');
const { authenticate } = require('../middleware/auth');
const mpesaService = require('../services/mpesa');
const logger = require('../utils/logger');

const router = express.Router();

// Initiate payment
router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { bookingId, phoneNumber, amount } = req.body;

    // Validate booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.clientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      where: { bookingId, status: ['pending', 'processing', 'completed'] }
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: 'Payment already initiated for this booking'
      });
    }

    // Calculate fees
    const platformFeeRate = 0.05; // 5%
    const platformFee = amount * platformFeeRate;
    const providerShare = amount - platformFee;

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      amount,
      method: 'mpesa',
      phoneNumber,
      providerShare,
      platformFee,
      status: 'pending'
    });

    // Initiate M-Pesa payment
    try {
      const mpesaResponse = await mpesaService.initiatePayment({
        phoneNumber,
        amount,
        reference: payment.id,
        description: `Payment for booking ${bookingId}`
      });

      await payment.update({
        transactionId: mpesaResponse.CheckoutRequestID,
        status: 'processing',
        metadata: mpesaResponse
      });

      res.json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            transactionId: payment.transactionId
          }
        }
      });

      logger.info(`Payment initiated: ${payment.id} for booking ${bookingId}`);
    } catch (mpesaError) {
      await payment.update({
        status: 'failed',
        failureReason: mpesaError.message
      });

      throw mpesaError;
    }
  } catch (error) {
    logger.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
});

// M-Pesa callback
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find payment by transaction ID
    const payment = await Payment.findOne({
      where: { transactionId: CheckoutRequestID }
    });

    if (!payment) {
      logger.warn(`Payment not found for transaction: ${CheckoutRequestID}`);
      return res.status(200).json({ message: 'OK' });
    }

    if (ResultCode === 0) {
      // Payment successful
      const { CallbackMetadata } = stkCallback;
      const metadata = {};

      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach(item => {
          metadata[item.Name] = item.Value;
        });
      }

      await payment.update({
        status: 'completed',
        mpesaReceiptNumber: metadata.MpesaReceiptNumber,
        processedAt: new Date(),
        metadata: { ...payment.metadata, callback: stkCallback }
      });

      // Update booking payment status
      await Booking.update(
        { paymentStatus: 'paid' },
        { where: { id: payment.bookingId } }
      );

      logger.info(`Payment completed: ${payment.id}`);
    } else {
      // Payment failed
      await payment.update({
        status: 'failed',
        failureReason: ResultDesc,
        processedAt: new Date(),
        metadata: { ...payment.metadata, callback: stkCallback }
      });

      logger.warn(`Payment failed: ${payment.id} - ${ResultDesc}`);
    }

    res.status(200).json({ message: 'OK' });
  } catch (error) {
    logger.error('Payment callback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payment status
router.get('/status/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'clientId']
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user has access to this payment
    if (payment.booking.clientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          transactionId: payment.transactionId,
          mpesaReceiptNumber: payment.mpesaReceiptNumber,
          processedAt: payment.processedAt,
          createdAt: payment.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
});

module.exports = router;