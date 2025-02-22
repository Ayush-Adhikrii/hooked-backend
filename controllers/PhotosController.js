
import Photos from "../models/Photos.js";

export const findAll = async (req, res) => {
    try {
        const photos = await Photos.find();
        res.status(200).json(photos);

    } catch (e) {
        console.error("error finding photos", e)
    }
}

export const uploadPhoto = async (req, res, next) => {



    if (!req.file) {
        return res.status(400).send({ message: "Please upload a file" });
    }
    res.status(200).json({
        success: true,
        data: req.file.filename,
    });
};

export const savePhoto = async (req, res) => {
    try {
        const { userId, image } = req.body;
        let userPhoto = image || "default_profile.png";

        const newPhoto = await Photos.create({
            userId,
            image: userPhoto,
        });
        console.log("New photo created: in api", newPhoto);



        return res.status(201).json({
            success: true,
            message: "Photo uploaded successfully",
            user: {
                _id: newPhoto._id,
                userId: newPhoto.userId,
                image: newPhoto.image,
            },
        });

    } catch (error) {
        console.error("Error saving photo:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const findById = async (req, res) => {
    try {
        const photo = await Photos.findById(req.prams.id);
        if (!photo) {
            res.status(404).json({ message: "Not found" })
        }
        res.status(200).json(photo);
    } catch (e) {
        console.error("error finding photos", e)
    }
}

export const findPhotosByUserId = async (req, res) => {
    try {
        const photos = await Photos.find({ userId: req.params.userId }).sort({ _id: -1 }); // Sort by newest first

        if (!photos || photos.length === 0) {
            return res.status(404).json({ message: "No photos found" });
        }

        const lastFourPhotos = photos.slice(0, 4).map(photo => photo.image); // Get the last 4 photos
        res.status(200).json(lastFourPhotos);
    } catch (e) {
        console.error("Error finding photos", e);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const deleteById = async (req, res) => {
    try {
        const photo = await Photos.findByIdAndDelete(req.prams.id);
        if (!photo) {
            res.status(404).json({ message: "Not found" })
        }
        res.status(200).json(photo);
    } catch (e) {
        console.error("error deleting photo", e)
        res.status(500).json({ message: "internal server error" })
    }
}

export const update = async (req, res) => {
    try {
        const updatedPhoto = await Photos.findByIdAndUpdate(
            req.prams.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPhoto) {
            res.status(404).json({ message: "Not found" })
        }
        res.status(200).json(photo);
    } catch (e) {
        console.error("error updating photo", e)
    }
}
