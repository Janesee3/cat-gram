const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const User = require("../models/User");

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET || "some_secret"
};

// Will be called during passport.authenticate
const verify = async (jwt_payload, done) => {
	const user = await User.findById(jwt_payload.userId);
	if (user) {
		done(null, user);
	} else {
		done(null, false);
	}
};

const jwtStrategy = new JwtStrategy(jwtOptions, verify);

passport.use(jwtStrategy);

module.exports = {
	passport,
	jwtOptions
};
