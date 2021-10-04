const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/home/alex/Projects/image-gallery_LOCAL/src/public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `images/${file.originalname}`);
    },
});

const filter = (req, file, cb) => {
    let ext = file.mimetype.split("/")[1];
    if (
        ext === "jpg" ||
        ext === "JPG" ||
        ext === "jpeg" ||
        ext === "JPEG" ||
        ext === "png" ||
        ext === "PNG"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Invalid Image Format"), false);
    }
};

module.exports = {
    storage,
    filter,
};
