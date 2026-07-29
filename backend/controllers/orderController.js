import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import splitModel from "../models/splitModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://food-delivery-frontend-s2l9.onrender.com";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    }else{
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// get dashboard stats for admin
const getDashboardStats = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData || userData.role !== "admin") {
      return res.json({ success: false, message: "Not Authorized" });
    }

    const allOrders = await orderModel.find({});
    const paidOrders = allOrders.filter((o) => o.payment === true);
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    const foodCounts = {};
    paidOrders.forEach((order) => {
      order.items.forEach((item) => {
        foodCounts[item.name] = (foodCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularFoods = Object.entries(foodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const allSplits = await splitModel.find({});
    let completedSplits = 0;
    let splitRevenue = 0;

    allSplits.forEach((split) => {
      const isCompleted = split.shares.every((share) => share.status === "Paid");
      if (isCompleted) {
        completedSplits++;
      }
      split.shares.forEach((share) => {
        if (share.status === "Paid") {
          splitRevenue += share.amount;
        }
      });
    });

    const splitStats = {
      totalSplits: allSplits.length,
      completedSplits,
      pendingSplits: allSplits.length - completedSplits,
      splitRevenue,
    };

    const recentOrders = await orderModel.find({}).sort({ date: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: allOrders.length,
        popularFoods,
        splitStats,
        recentOrders,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, getDashboardStats };
