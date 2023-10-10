const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create the subSection
exports.createSubSection = async (req, res) => {
  try {
    //  fetch the data from req. body
    const { title, timeDuration, description, sectionId } = req.body;

    //  extract file/video
    const video = req.files.videoFile;

    //  validation
    if (!title || !timeDuration || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //  uplodad video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //  cretae subsection
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //  update section with this subSection._id
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      { new: true }
      //   log the updated section here after adding the populate query
    ).populate("subSection");

    //  return response
    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      updatedSection,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create the subsection. Please try again",
    });
  }
};

// update the subsection
exports.updateSubSection = async (req, res) => {
  try {
    const {
      subSectionId,
      sectionId,
      title,
      timeDuration,
      description,
      videoUrl,
    } = req.body;
    if (!subSectionId || !sectionId)
      return res.status(404).json({
        success: false,
        message: "all fields are required",
      });
    let findd = await SubSection.findById(subSectionId);
    if (!findd)
      return res.status(401).json({
        success: false,
        message: "could not find any such subsection",
      });
    findd = await Section.findById(sectionId);
    if (!findd)
      return res.status(401).json({
        success: false,
        message: "could not find any such section",
      });
    await SubSection.findByIdAndUpdate(
      { _id: subSectionId },
      {
        title: title,
        timeDuration: timeDuration,
        description: description,
        videoUrl: videoUrl,
      },
      { new: true }
    );
    // no need of the below codes, bcoz even if any updation in SubSection is done, it wont affect anything in the Section(since it just has _id and nothing else)
    // await Section.findByIdAndUpdate(
    //   { _id: sectionId },
    //   {
    //     $put: { subSection$title: title },
    //   },
    //   {
    //     new: true,
    //   }
    // );
    return res.status(200).json({
      success: true,
      message: " subsection has been successfully updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete the subsection
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    if (!subSectionId || !sectionId)
      return res.status(401).json({
        success: false,
        message: "All the fiedls are requirered",
      });
    let findd = await SubSection.findById(subSectionId);
    if (!findd)
      return res.status(401).json({
        success: false,
        message: "could not find any such subsection",
      });
    findd = await Section.findById(sectionId);
    if (!findd)
      return res.status(401).json({
        success: false,
        message: "could not find any such section",
      });
    await SubSection.findByIdAndDelete(subSectionId);
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: { subSection: subSectionId },
      }
    );
    res.status(200).json({
      success: true,
      message: "SubSection has been successfully deleted",
    });
  } catch (error) {
    console.log("could not delete any such subSection");
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
