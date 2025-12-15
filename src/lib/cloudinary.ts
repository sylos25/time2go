import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary using environment variables.
// Supported: either set CLOUDINARY_URL (cloudinary://<key>:<secret>@<cloud_name>)
// or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.
const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_URL) {
	cloudinary.config({ url: CLOUDINARY_URL, secure: true });
} else if (CLOUD_NAME && API_KEY && API_SECRET) {
	cloudinary.config({
		cloud_name: CLOUD_NAME,
		api_key: API_KEY,
		api_secret: API_SECRET,
		secure: true,
	});
} else {
	// Throw a helpful error early so it's obvious why uploads fail.
	throw new Error(
		"Cloudinary environment variables are missing. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET"
	);
}

// Helper to upload a Buffer to Cloudinary and return the full result object.
export async function uploadBuffer(
	buffer: Buffer,
	folder = "eventos",
	options: Record<string, any> = {}
) {
	return new Promise<any>((resolve, reject) => {
		try {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder, ...options },
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				}
			);
			streamifier.createReadStream(buffer).pipe(uploadStream);
		} catch (err) {
			reject(err);
		}
	});
}

export { cloudinary };