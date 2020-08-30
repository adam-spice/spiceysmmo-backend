const express = require('express');
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');

const UserModel = require('../models/UserModel');

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const smtpTransport = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: { user: email, pass: password },
});

const handlebarsOptions = {
  viewEngine: {
    extName: '.hbs',
    defaultLayout: null,
    partialsDir: './templates/',
    layoutsDir: './templates/',
  },
  viewPath: path.resolve('./templates/'),
  extName: '.html',
};

smtpTransport.use('compile', hbs(handlebarsOptions));

const router = express.Router();

router.post('/forgot-password', async (req, res) => {
  const { email: userEmail } = req.body;
  const user = await UserModel.findOne({ email: userEmail });
  if (!user) {
    return res.status(400).json({ message: 'invalid email', status: 400 });
  }

  // create user token
  const buffer = crypto.randomBytes(20);
  const token = buffer.toString('hex');

  // update user reset password token and exp
  await UserModel.findByIdAndUpdate(
    { _id: user._id },
    { resetToken: token, resetTokenExp: Date.now() + 600000 },
  );

  //send user password rest email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'forgot-password',
    subject: `Spicey's mmo forgot password email`,
    context: {
      name: 'adam',
      url: `http://localhost:${process.env.PORT || 3000}?token=${token}`,
    },
  };
  await smtpTransport.sendMail(emailOptions);
  return res.status(200).json({
    message: `An email has been sent to your email address. Password reset link is only valid for 10 minutes`,
    status: 200,
  });
});

router.post('/reset-password', async (req, res) => {
  const { email: userEmail } = req.body;

  const user = await UserModel.findOne({
    resetToken: req.body.token,
    resetTokenExp: { $gt: Date.now() },
    email: userEmail,
  });

  if (!user) {
    return res.status(400).json({ message: 'invalid token', status: 400 });
  }

  // ensure password is provided and that the password matches confirmed
  if (
    !req.body.password ||
    !req.body.verifiedPassword ||
    req.body.password !== req.body.verifiedPassword
  ) {
    return res
      .status(400)
      .json({ message: 'Passwords do not match', status: 400 });
  }
  // update user model
  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'reset-password',
    subject: `Spicey's mmo password reset confirmation email`,
    context: {
      name: user.username,
    },
  };
  await smtpTransport.sendMail(emailOptions);
  return res.status(200).json({
    message: `password updated`,
    status: 200,
  });
});

module.exports = router;
