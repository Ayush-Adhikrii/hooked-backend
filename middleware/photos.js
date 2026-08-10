import multer from "multer";

const maxSize = 10 * 1024 * 1024; // 10MB

const imageFileFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return cb(new Error("File format not supported."), false);
	}
	cb(null, true);
};

// Buffered in memory, then streamed to Cloudinary by the controller
// (see utils/uploadToCloudinary.js) - never written to local disk.
export const photo = multer({
	storage: multer.memoryStorage(),
	fileFilter: imageFileFilter,
	limits: { fileSize: maxSize },
}).single("userPhoto");
