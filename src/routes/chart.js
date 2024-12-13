import express from "express";
import Chart from "../models/chart.js";
import Product from "../models/product.js";
import {
  chartSchemaValidation,
  itemSchema,
} from "../validation/Schema/chart.js";

const router = express.Router();

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated === true) {
    return next();
  }
  // return res.status(401).send({ message: "Unauthorized: Please login first." });
  return res.status(401).send({
    message: "Unauthorized: Please login first.",
    sessionDetails: {
      isAuthenticated: req.session.isAuthenticated,
      userId: req.session.userId,
      name: req.session.name,
    },
  });
}

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const username = req.session.name;
    console.log("user id : ", userId);

    const userChart = await Chart.findOne({ userId }).populate({
      path: "items.productId",
      model: "Products",
    });
    // const userChart = await Chart.findOne({ userId });
    console.log("userChart : ", userChart);

    if (!userChart) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("userChart : ", userChart);

    const response = {
      user_id: userId,
      username,
      items: userChart.items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        description: item.productId.description,
        price: item.productId.price,
        quantity: item.quantity,
      })),
    };

    res.status(200).send({
      message: "User chart found",
      data: response,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
    console.log(error.message);
  }
});

router.post("/product", isAuthenticated, async (req, res) => {
  // Validasi request body menggunakan Joi
  const { error, value } = chartSchemaValidation.validate(req.body);

  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { userId, items } = value;
  console.log(value);

  try {
    let userChart = await Chart.findOne({ userId });

    if (!userChart) {
      // Jika chart belum ada, buat chart baru
      userChart = new Chart({ userId, items });
      await userChart.save();

      return res.status(201).json({
        message: "Chart created successfully",
        data: userChart,
      });
    }

    // Update chart jika sudah ada
    items.forEach(({ productId, quantity, price }) => {
      const productIndex = userChart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex !== -1) {
        userChart.items[productIndex].quantity += quantity;
      } else {
        // Tambahkan produk baru jika belum ada
        userChart.items.push({ productId, quantity });
      }
    });

    // Simpan perubahan pada chart
    await userChart.save();

    return res.status(200).json({
      message: "Chart updated successfully",
      data: userChart.items,
    });
  } catch (error) {
    console.error("Error processing chart:", error);
    return res.status(500).send({ message: "Server error" });
  }
});

router.patch(
  "/product/updateQuantity/:productId",
  isAuthenticated,
  async (req, res) => {
    try {
      const userId = req.session.userId;
      const username = req.session.name;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (!productId || !quantity || quantity < 1) {
        return res.status(400).send({ message: "Invalid data" });
      }

      // Cari chart pengguna berdasarkan userId
      const userChart = await Chart.findOne({ userId }).populate({
        path: "items.productId",
        model: "Products",
      });

      if (!userChart) {
        return res.status(404).send({ message: "User not found" });
      }

      // Cari produk dalam chart
      const productIndex = userChart.items.findIndex(
        (item) => item.productId._id.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).send({ message: "Product not found in chart" });
      }

      // Update quantity produk
      userChart.items[productIndex].quantity = quantity;

      // Simpan perubahan pada chart
      await userChart.save();

      const response = {
        user_id: userId,
        username,
        items: userChart.items.map((item) => ({
          productId: item.productId._id, // ID produk
          name: item.productId.name, // Nama produk
          description: item.productId.description, // Deskripsi produk
          price: item.productId.price, // Harga produk
          quantity: item.quantity, // Jumlah di keranjang
        })),
      };

      return res.status(200).json({
        message: "Product quantity updated successfully",
        data: userChart.items[productIndex],
        // data: response,
      });
    } catch (error) {
      console.error("Error updating product quantity:", error);
      return res.status(500).send({ message: "Server error" });
    }
  }
);

export default router;
