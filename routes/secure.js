const express = require('express');
const router = express.Router();

const ChatModel = require('../models/ChaModel');

router.post('/chat', async (req, res) => {
  if (!req.body || !req.body.message) {
    return res.status(400).json({ message: 'invalid body', status: 400 });
  } else {
    const { message } = req.body;
    const { email } = req.user;
    const chat = await ChatModel.create({ email, message });
    return res.status(200).json({ chat, message: 'message sent', status: 200 });
  }
});

module.exports = router;
