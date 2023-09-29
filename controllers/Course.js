const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

require("dotenv").config();

// creating course handler
// little doubt in this one and also some things need to be changed
exports.createCourse = async (req, res) => {
  try {
    // fetch the data
    // get the data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    // get the thumbnail
    const thumbnail = req.files.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // dB call maar rhe taki 'instructor' k andar me daal sake
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("instructorDetails", instructorDetails);
    // verify if userId and instructorDetails._id are same or different

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // chck the given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag details not found",
      });
    }

    // upload image to cloudinary
    const thumbNailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // entry in dB for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbNailImage.secure_url,
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

    // update the tag schema

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
exports.showAllCourses = async (req, res) => {
  try {
    // change the below statement incrementally
    const allCourses = await Course.find({});
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
