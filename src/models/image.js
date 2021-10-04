const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    title: {
        type: String,
        require: [true, "Uploaded image must have a title"],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    uploader: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    public: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        required: [true, "Uploaded image must have a name"],
    },
    shortName: {
        type: String,
        required: true,
    },
});

imageSchema.pre("validate", function (next) {
    if (!this.createdAt) {
        this.createdAt = Date.now();
    }
    if (!this.shortName) {
        this.shortName = this.name.split("/")[1].split(".")[0];
    }
    next();
});

module.exports = mongoose.model("Image", imageSchema);
