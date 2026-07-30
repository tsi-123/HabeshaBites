import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    cartData: { type: Object, default: {} },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
  },
  { minimize: false }
);

// FIXED: was incorrectly `mongoose.model.user` (model is a function, not an object)
// Correct pattern: `mongoose.models.user` (models is the registry object)
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
