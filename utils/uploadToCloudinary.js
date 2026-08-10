import cloudinary from "../config/cloudinary.js";

// multer keeps the file in memory (see middleware/uploads.js and
// middleware/photos.js) rather than writing it to local disk, since disk
// storage doesn't survive a redeploy/restart on most hosts. This streams
// that in-memory buffer straight to Cloudinary instead.
export const uploadBufferToCloudinary = (buffer, folder) =>
	new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
			if (error) return reject(error);
			resolve(result);
		});
		stream.end(buffer);
	});
