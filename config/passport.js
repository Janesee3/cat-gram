const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const User = require("../models/User");

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: "some_secret"
};

// Will be called during passport.authenticate
const verify = async (jwt_payload, done) => {
	console.log(jwt_payload);
	const user = await User.findOne({ _id: jwt_payload.userId });
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
