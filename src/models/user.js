const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.pre("validate", async function (next) {
    if (this.password) {
        try {
            console.log(this.password);
            const hash = await bcrypt.hash(this.password, 10);
            this.password = hash;
        } catch (e) {
            if (e) console.log(e);
        }
    }
    if (!this.role) {
        this.role = "USER";
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
