import express from "express";
import Product from "../models/product.js";
// import productSchema from "../validation/Schema/product.js";
import {
  productSchema,
  editProductSchema,
} from "../validation/Schema/product.js";
import upload from "../Handler/imageUploadHandler.js";
import dotenv from "dotenv";
import claudinaryHandler from "../Handler/claudinaryHandler.js";

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});

    const total = products.length;

    return res.status(200).json({
      message: "All products found",
      total: total,
      data: products,
    });
  } catch (error) {
    res.status(404).send(error.message);
    console.error(error.message);
  }
});

router.post("/product", upload.single("productImage"), async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "product image is required" });
    }

    if (!req.file.mimetype.startsWith("image")) {
      return res.status(400).json({ message: "Invalid image type" });
    }

    const uploadResult = await claudinaryHandler(req.file.buffer);

    const product = new Product({
      ...value,
      image: uploadResult,
    });

    // await Product.create(product);
    await product.save()

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(error.message);
  }
});

// router.post("/product", upload.single("productImage"), async (req, res) => {
//   try {
//     const { error, value } = productSchema.validate(req.body);

//     if (error) {
//       return res.status(400).json({ message: error.details[0].message });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "product image is required" });
//     }

//     if (!req.file.mimetype.startsWith("image")) {
//       return res.status(400).json({ message: "Invalid image type" });
//     }

//     let productImage = null;
//     if (req.file) {
//       productImage = `localhost:${process.env.PORT}/api/uploads/${req.file.filename}`;
//     }

//     const product = new Product({
//       ...value,
//       image: productImage,
//     });
//     await Product.create(product);

//     return res.status(201).json({
//       message: "Product created successfully",
//       data: product,
//     });
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//     console.log(error.message);
//   }
// });

router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(404).json({ message: "Invalid product id" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "getting product successfully", data: product });
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.error(error.message);
  }
});

router.patch(
  "/edit/product/:productId",
  upload.single("productImage"),
  async (req, res) => {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({ message: "Invalid product id" });
      }

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updates = { ...req.body };
      if (req.file) {
        updates.image = req.file.path;
      }

      const { error } = editProductSchema.validate(req.body);

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updates
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json({
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
      console.error(error.message);
    }
  }
);

router.delete("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(404).json({ message: "Invalid product id" });
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).send({ message: "deleting product successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(error.message);
  }
});

export default router;
