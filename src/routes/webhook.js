const express = require('express');
const whatsappService = require('../services/whatsapp');
const logger = require('../utils/logger');

const router = express.Router();

// WhatsApp webhook verification
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    logger.warn('WhatsApp webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// WhatsApp webhook handler
router.post('/whatsapp', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry || !entry[0]) {
      return res.status(200).send('OK');
    }

    const changes = entry[0].changes;
    if (!changes || !changes[0]) {
      return res.status(200).send('OK');
    }

    const { value } = changes[0];
    if (!value.messages) {
      return res.status(200).send('OK');
    }

    // Process each message
    for (const message of value.messages) {
      await whatsappService.handleIncomingMessage(message, value.contacts[0]);
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('WhatsApp webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;