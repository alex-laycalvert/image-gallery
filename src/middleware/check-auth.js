function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/user/login");
}

function checkNotAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect("/user/account");
}

module.exports = {
	checkAuthenticated,
	checkNotAuthenticated,
};
