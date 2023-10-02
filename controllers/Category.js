const Category = require("../models/Category");

// create tag ka handler function
exports.createCategory = async (req, res) => {
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
    const CategoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategoryDetails);

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
exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find(
      {},
      { name: true, description: description }
    );
    res.status(200).json({
      success: true,
      message: "all tags returned successfully",
      allCategory,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// categoryPageDetails
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    // get the course for the specified category
    try {
      const selectedCategory = await Category.findById(categoryId)
        .populate("courses")
        .exec();
      console.log(selectedCategory);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "category is not found",
      });
    }
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for this category");
      return res.status(404).json({
        success: false,
        message: "No courses are found for this category",
      });
    }
    const selectedCourses = selectedCategory.courses;

    // get the courses for the other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    }).populate("courses");
    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    }

    // get all the top-selling courses all the categories
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      selectedCourses: selectedCourses,
      differentCourses: differentCourses,
      mostSellingCourses: mostSellingCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Internal Server Error",
    });
  }
};
