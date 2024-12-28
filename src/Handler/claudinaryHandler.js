import { v2 as cloudinary } from "cloudinary";
import stream from "stream";
import dotenv from "dotenv";
dotenv.config();

const claudinaryHandler = async (fileBuffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.IMAGE_API_KEY,
    api_secret: process.env.IMAGE_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" }, // Opsi tambahan (opsional)
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url); // Mengembalikan URL hasil upload
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

export default claudinaryHandler;

// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";
// dotenv.config();

// const claudinaryHandler = async (imageUpload) => {
//   // Configuration
//   cloudinary.config({
//     cloud_name: "dt3vyqfhm",
//     api_key: process.env.API_KEY,
//     api_secret: process.env.IMAGE_API_SECRET, // Click 'View API Keys' above to copy your API secret
//   });

//   // Upload an image
//   const uploadResult = await cloudinary.uploader
//     .upload(
//       imageUpload,
//     )
//     .catch((error) => {
//       console.log(error);
//     });

//   console.log(uploadResult);

//   // Optimize delivery by resizing and applying auto-format and auto-quality
//   const optimizeUrl = cloudinary.url(uploadResult.public_id, {
//     fetch_format: "auto",
//     quality: "auto",
//   });

// //   console.log(optimizeUrl);

//   // Transform the image: auto-crop to square aspect_ratio
// //   const autoCropUrl = cloudinary.url("shoes", {
// //     crop: "auto",
// //     gravity: "auto",
// //     width: 500,
// //     height: 500,
// //   });

// //   console.log(autoCropUrl);
// };

// export default claudinaryHandler;
