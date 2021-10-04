const router = require("express").Router();
const slugify = require("slugify");

const checkAuth = require("./../middleware/check-auth");
const upload = require("./../middleware/multer-upload");

const Image = require("./../models/image");

router.get("/", checkAuth.checkAuthenticated, async (req, res) => {
    const user = await req.user;
    res.render("pages/upload", {
        page: "upload",
        user: user,
        isAuthenticated: true,
        search: null,
    });
});

router.post("/image/single", upload.single("image"), async (req, res) => {
    if (req.file == null) {
        res.redirect("/upload");
    } else {
        try {
            const user = await req.user;
            let pub;
            if (req.body.public == "Yes") {
                pub = true;
            } else {
                pub = false;
            }
            const image = await Image.create({
                title: req.body.title,
                uploader: user.username,
                description: req.body.description,
                public: pub,
                name: req.file.filename,
                slug: slugify(req.body.title, {
                    lower: true,
                    strict: true,
                }),
            });
            image.slug += "_" + image.createdAt.getTime();
            await image.save();
            res.redirect(`/user/gallery/${image.slug}`);
        } catch (error) {
            console.log(error);
            res.json({
                error,
            });
        }
    }
});

module.exports = router;
