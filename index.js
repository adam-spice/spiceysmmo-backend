require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};
if (process.env.MONGO_USERNAME && process.env.MONGO_PASSWORD) {
  mongoConfig.auth = { authSource: 'admin' };
  mongoConfig.user = process.env.MONGO_USERNAME;
  mongoConfig.pass = process.env.MONGO_PASSWORD;
}
mongoose.connect(uri, mongoConfig);

mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});

mongoose.set('useFindAndModify', false);

const app = express();
const PORT = process.env.PORT || 3000;

const routes = require('./routes/main');
const passwordRoutes = require('./routes/password');
const secureRoutes = require('./routes/secure');

// update express settings
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));
app.use(cookieParser());

// import passport strategies
require('./auth/auth');

app.get(
  '/game.html',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    return res.status(200).json(req.user);
  },
);

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.send(`${__dirname}/index.html`);
});

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '404 - Not Found', status: 404 });
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message, status: 500 });
  console.error(err);
});

mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
  app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
  });
});
