'use strict';

const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: 'kakao' },
          });
          if (exUser) {
            return done(null, exUser);
          }
          const newUser = await User.create({
            email: profile._json && profile._json.kakao_account_email,
            nick: profile.displayName,
            snsId: profile.id,
            provider: 'kakao',
          });
          return done(null, newUser);
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
