const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => {
        const user = await getUserByUsername(username);
        console.log(user);
        if (user == null) {
            console.log("No user with that username");
            return done(null, false, { message: "No user with that username" });
        }
        try {
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(isMatch);
            if (await bcrypt.compare(password, user.password)) {
                console.log("Login successful");
                return done(null, user);
            } else {
                console.log("Password is incorrect");
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            return done(e);
        }
    };

    passport.use(
        new LocalStrategy({ usernameField: "username" }, authenticateUser)
    );
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initialize;
