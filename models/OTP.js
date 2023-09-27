const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60 * 1000,
  },
});

// otp pehle verify hga and only then ye database k andara jayega-----
const sendVerificationEmail = async (email, otp) => {
  try {
    const mailResponse = await mailSender(
      email,
      "verification email from vermajii",
      otp
    );
    console.log("email sent successfully", mailResponse);
  } catch (error) {
    console.log("error occurred while sending mail", error);
    throw error;
  }
};

OTPSchema.pre("save", async (next) => {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);