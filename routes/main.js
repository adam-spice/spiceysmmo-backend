const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { response } = require('express');

const tokenList = {};
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello world');
});

router.get(
  '/status',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    return res.status(200).json({ message: 'ok', status: 200 });
  },
);

router.post(
  '/signup',
  passport.authenticate('signup', { session: false }),
  async (req, res, next) => {
    return res.status(200).json({ message: 'signup successful', status: 200 });
  },
);

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (error, user) => {
    try {
      if (error) {
        return next(error);
      }
      if (!user) {
        return next(new Error('email and password are required'));
      }

      req.login(user, { session: false }, (err) => {
        if (err) return next(err);

        // create out jwt
        const body = {
          id: user._id,
          email: user.email,
          username: user.username,
        };

        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
          expiresIn: 300,
        });
        const refreshToken = jwt.sign(
          { user: body },
          process.env.JWT_REFRESH_SECRET,
          {
            expiresIn: 86400,
          },
        );

        // store token in a cookie
        res.cookie('jwt', token);
        res.cookie('refreshJwt', refreshToken);

        // store tokens in memory
        tokenList[refreshToken] = {
          token,
          refreshToken,
          email: user.email,
          _id: user._id,
          name: user.name,
        };

        // send token back to the user
        return res.status(200).json({ token, refreshToken, status: 200 });
      });
    } catch (err) {
      console.log(err);
      return next(err);
    }
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  if (req.cookies) {
    const refreshToken = req.cookies.refreshJwt;
    if (refreshToken in tokenList) delete tokenList[refreshToken];
    res.clearCookie('jwt');
    res.clearCookie('refreshJwt');
  }
  return res.status(200).json({ message: 'logged out', status: 200 });
});

router.post('/token', (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken in tokenList) {
    const body = {
      email: tokenList[refreshToken].email,
      id: tokenList[refreshToken].id,
      username: tokenList[refreshToken].username,
    };

    const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
      expiresIn: 300,
    });

    //update jwt
    res.cookie('jwt', token);
    tokenList[refreshToken].token = token;

    return res.status(200).json({ token, status: 200 });
  } else {
    return res.status(401).json({ message: 'Unauthorized', status: 401 });
  }
});

module.exports = router;
