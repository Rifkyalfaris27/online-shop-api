import mongoose, { mongo } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const chartSchema = mongoose.Schema({
  chartId: {
    type: String,
    default: () => uuidv4(),
  },
  userId: {
    type: String, // mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        // type: String, // mongoose.Schema.Types.ObjectId,
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      // price: {
      //   type: Number,
      //   required: true,
      // },
    },
  ],
});

const Chart = mongoose.model("Chart", chartSchema);

export default Chart;
