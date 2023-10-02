const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

require("dotenv").config();

// creating course handler
// little doubt in this one and also some things need to be changed
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    // fetch the data
    // get the data
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      status,
      instructions,
    } = req.body;

    // get the thumbnail
    const thumbnail = req.files.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!status || status === undefined) {
      status = "Draft";
    }

    // dB call maar rhe taki 'instructor' k andar me daal sake
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });
    console.log("instructorDetails", instructorDetails);
    // verify if userId and instructorDetails._id are same or different

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // chck the given tag is valid or not
    const categoryDetails = await Category.findById(tag);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "category details not found",
      });
    }

    // upload image to cloudinary
    const thumbNailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    console.log(thumbNailImage);

    // entry in dB for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tag,
      category: categoryDetails._id,
      thumbnail: thumbNailImage.secure_url,
      status: status,
      instructions: instructions,
    });

    // create a new course entry to the user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // update the course
    await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    // res.
    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log(error.message);
    res.status(401).json({
      success: false,
      message: " Failed to create course",
    });
  }
};

// get all the courses handler
exports.getAllCourses = async (req, res) => {
  try {
    // change the below statement incrementally
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("Instructor")
      .exec();
    return res.status(200).json({
      success: true,
      message: "Data for all the courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: true,
      message: "Cannot find any course ",
      error: error.message,
    });
  }
};
