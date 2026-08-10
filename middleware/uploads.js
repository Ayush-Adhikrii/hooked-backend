import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const maxSize = 10 * 1024 * 1024; // 4MB

// Get the current file directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploaded photos live in this backend's own public folder and are served by
// server.js via express.static - the frontend fetches them as absolute URLs
// against the API origin, not as bare same-origin paths.
const profilePhotosDir = path.join(__dirname, "../public/profilePhotos");
fs.mkdirSync(profilePhotosDir, { recursive: true });

// Set up Multer storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, profilePhotosDir);
	},
	filename: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		cb(null, `IMG-${Date.now()}` + ext);
	},
});

const imageFileFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return cb(new Error("File format not supported."), false);
	}
	cb(null, true);
};

export const upload = multer({
	storage: storage,
	fileFilter: imageFileFilter,
	limits: { fileSize: maxSize },
}).single("profilePicture");
