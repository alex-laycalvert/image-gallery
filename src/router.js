const router = require("express").Router();

router.get("/", (req, res) => {
    res.redirect("/gallery");
});

router.use("/gallery", require("./routes/gallery"));
router.use("/user", require("./routes/user"));
router.use("/upload", require("./routes/upload"));

module.exports = router;
