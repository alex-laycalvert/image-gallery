const router = require("express").Router();
const url = require("url");

const User = require("./../models/user");
const Image = require("./../models/image");

const checkAuth = require("./../middleware/check-auth");

router.get("/", async (req, res) => {
    let search = url.parse(req.url, true).query.search;
    let user;
    let images = [];
    let isAuthenticated;
    if (search) {
        if (search.trim() !== "") {
            let regexp = new RegExp(`\.*${search}.*`, "i");
            let results = await Image.find().or([
                { title: { $regex: regexp } },
                { uploader: { $regex: regexp } },
                { description: { $regex: regexp } },
            ]);
            if (req.isAuthenticated()) {
                user = await req.user;
                results.forEach((result) => {
                    if (
                        result.uploader == user.username ||
                        result.public ||
                        user.role == "ADMIN"
                    ) {
                        images.push(result);
                    }
                });
            } else {
                user = await User.findOne({
                    username: "___NULL___USER___",
                    name: "___NULL___USER___",
                    role: "USER",
                });
                results.forEach((result) => {
                    if (result.public) {
                        images.push(result);
                    }
                });
            }
        } else {
            res.redirect("back");
        }
    } else {
        if (req.isAuthenticated()) {
            user = await req.user;
            images = await Image.find({
                $or: [{ public: true }, { uploader: user.username }],
            });
            isAuthenticated = true;
        } else {
            user = await User.findOne({
                username: "___NULL___USER___",
                name: "___NULL___USER___",
                role: "USER",
            });
            images = await Image.find({
                public: true,
            });
            isAuthenticated = false;
        }
    }
    res.render("pages/gallery", {
        page: "gallery",
        isAuthenticated: isAuthenticated,
        user: user,
        images: images,
        search: search,
    });
});

router.get("/:slug", async (req, res) => {
    if (req.isAuthenticated()) {
        const user = await req.user;
        const image = await Image.findOne({
            slug: req.params.slug,
        });
        if (image.uploader == user.username) {
            res.redirect(`/user/gallery/${req.params.slug}`);
        } else {
            res.render("pages/gallery_image", {
                page: "gallery_image",
                user: user,
                isAuthenticated: true,
                image: image,
                search: null,
            });
        }
    } else {
        const user = await User.findOne({
            username: "___NULL___USER___",
            name: "___NULL___USER___",
            role: "USER",
        });
        const image = await Image.findOne({
            slug: req.params.slug,
            public: true,
        });
        res.render("pages/gallery_image", {
            page: "gallery_image",
            user: user,
            isAuthenticated: false,
            image: image,
            search: null,
        });
    }
});

router.put("/edit/:id", async (req, res) => {
    try {
        let image = await Image.findById(req.params.id);
        image.title = req.body.title;
        image.description = req.body.description;
        await image.save();
        res.redirect(`/gallery/${image.slug}`);
    } catch (error) {
        console.log(error);
        res.json({
            error,
        });
    }
});

router.get("/:search", async (req, res) => {
    console.log("Went to search page");
    // console.log(req.url);
    // let searchTerm = url.parse(req.url, true).query.search;
    // console.log(searchTerm);
    // if (searchTerm.split(" ")[0] === "") {
    //     res.redirect("back");
    // } else {
    //     let regexp = new RegExp(`\.*${searchTerm}.*`, "i");
    //     let user;
    //     let isAuthenticated;
    //     if (req.isAuthenticated()) {
    //         user = await User.findById(req.user.id);
    //         isAuthenticated = true;
    //     } else {
    //         user = await User.find({
    //             name: "___NULL___USER___",
    //             username: "___NULL___USER___",
    //             role: "USER",
    //         });
    //         isAuthenticated = false;
    //     }
    //     const images = await File.find().or([
    //         { title: { $regex: regexp } },
    //         { uploader: { $regex: regexp } },
    //         { description: { $regex: regexp } },
    //     ]);
    //     res.render("pages/gallery_search", {
    //         page: "gallery_search",
    //         searchTerm: searchTerm,
    //         images: images,
    //         user: user,
    //         isAuthenticated: isAuthenticated,
    //     });
    // }
});

module.exports = router;
