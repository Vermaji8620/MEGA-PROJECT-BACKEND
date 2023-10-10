const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// updateProfile
exports.updateProfile = async (req, res) => {
  try {
    // get the data
    // dateofbirth and about optional hai..to usko khali rakh lete hai..agar kch ayega to thik hai nai to koi baat nai
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    // are user to logged in hai na ...to req.user.id krne se direct hi is user ka id mil jayega
    const id = req.user.id;

    // valdation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // find profile
    // hmko profile ka data chciye lekin wo hai nai meerre pas me..to user ka id pata hai hmko to hm user ka id se user ka data nikal lenge jisme ki profle v hai...to isme se profile ka id mil jayega jisme se ki hmko profile ka data v mil jayega ..
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    // update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();
    // return response
    return res.status(200).json({
      success: true,
      message: "profile details updated successfully",
      profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "this is not working",
      error: error.message,
    });
  }
};

// deleteAccount
exports.deleteProfile = async (req, res) => {
  try {
    // get id
    const id = req.user.id;

    // validation
    const userDetails = await User.findById({ _id: id });
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "user is not found to delete",
      });
    }

    // profile delete krke aao
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // enroll user from all enrolled courses--------------h/work
    // user ab delete krdo
    await User.findByIdAndDelete({ _id: id });

    // return response
    return res.status(200).json({
      success: true,
      message: "the user has been successfullly deleted",
    });
  } catch (error) {
    console.log("user account cannot be deleted");
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// get all the user details
exports.getAllUserDetails = async (req, res) => {
  try {
    // get the id
    const id = req.user.id;

    // validation and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    console.log(userDetails);
    // return res
    return res.status(200).json({
      success: true,
      message: "user data is fetched successfully",
      userDetails,
    });
  } catch (error) {
    console.log("user account details cannot be fetched");
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// get the enrolled courses--
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.find({ _id: userId })
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "could not find the user",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Fetched the course details",
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update the profile picture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const { userId } = req.body;
    const displayPicture = req.files.displayPicture;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME
    );
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "profile updated successfully",
    });
  } catch (error) {
    console.log("could not update the profile picture");
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
