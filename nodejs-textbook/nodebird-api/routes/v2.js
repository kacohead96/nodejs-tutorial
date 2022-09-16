const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const url = require('url');

const { verifyToken, apiLimiter } = require('./middlewares');
const { Domain, User, Post, Hashtag } = require('../models');

const router = express.Router();

router.use(async (req, res, next) => {
  const domain = await Domain.findOne({
    where: { host: req.get('origin') },
  });
  if (domain) {
    cors({
      origin: req.get('origin'),
      credentials: true,
    })(req, res, next);
  } else {
    next();
  }
});

router.post('/token', apiLimiter, async (req, res) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attributes: ['nick', 'id'],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인 입니다.',
      });
    }
    const token = jwt.sign(
      {
        id: domain.User.id,
        nick: domain.User.nick,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1m',
        issuer: 'nodebird',
      }
    );
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다.',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

router.get('/test', verifyToken, apiLimiter, (req, res) => {
  res.json(req.decoded);
});

router.get('/posts/my', verifyToken, apiLimiter, async (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } })
    .then((posts) => {
      console.log(posts);
      res.json({
        code: 200,
        payload: posts,
      });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    });
});

router.get(
  '/posts/hashtag/:title',
  verifyToken,
  apiLimiter,
  async (req, res) => {
    try {
      const hashtag = await Hashtag.findOne({
        where: { title: req.params.title },
      });
      if (!hashtag) {
        return res.status(404).json({
          code: 404,
          message: '검색 결과가 없습니다.',
        });
      }
      const posts = hashtag.getPosts();
      return res.json({
        code: 200,
        payload: posts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      });
    }
  }
);

router.get('/user/followers', verifyToken, apiLimiter, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.decoded.id },
    include: [
      {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      },
    ],
  });
  if (!user) {
    return res.json({
      code: 404,
      message: 'user not found',
    });
  }
  const followers = user.Followers.map((f) => f.nick);
  if (!followers) {
    return res.json({
      code: 404,
      message: 'you have not followers',
    });
  }
  res.json({
    code: 200,
    payload: followers,
  });
});

router.get('/user/followings', verifyToken, apiLimiter, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.decoded.id },
    include: [
      {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      },
    ],
  });
  if (!user) {
    return res.json({
      code: 404,
      message: 'user not found',
    });
  }
  const followings = user.Followings.map((f) => f.nick);
  if (Array.isArray(followings) && followings.length === 0) {
    return res.json({
      code: 404,
      message: 'you have not followings',
    });
  }
  res.json({
    code: 200,
    payload: followings,
  });
});

module.exports = router;
