import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  // image: Joi.string().required(),
});

export const editProductSchema = Joi.object({
  name: Joi.string().optional(), // Tidak wajib, hanya jika ingin diperbarui
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  stock: Joi.number().optional(),
  // image: Joi.string().optional(),
});

// import Joi from "joi";

// export const productSchema = Joi.object({
//   name: Joi.string().required(),
//   description: Joi.string().required(),
//   price: Joi.number().required(),
//   quantity: Joi.number().required(),
//   // image: Joi.string().required(),
// });

// export const editProductSchema = Joi.object({
//   name: Joi.string().optional(), // Tidak wajib, hanya jika ingin diperbarui
//   description: Joi.string().optional(),
//   price: Joi.number().optional(),
//   quantity: Joi.number().optional(),
//   // image: Joi.string().optional(),
// });
