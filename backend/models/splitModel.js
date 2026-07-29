import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({

    orderId:{
        type:String,
        required:true
    },

    total:{
        type:Number,
        required:true
    },

    people:{
        type:Number,
        required:true
    },

    
    shares: [
  {
    token: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Waiting", "Paid", "Expired"],
      default: "Waiting",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
],

},{timestamps:true});

const splitModel =
mongoose.models.split ||
mongoose.model("split",splitSchema);

export default splitModel;