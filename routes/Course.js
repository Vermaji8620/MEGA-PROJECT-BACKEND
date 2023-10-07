const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails,
} = require("../controllers/Course");

const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require("../controllers/Category");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const { createSubSection } = require("../controllers/SubSection");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

const {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} = require("../middlewares/auth");

// course creation to be done by the instructor
router.post("/createCourse", auth, isInstructor, createCourse); //  tested
router.post("/addSection", auth, isInstructor, createSection); //  tested
router.put("/updateSection", auth, isInstructor, updateSection); //  tested
router.delete("/deleteSection", auth, isInstructor, deleteSection); //  tested
router.post("/addSubSection", auth, isInstructor, createSubSection); //  tested
router.get("/getAllCourses", getAllCourses); //  tested
router.get("/getCourseDetails", getCourseDetails); //  tested

// category
router.post("/createCategory", auth, isAdmin, createCategory); //   tested
router.get("/showAllCategories", showAllCategories); //  tested
router.get("/getCategoryPageDetails", categoryPageDetails); //  tested

// rating and review
router.post("/createRating", auth, isStudent, createRating);    
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
