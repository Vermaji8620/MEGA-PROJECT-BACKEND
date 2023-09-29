const Tag = require("../models/Tag");

// create tag ka handler function

exports.createTag = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;
    // validation
    if (!name || !description) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }
    // create an entry in database
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails);

    //  return response
    return res.status(200).json({
      success: true,
      message: "tag created successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// get all the tags
exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find(
      {},
      { name: name, description: description }
    );
    res.status(200).json({
      success: true,
      message: "all tags returned successfully",
      allTags,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
