const express = require("express");
const router = express.Router();

const { createCourse,getAllCourses,getCourseDetails,} = require("../controllers/Course");

const {createCategory,showAllCategories,categoryPageDetails,} = require("../controllers/Category");

const {createSection,updateSection,deleteSection,} = require("../controllers/Section");

const { createSubSection } = require("../controllers/SubSection");

const {createRating,getAverageRating,getAllRating,} = require("../controllers/RatingAndReview");

const {auth,isInstructor,isStudent,isAdmin,} = require("../middlewares/auth");

// course creation to be done by the instructor
router.post("/createCourse", auth, isInstructor, createCourse);         //      
router.post("/addSection", auth, isInstructor, createSection);
router.put("/updateSection", auth, isInstructor, updateSection);
router.delete("/deleteSection", auth, isInstructor, deleteSection);
router.post("/addSubSection", auth, isInstructor, createSubSection);
router.get("/getAllCourses", getAllCourses);
router.get("/getCourseDetails", getCourseDetails);

// category
router.post("/createCategory", auth, isAdmin, createCategory);  //   tested
router.get("/showAllCategories", showAllCategories);    //  tested
router.get("/getCategoryPageDetails", categoryPageDetails);     

// rating and review
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
