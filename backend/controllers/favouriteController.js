import favouriteModel from "../models/favouriteModel.js";
import foodModel from "../models/foodModel.js";

// Get user favourites
const getFavourites = async (req, res) => {
  try {
    const { userId } = req.body;
    const favourites = await favouriteModel.find({ userId });
    const foodIds = favourites.map((fav) => fav.foodId);
    const foods = await foodModel.find({ _id: { $in: foodIds } });
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add food to favourites
const addFavourite = async (req, res) => {
  try {
    const { userId, foodId } = req.body;
    if (!foodId) {
      return res.json({ success: false, message: "Food ID is required" });
    }
    const exists = await favouriteModel.findOne({ userId, foodId });
    if (exists) {
      return res.json({ success: true, message: "Already in favorites" });
    }
    const newFav = new favouriteModel({ userId, foodId });
    await newFav.save();
    res.json({ success: true, message: "Added to Favourites" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Remove food from favourites
const removeFavourite = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Check if id is foodId or the favorite record's _id
    let fav = await favouriteModel.findOneAndDelete({ userId, foodId: id });
    if (!fav) {
      fav = await favouriteModel.findOneAndDelete({ _id: id, userId });
    }

    if (fav) {
      res.json({ success: true, message: "Removed from Favourites" });
    } else {
      res.json({ success: false, message: "Favourite not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getFavourites, addFavourite, removeFavourite };
