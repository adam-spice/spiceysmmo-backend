const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello World');
});

router.get('/status', (req, res) => {
  res.status(200).json({ message: 'OK', status: 200 });
});

router.post('/signup', (req, res, next) => {
  console.log(req.body);
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'invalid body', status: 400 });
  } else {
    return res.status(200).json({ message: 'OK', status: 200 });
  }
});

router.post('/login', (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'invalid body', status: 400 });
  } else {
    return res.status(200).json({ message: 'OK', status: 200 });
  }
});

router.post('/logout', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'invalid body', status: 400 });
  } else {
    return res.status(200).json({ message: 'OK', status: 200 });
  }
});

router.post('/token', (req, res) => {
  if (!req.body || !req.body.refreshToken) {
    return res.status(400).json({ message: 'invalid body', status: 400 });
  } else {
    const { refreshToken } = req.body;
    res.status(200).json({
      message: `refresh token requested for token ${refreshToken}`,
      status: 200,
    });
  }
});

module.exports = router;
