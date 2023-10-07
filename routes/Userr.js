const express = require("express");
const router = express.Router();

const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../controllers/Auth");
// const {
//   createCategory,
//   showAllCategory,
//   categoryPageDetails,
// } = require("../controllers/Category");
// const {
//   createCourse,
//   getAllCourses,
//   getCourseDetails,
// } = require("../controllers/Course");
// const { capturePayment, verifySignature } = require("../controllers/Payments");
// const {
//   updateProfile,
//   deleteProfile,
//   getAllUserDetails,
// } = require("../controllers/Profile");
// const {
//   createRating,
//   getAverageRating,
//   getAllRating,
// } = require("../controllers/RatingAndReview");
const {
  resetPassword,
  resetPasswordToken,
} = require("../controllers/ResetPassword");
// const {
//   createSection,
//   updateSection,
//   deleteSection,
// } = require("../controllers/Section");
// const { createSubSection } = require("../controllers/SubSection");

const { auth } = require("../middlewares/auth");

router.post("/login", login); // tested
router.post("/signup", signUp); // tested
router.post("/sendotp", sendOTP); // tested
router.post("/changepassword", auth, changePassword); //  tested
router.post("/reset-password", resetPassword); //   tested
router.post("/reset-password-token", resetPasswordToken); // tested

module.exports = router;
