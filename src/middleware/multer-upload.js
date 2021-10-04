const multer = require("multer");

const config = require("./../config/multer");

const upload = multer({
    storage: config.storage,
    fileFilter: config.filter,
});

module.exports = upload;
