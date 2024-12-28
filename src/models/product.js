import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const productSchema = mongoose.Schema(
  {
    productId: {
      type: Number,
      unique: true,
      default: 1,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(AutoIncrement, {
  inc_field: "productId",
});

const Product = mongoose.model("Products", productSchema);

export default Product;
