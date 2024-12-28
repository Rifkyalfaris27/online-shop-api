import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error(
        "Invalid file type format, only JPEG, PNG, and JPG are allowed"
      ),
      false
    );
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 2MB
  },
  fileFilter,
});

export default upload;

// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Mendapatkan __dirname di ES Module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "uploads"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

//   if (!allowedTypes.includes(file.mimetype)) {
//     cb(
//       new Error(
//         "Invalid file type format, only JPEG, PNG, and JPG are allowed",
//         false
//       )
//     );
//   } else {
//     cb(null, true);
//   }
// };

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 2 * 1024 * 1024,
//   },
//   fileFilter,
// });

// export default upload;
