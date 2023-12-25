const User = require("../models/user");
const Order = require("../models/order");
const Token = require("../models/tokenDevice");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
} = require("../helpers/jwt");
const session = require("express-session");
const sendmail = require("../helpers/sendmail");

const get_login_user = (req, res, next) => {
  res.render("login");
};

const get_register_user = (req, res, next) => {
  res.render("register");
};

const get_all_user = async (req, res, next) => {
  try {
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
      res.status(500).json({
        success: false,
      });
    }

    res.status(200).send(userList);
  } catch (error) {
    next(error);
  }
};

const get_user_id = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("name email phone");
    if (!user) {
      res.status(500).json({
        success: false,
      });
    }

    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

const create_user = async (req, res, next) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
    });

    const savedUser = await user.save();
    if (!savedUser) res.status(404).send("User chưa tạo thất bại !");

    res.redirect("/api/v1/users/login");
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("User không tồn tại !");
  }
  if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);
    req.session.isLoggedIn = true;
    req.session.user = { name: user.name, id: user._id, email: user.email };
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    const token = new Token({
      user: user._id,
      tokenDevice: req.body.registrationToken,
    });
    await token.save();

    if (user.isAdmin) {
      res.json({
        success: true,
        redirect: "/admins/dashboard",
      });
    } else {
      res.json({
        success: true,
        redirect: "/",
      });
    }
  } else {
    res.status(400).send("Password không hợp lệ !");
  }
};

const delete_user = (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "User đã được xoá !" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy user !" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};

const get_count_user = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments({});
    if (!userCount) {
      res.status(500).json({
        success: false,
      });
    }

    res.send({
      count: userCount,
    });
  } catch (error) {
    next(error);
  }
};

const logout_user = async (req, res) => {
  const id = req.params.id;
  await Token.deleteMany({ user: id });

  req.session.destroy();
  res.redirect("/");
};

const profile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      const isLoggedIn = req.session.isLoggedIn;
      const order = await Order.find({ user: userId });
      res.render("profile", { user, order, isLoggedIn });
    } else {
      res.status(400).send("User không tồn tại !");
    }
  } catch (error) {
    console.error("Lỗi:", error);
    next(error);
  }
};

const changepassword = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user && bcrypt.compareSync(req.body.oldpassword, user.passwordHash)) {
      if (req.body.newpassword === req.body.confirmpassword) {
        await User.findByIdAndUpdate(id, {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          passwordHash: bcrypt.hashSync(req.body.newpassword, 10),
        });
      } else {
        res.status(400).send("Không xác nhận mật khẩu thành công !");
      }
    }
    const message = "Cập nhật thông tin cá nhân thành công !";

    res.render("success", { message });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  const deletedItem = await Order.findByIdAndDelete(req.params.id);

  if (!deletedItem) {
    return res.status(404).json({ message: "Đơn hàng không tồn tại." });
  }
  res.json({
    success: true,
    redirect: `/api/v1/users/profile/${req.session.user.id}`,
  });
};

const forgotPassword = async (req, res, next) => {
  const email = req.query.email;
  if (!email) {
    res.status(400).json({ message: "Không có email!!!" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "Không tim thay user!!!" });
  }
  // check email có tồn tại thì sẽ tạo resettoken
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save();
  const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_SERVER}/resetpassword/${resetToken}>Click here</a>`;
  const rs = await sendmail({ email, html });
  const message =
    "Hệ thống đã gửi phản hồi reset password qua mail của bạn vui lòng kiểm tra!";

  res.render("success", { message });
};

const get_reset = (req, res, next) => {
  const token = req.params.resetToken;

  res.render("reset_password", { token: token });
};

const resetPassword = async (req, res, next) => {
  const token = req.body.token;
  const password = req.body.confirmPassword;
  // token chính là reset token
  if (!token) {
    res.status(400).json({ message: "Không tìm thấy password!!!" });
  }
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // nếu tìm thấy user có mã băm như tren thì đúng là token thoả mãn
  if (!passwordResetToken) {
    res.status(400).json({ message: "Token không hợp lệ!!!" });
  }
  user.passwordHash = bcrypt.hashSync(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  console.log(user);

  res.redirect("/api/v1/users/login");
};

module.exports = {
  get_all_user,
  get_user_id,
  create_user,
  login,
  delete_user,
  get_count_user,
  get_login_user,
  get_register_user,
  logout_user,
  profile,
  changepassword,
  deleteOrder,
  forgotPassword,
  resetPassword,
  get_reset,
};
