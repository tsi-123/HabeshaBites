import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    foodId: { type: String, required: true },
  },
  { timestamps: true }
);

const favouriteModel =
  mongoose.models.favourite || mongoose.model("favourite", favouriteSchema);

export default favouriteModel;
