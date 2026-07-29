import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" });
    }
    const isMatch =await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const role=user.role;
    const token = createToken(user._id);
    res.json({ success: true, token,role });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Create token

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// register user

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // checking user is already exist
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format and strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter valid email" });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter strong password",
      });
    }

    // hashing user password

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const role=user.role;
    const token = createToken(user._id);
    res.json({ success: true, token, role});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// get user profile details & order statistics
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // calculate order statistics
    const orders = await orderModel.find({ userId });
    const paidOrders = orders.filter((o) => o.payment === true);
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    const foodCounts = {};
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        foodCounts[item.name] = (foodCounts[item.name] || 0) + item.quantity;
      });
    });

    let topDish = "None";
    let topDishCount = 0;
    for (const [name, count] of Object.entries(foodCounts)) {
      if (count > topDishCount) {
        topDish = name;
        topDishCount = count;
      }
    }

    const statistics = {
      totalOrders: orders.length,
      totalSpent,
      topDish,
    };

    res.json({ success: true, user, statistics });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update user profile details
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    if (req.file) {
      updateData.profilePicture = req.file.filename;
    }

    if (password && password.trim() !== "") {
      if (password.length < 8) {
        return res.json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
      }
      const salt = await bcrypt.genSalt(Number(process.env.SALT || 10));
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, getProfile, updateProfile };
