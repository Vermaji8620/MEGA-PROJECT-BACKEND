const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

const {
  deleteProfile,
  updateProfile,
  getAllUserDetails,
} = require("../controllers/Profile");

router.delete("/deleteProfile", auth, deleteProfile); //  tested
router.put("/updateProfile", auth, updateProfile); // tested
router.get("/getUserDetails", auth, getAllUserDetails); // tested

module.exports = router;
