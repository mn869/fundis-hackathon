const axios = require('axios');
const logger = require('../utils/logger');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || 'demo_key';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'demo_secret';
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY || 'demo_passkey';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/callback';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
  }

  async getAccessToken() {
    try {
      // For demo purposes, return a mock token
      if (process.env.NODE_ENV !== 'production') {
        return 'demo_access_token';
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      return response.data.access_token;
    } catch (error) {
      logger.error('M-Pesa access token error:', error);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  async initiatePayment({ phoneNumber, amount, reference, description }) {
    try {
      // For demo purposes, simulate successful payment initiation
      if (process.env.NODE_ENV !== 'production') {
        const mockResponse = {
          MerchantRequestID: `mock_merchant_${Date.now()}`,
          CheckoutRequestID: `mock_checkout_${Date.now()}`,
          ResponseCode: "0",
          ResponseDescription: "Success. Request accepted for processing",
          CustomerMessage: "Success. Request accepted for processing"
        };

        logger.info('Mock M-Pesa payment initiated:', { reference, amount, phone: phoneNumber });
        return mockResponse;
      }

      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      // Format phone number (remove leading 0 and add 254)
      const formattedPhone = phoneNumber.startsWith('0') 
        ? `254${phoneNumber.slice(1)}` 
        : phoneNumber.startsWith('254') 
        ? phoneNumber 
        : `254${phoneNumber}`;

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${this.callbackUrl}`,
        AccountReference: reference,
        TransactionDesc: description || 'Fundis Booking Payment'
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('M-Pesa payment initiated:', { reference, amount, phone: formattedPhone });
      return response.data;
    } catch (error) {
      logger.error('M-Pesa payment initiation error:', error.response?.data || error.message);
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  async queryPaymentStatus(checkoutRequestId) {
    try {
      // For demo purposes, return mock status
      if (process.env.NODE_ENV !== 'production') {
        return {
          ResponseCode: "0",
          ResponseDescription: "The service request has been accepted successfully",
          MerchantRequestID: "mock_merchant_id",
          CheckoutRequestID: checkoutRequestId,
          ResultCode: "0",
          ResultDesc: "The service request is processed successfully."
        };
      }

      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('M-Pesa payment query error:', error.response?.data || error.message);
      throw new Error('Failed to query M-Pesa payment status');
    }
  }
}

module.exports = new MpesaService();