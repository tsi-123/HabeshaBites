import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

// Add a review for a food item
const addReview = async (req, res) => {
  try {
    const { userId, foodId, rating, comment } = req.body;
    if (!foodId || !rating || !comment) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const review = new reviewModel({
      foodId,
      userId,
      userName: user.name,
      rating: Number(rating),
      comment,
    });

    await review.save();

    // Recalculate average rating for this food item
    const reviews = await reviewModel.find({ foodId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / reviews.length).toFixed(1));

    // Update the average rating in food model
    await foodModel.findByIdAndUpdate(foodId, { rating: avgRating });

    res.json({
      success: true,
      message: "Review submitted successfully!",
      data: review,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all reviews for a food item
const getReviews = async (req, res) => {
  try {
    const { foodId } = req.params;
    const reviews = await reviewModel.find({ foodId }).sort({ createdAt: -1 });

    let avgRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = Number((totalRating / reviews.length).toFixed(1));
    }

    res.json({
      success: true,
      reviews,
      avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addReview, getReviews };
