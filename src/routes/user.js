const router = require("express").Router();

const passport = require("passport");

const User = require("./../models/user");
const Image = require("./../models/image");
const checkAuth = require("./../middleware/check-auth");
const image = require("./../models/image");

router.get("/", (req, res) => {
    res.redirect("/user/account");
});

router.get("/login", checkAuth.checkNotAuthenticated, (req, res) => {
    // deleteAllUsers();
    res.render("pages/user_login", {
        page: "user_login",
        isAuthenticated: false,
        search: null,
    });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/user/account",
        failureRedirect: "/user/login",
        failureFlash: true,
    })
);

router.get("/signup", checkAuth.checkNotAuthenticated, (req, res) => {
    res.render("pages/user_signup", {
        page: "user_signup",
        isAuthenticated: false,
        search: null,
    });
});

router.post("/signup", async (req, res) => {
    if (req.body == null) {
        res.redirect("back");
    } else {
        try {
            let role;
            if (req.body.role != null) {
                role = req.body.role;
            }
            const user = await User.create({
                name: req.body.name,
                username: req.body.username,
                role: role,
                password: req.body.password,
            });
            res.redirect("/user/login");
        } catch (e) {
            console.log(e);
            res.redirect("/user/signup");
        }
    }
});

router.get("/admin", checkAuth.checkAuthenticated, async (req, res) => {
    const user = await req.user;
    const users = await User.find();
    const images = await Image.find();
    if (user.role != "ADMIN") {
        res.redirect("/user/admin/invalid_role");
    } else {
        res.render("pages/user_admin", {
            page: "user_admin",
            isAuthenticated: true,
            user: user,
            users: users,
            images: images,
            search: null,
        });
    }
});

router.get("/admin/user", (req, res) => {
    res.redirect("/user/account");
});

router.get("/admin/user/:id", async (req, res) => {});

router.get(
    "/admin/invalid_role",
    checkAuth.checkAuthenticated,
    async (req, res) => {
        const user = await req.user;
        if (user.role == "ADMIN") {
            res.redirect("/user/admin");
        } else {
            res.render("pages/user_admin_invalid_role", {
                page: "user_admin_invalid_role",
                isAuthenticated: true,
                user: user,
                search: null,
            });
        }
    }
);

router.get("/account", checkAuth.checkAuthenticated, async (req, res) => {
    const user = await req.user;
    let images;
    if (user.role == "ADMIN") {
        images = await Image.find();
    } else {
        images = await Image.find({
            uploader: user.username,
        });
    }
    res.render("pages/user_account", {
        page: "user_account",
        user: user,
        isAuthenticated: true,
        images: images,
        search: null,
    });
});

router.get("/gallery", checkAuth.checkAuthenticated, async (req, res) => {
    const user = await req.user;
    const images = await Image.find({
        uploader: user.username,
    });
    res.render("pages/gallery", {
        page: "user_gallery",
        user: user,
        isAuthenticated: true,
        images: images,
        search: null,
    });
});

router.get("/gallery/:slug", checkAuth.checkAuthenticated, async (req, res) => {
    const user = await req.user;
    const image = await Image.findOne({
        slug: req.params.slug,
        uploader: user.username,
    });
    res.render("pages/user_gallery_image", {
        page: "user_gallery_image",
        user: user,
        isAuthenticated: true,
        image: image,
        search: null,
    });
});

router.get(
    "/gallery/edit/:slug",
    checkAuth.checkAuthenticated,
    async (req, res) => {
        const user = await req.user;
        const image = await Image.findOne({
            slug: req.params.slug,
            uploader: user.username,
        });
        res.render("pages/user_gallery_edit_image", {
            page: "user_gallery_edit_image",
            user: user,
            isAuthenticated: true,
            image: image,
            search: null,
        });
    }
);

router.put("/gallery/edit/:id", async (req, res) => {
    try {
        let image = await Image.findById(req.params.id);
        image.title = req.body.title;
        image.description = req.body.description;
        await image.save();
        res.redirect(`/user/gallery/${image.slug}`);
    } catch (error) {
        console.log(error);
        res.json({
            error,
        });
    }
});

router.delete("/gallery/:id", async (req, res) => {
    await Image.findByIdAndDelete(req.params.id);
    res.redirect("back");
});

router.delete("/admin/users/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (req.user.role == "ADMIN") {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("back");
    } else {
        req.logout();
        user.delete();
        res.redirect("/gallery");
    }
});

router.delete("/logout", checkAuth.checkAuthenticated, (req, res) => {
    req.logout();
    res.redirect("back");
});

module.exports = router;

// only for testing before implementing the option to delete a user on the webpage
async function deleteAllUsers() {
    try {
        await User.deleteMany();
    } catch (err) {
        console.log(err);
    }
}

async function deleteAllImages() {
    try {
        await Image.deleteMany();
    } catch (err) {
        console.log(err);
    }
}
