const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create rating and review
exports.createRating = async (req, res) => {
  try {
    // get user id
    const userId = req.user.id;
    // fetch the data from request body
    const { courseId, rating, review } = req.body;
    // validation
    if (!rating || !courseId || !review) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }
    // chck if user is enrolled or not
    const courseDetails = await Course.find({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // chck if user has already reviewed the course--
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "course is already reviewd by the user",
      });
    }

    // create the rating
    const RatingReview = await RatingAndReview.create({
      user: userId,
      rating: rating,
      review: review,
      course: courseId,
    });
    console.log("RatingAndReview is -> ", RatingAndReview);
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReview: RatingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    return res.status(200).json({
      success: true,
      message: "Rating and review added successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log("error is ---", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get Average Rating andn review
exports.getAverageRating = async (req, res) => {
  try {
    // fetch the course id
    const { courseId } = req.body;
    // calcuate the averaeg rating

    // aggregate function array of values return krta hai..is case mein entire operation k baad mein ek hi value return ho rha hai..jiska nam hai averageRating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // return the rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // if no rating review exist
    return res.status(200).json({
      success: true,
      message: "Average rating is 0, no ratings is given till now ",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// get All Rating and review

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
