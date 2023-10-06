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
const {
  updateProfile,
  deleteProfile,
  getAllUserDetails,
} = require("../controllers/Profile");
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

router.post("/login", login);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
router.post("/changepassword", changePassword);
router.post("/reset-password", resetPassword);
router.post("/reset-password-token", resetPasswordToken);

module.exports = router;
