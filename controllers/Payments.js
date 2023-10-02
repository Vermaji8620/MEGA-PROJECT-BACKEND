const { instance } = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  // get the user id and the course id
  const { course_id } = req.body;
  const userId = req.user.id;

  // validation
  if (!course_id) {
    return res.status(400).json({
      success: false,
      message: "please provide a course valid id",
    });
  }

  // valid course id
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "could not find any such course",
      });
    }

    // user has already paid for this course
    // yaha pe convert krrhe hai chck krne k liye.....course k andar me jo studentsenrolled  ka id wo object id k form me given hai..but yaha pe jb nikal rahe hai to hmko string type me mil raha hai..to type conversion to objectId krna jaruri hai
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Students are already enrolled",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  // order create
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100, // paise me likhna hota hai...rupees me nai..isiliye *100 kiya hai
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    // initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "could not initiate an order",
    });
  }

  // return response
};

// verify the signature of raxorpay and the server
exports.verifySignature = async (req, res) => {
  // mera banaya hua secret key jo ki server pe hai
  const webhookSecret = "12345678";
  // raxorapy se jo key aa raha hai
  const signature = req.headers["x-razorpay-signature"];
  // hm isko hash krrhe hai..taki signature ka sath me match kr sake....kyunki signature jo aya hai..wo already hashed hai..to hmko apne webhookSecret ko to hash krna hga na..to uske liye do tarika ka hashing hota hai...pehla hota hai..sha256 hashing aur dusra Hmac hashing....dono me farq itna hai ki sha256 hashing technique khud hi sufficient hai hashing k liye...lekin hMac technique sha256 leta hai..aut sath me ek secret key leta hai...jiske sath hashinng krna hai
  const shasum = crypto.createHmac("sha256", webhookSecret);
  // convert to string format
  shasum.update(JSON.stringify(req.body));
  // ab iske upar digest funciton apply krnge ..for hexadecimal format
  const digest = shasum.digest("hex");

  // ab signature ko digest k sath me match krna hai--
  if (digest === signature) {
    console.log("payment is authorised");
    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      // find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        {
          _id: courseId,
        },
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        {
          new: true,
        }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "course is not found",
        });
      }
      console.log(enrolledCourse);
      const enrolledStudent = await User.findByIdAndUpdate(
        {
          _id: userId,
        },
        {
          $push: {
            courses: courseId,
          },
        }
      );
      console.log(enrolledStudent);

      // confirmation wala mail send kro ki course kharida ja chuka hai
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "congratulaitons ",
        "congratulations. You are enrolled into new Course"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature verified and course added",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};
