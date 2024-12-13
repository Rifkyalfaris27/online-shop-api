import mongoose from "mongoose";

const connection = async () => {
  try {
    console.log("trying to connect");
    await mongoose.connect(process.env.MONGODB_URL, {});
    console.log("connect succeeded");
    console.log(mongoose.Collection.name)
  } catch (error) {
    console.error("Error connecting", error.message);
  }
};

export default connection;
