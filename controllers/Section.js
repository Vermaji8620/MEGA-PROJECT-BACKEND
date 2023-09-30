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
    );

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
    const { sectionName, sectionId } = req.body;

    //  data validation
    if (!sectionName || !sectionId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // update the data
    const section = await Course.findByIdAndUpdate(
      sectionId,
      {
        sectionName,
      },
      { new: true }
    );

    // return res
    return res.status(200).json({
      success: true,
      message: " Section updated successfully",
      section,
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
    const { sectionID } = req.body;
    // validation
    if (!sectionID) {
      return res.status(400).json({
        success: false,
        message:
          "section is field is required to delete the particular section ",
      });
    }
    // go to the Section and find if any such section having this section id is present ..if yes then delete it
    await Section.findByIdAndDelete(sectionID);

    // testing : do we need to delte the entry from the course schema?

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
