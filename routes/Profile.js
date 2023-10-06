const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

const {
  deleteProfile,
  updateProfile,
  getAllUserDetails,
} = require("../controllers/Profile");

router.delete("/deleteProfile", deleteProfile);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllUserDetails);


module.exports = router;
