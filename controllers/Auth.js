const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// sendotp
// yaha pe otp generation hoga for new email
exports.sendOTP = async (req, res) => {
  try {
    // fetch then email from request ki body
    const { email } = req.body;
    // chck if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Otp generated ", otp);

    // chck the uniqueness of the OTP
    // this can be enhanced using a library that itself generates a unique OTP(used in industry)
    const result = await OTP.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    const otpPayload = { email, otp };
    // create an entry in database
    const otpBody = OTP.create(otpPayload);
    console.log(otpBody);

    // send the res
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    consolr.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// signup
exports.signUp = async () => {
  try {
    // data fetching for signingup
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "all fields are required",
      });
    }

    // both password matching(pass and confirm pass)
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "password and confirm password value do not match",
      });
    }

    // chck if already existing user
    const existingUser = await User.findOne({ email });

    // find most recent otp
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    // validate otp
    // recentotp agar hai hi nai--
    if (recentOtp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    } else if (otp !== recentOtp.otp) {
      // invalid otp
      return res.status(400).json({
        success: false,
        message: "invalid otp..not matching",
      });
    }

    // passwrod hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // res send
    return res.status(200).json({
      success: true,
      message: "user is registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user cant be registered. please try again",
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    // fetch the data
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // verify existing user
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered",
      });
    }

    // passwrod matching
    if (await bcrypt.compare(password, user.password)) {
      // token generate(JWT)
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;
      // cookie parse and put JWT
      const options = {
        expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      // res send
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "password incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failure, plz try again",
    });
  }
};

// changePassword(to be completed)
exports.changePassword = async () => {
  // get data from req.body
  // get old pass, new password
  // confirm newpass,
  // validation
  // update pass in DB
  // send mail--paswrod updated
  // return response
};
