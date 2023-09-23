const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");

// resetPasswordToken(reset krne k liye mail send krne ka kaam ye krrha)
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email from req body
    const email = req.body.email;

    // validation,  chck for verified email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "your email is not registered with us",
      });
    }

    //   generate token
    const token = crypto.randomUUID();

    //   update the user by adding the token and the expiraiton time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true, // isse updated document return hota hai
      }
    );

    //    create URL
    const url = `http://localhost:3000/update-password/${token}`;

    //    send mail containingn the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link ${url}`
    );

    //    send the response
    return res.json(200).json({
      success: true,
      message: " email sent successufully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};

// resetPassword (reset krne k baad DB k andar me ye password update krrha hai)
exports.resetPassword = async (req, res) => {
  try {
    // data fetch
    const { password, confirmPassword, token } = req.body;

    // validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password is not matching",
      });
    }

    // get user details from db using token
    const userDetails = await User.findOne({ token: token });

    // if no-entry----invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }

    // token time (if expired or not)
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token is expired. please regenerate your token",
      });
    }
    // password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // update password in database
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    // return response
    return res(200).json({
      success: true,
      message: "Password is reset successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong while updating the password",
    });
  }
};
