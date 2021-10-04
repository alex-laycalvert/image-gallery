if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const server = express();
const expressEjsLayouts = require("express-ejs-layouts");
const logger = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const https = require("https");
const fs = require("fs");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const port = process.env.PORT || 8080;
const hostname = process.env.HOSTNAME || "localhost";

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION, SHUTTING DOWN SERVER");
    console.log(err.message, err.name);
    process.exit(1);
});

const User = require("./models/user");
const initializePassport = require("./config/passport");
initializePassport(
    passport,
    async (username) => {
        return await User.findOne({ username: username });
    },
    async (id) => {
        return await User.findById(id);
    }
);

// Connecting to MongoDB
mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
});
mongoose.connection.on("error", (err) => {
    console.log(err);
});
mongoose.connection.on("connected", (err, res) => {
    console.log("MongoDB has been connected");
});

server.use(logger("dev"));
server.set("views", path.join(__dirname, "views"));
server.use(expressEjsLayouts);
server.set("view engine", "ejs");
server.set("layout", "layouts/main");
server.use(express.static(path.join(__dirname, "public")));
server.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Passport mumbo jumbo
server.use(express.urlencoded({ extended: false }));
server.use(flash());
server.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
server.use(passport.initialize());
server.use(passport.session());

server.use(methodOverride("_method"));

server.use(require("./router"));

https
    .createServer(
        {
            key: fs.readFileSync(process.env.SERVER_KEY),
            cert: fs.readFileSync(process.env.SERVER_CERT),
        },
        server
    )
    .listen(port, () => {
        if (port == 80) {
            console.log(`Server is now listening at https://${hostname}`);
        } else {
            console.log(
                `Server is now listening at https://${hostname}:${port}`
            );
        }
    });
