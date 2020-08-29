require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000;

const routes = require('./routes/main');
const passwordRoutes = require('./routes/password');

// update express settings
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));

// require passport author
require('./auth/auth');

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);

// catch all other routes
app.use((req, res) => {
  res.status(404).json({ message: '404 - Not Found', status: 404 });
});

// handle errors
app.use((error, req, res, next) => {
  console.log(error);
  res.status(error.status || 500).json({ error: error.message, status: 500 });
});

app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}`);
});
