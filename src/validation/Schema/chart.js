import Joi from "joi";

export const itemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().required(),
});

export const chartSchemaValidation = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
});

// export default chartSchemaValidation;
