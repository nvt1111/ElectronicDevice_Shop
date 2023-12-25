const JWT = require("jsonwebtoken");
const createError = require("http-errors");

// tạo access Token
const signAccessToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };
    const secret = process.env.secret;
    const options = {
      expiresIn: "1m",
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

// xác thực accesstoken
const verifyAccessToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  const userId = req.session.user.id;
  JWT.verify(token, process.env.secret, async (err, payload) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return next(createError.Unauthorized());
      }
      console.log("Lỗi khi hết hạn token:", err.message);
      // return next(createError.Unauthorized(err.message));
      const newAccessToken = await refreshTokenService(refreshToken, userId);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Đưa payload mới vào request
      req.payload = JWT.decode(newAccessToken);

      // req.payload có dạng:
      //   req.payload: {
      //     userId: '64cb6e7122a39db42ff90e5d',
      //     iat: 1702567297,
      //     exp: 1702567357
      //   }

      return next();
    }
    req.payload = payload;
    next();
  });
};

// lấy accessToken sau khi hết hạn bằng refreshtoken
const signRefreshToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const refreshTokenService = async (refreshToken, userId) => {
  return new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, payload) => {
        if (err) {
          reject(err);
        }
        if (payload) {
          const accessToken = await signAccessToken(userId);
          console.log("newAccessToken:", accessToken);
          resolve(accessToken);
        }
      }
    );
  });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  refreshTokenService,
};
