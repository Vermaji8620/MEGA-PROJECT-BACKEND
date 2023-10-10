const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    //  data fetch
    //  courseId isiliya aya taki course k andar me update kr paye
    //  sectionName isiliye aya taki Section k database update kr sake
    const { sectionName, courseId } = req.body;

    //  data validation
    if (!sectionName || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    //  create section
    const newSection = await Section.create({ sectionName });

    //  push this section Objectid in the course
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // how to use populate in such a way to populate section and subsection both in theh updated course details

    //  return res
    return res.status(200).json({
      success: true,
      message: " Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: true,
      message: "Unable to create a section. Please try again",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId, courseId } = req.body;

    //  data validation
    if (!sectionName || !sectionId || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // update the data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: sectionName,
      },
      { new: true }
    );

    // change needs to be updated in the course as well
    // no need of the below codes, bcoz even if any updation in SubSection is done, it wont affect anything in the Section(since it just has _id and nothing else)
    // let course;
    // course = await Course.findOneAndUpdate(
    //   { _id: courseId, "courseContent._id": sectionId },
    //   {
    //     $set: {
    //       courseContent$sectionName: sectionName,
    //     },
    //   },
    //   {
    //     new: true,
    //   }
    // );

    // return res
    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
      // course,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: true,
      message: "Unable to update a section. Please try again",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    // get the section id to delete
    const { sectionID, courseID } = req.body;
    // validation
    if (!sectionID || !courseID) {
      return res.status(400).json({
        success: false,
        message: "all field required ",
      });
    }
    // go to the Section and find if any such section having this section id is present ..if yes then delete it
    let findd = await Section.findById(sectionID);
    if (!findd)
      return res.status(401).json({
        success: false,
        message: "could find any such section",
      });

    findd = await Course.findById(courseID);
    if (!findd)
      return res.status(401).json({
        success: false,
        message: "could find any such course",
      });

    await Section.findByIdAndDelete(sectionID);

    //  do we need to delte the entry from the course schema as weell
    await Course.findByIdAndUpdate(
      {
        _id: courseID,
      },
      { $pull: { courseContent: sectionID } },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the section. Please try again",
    });
  }
};
