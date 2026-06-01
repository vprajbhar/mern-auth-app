const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User"); 

const createAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES || "1d",
});

const createRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES || "7d",
});
 
const refreshCookieOpts = {
  httpOnly: true,
  //secure: process.env.NODE_ENV === "production", // secure only in prod
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


exports.register = async (req, res) => {

    try {

      const { name, email, password } = req.body;
      const userData = await User.findOne({ email });    

      if (userData!=null) {
        return res.status(409).json({ message: "Email already in use" });
      }

      const hash = await bcrypt.hash(password, 12);
      await User.create({ name, email, password: hash });

      return res.status(201).json({ message: "Registered" });

    } catch (err) {
      return res.status(500).json({ message: "Registration failed", error: err.message });
    }

};

exports.login = async (req, res) => {

    try {

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }  

      const accessToken = createAccessToken(user.id);      
      const refreshToken = createRefreshToken(user.id); 

      user.refreshTokens.push({ token: refreshToken });
      await user.save();

      res.cookie("refreshToken", refreshToken, refreshCookieOpts);      

      return res.json({
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      });

    } catch (err) {
      return res.status(500).json({ message: "Login failed", error: err.message });
    }

};

exports.refresh = async (req, res) => {

  try {

        const token = req.cookies.refreshToken;

        if (!token) return res.status(401).json({ message: "No refresh token" });

        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(payload.sub);
        
        if (!user) return res.status(401).json({ message: "User not found" });

        const stored = user.refreshTokens.find(
          (rt) => rt.token === token && !rt.revoked
        );

        if (!stored) return res.status(401).json({ message: "Invalid refresh token" });
        
        const newRefreshToken = createRefreshToken(user.id);
        stored.revoked = true;
        stored.replacedByToken = newRefreshToken;
        user.refreshTokens.push({ token: newRefreshToken });
        await user.save();

        const accessToken = createAccessToken(user.id);
        res.cookie("refreshToken", newRefreshToken, refreshCookieOpts);

        return res.json({ accessToken });
        
      } catch (err) {
        return res.status(401).json({ message: "Invalid token", error: err.message });
      }
};

exports.logout = async (req, res) => {

  try {

    const token = req.cookies.refreshToken;

    if (token) {

      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.sub);
      if (user) {
        const stored = user.refreshTokens.find((rt) => rt.token === token);
        if (stored) stored.revoked = true;
        await user.save();
      }
    }

  } catch {
    /* ignore */
  }

  res.clearCookie("refreshToken", { ...refreshCookieOpts, maxAge: 0 });
  return res.json({ message: "Logged out" });

};

exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {

      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600 * 1000; // 1h
      await user.save(); 
    }

    return res.json({ message: "If email exists, an email was sent" });

  } catch (err) {
    return res.status(500).json({ message: "Error sending reset", error: err.message });
  }

};

exports.resetPassword = async (req, res) => {

    try {

      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }); 

      if (!user){
        return res.status(400).json({ message: "Invalid or expired token" });
      }      

      user.password = await bcrypt.hash(password, 12);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

    return  res.json({ message: "Password reset" });

    } catch (err) {
      return res.status(500).json({ message: "Reset failed", error: err.message });
    }

};
