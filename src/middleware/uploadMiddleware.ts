import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const filterFile = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: any
) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Image & PDF Files!"), false);
  }
};

const upload = multer({ storage, fileFilter: filterFile }).fields([
  { name: "cv", maxCount: 1 },
  { name: "krs", maxCount: 1 },
  { name: "pasFoto", maxCount: 1 },
  { name: "ktm", maxCount: 1 },
  { name: "ktp", maxCount: 1 },
  { name: "rangkumanNilai", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
]);
export default upload;
