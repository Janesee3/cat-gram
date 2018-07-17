const mongoose = require("mongoose");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, "username is required!"],
		match: [/^[a-zA-Z0-9]+$/, "username format is invalid"],
		lowercase: true,
		unique: true,
		index: true
	},
	bio: String,
	bookmarked: [{ type: ObjectId, ref: "Post" }],
	likes: [{ type: ObjectId, ref: "Post" }],
	hash: String,
	salt: String
});

userSchema.plugin(uniqueValidator, { message: "username should be unique" });

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.setHashedPassword = function(password) {
	this.salt = generateSalt();
	this.hash = hashPassword(password, this.salt);
};

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.validatePassword = function(password) {
	if (!password) return false;
	return this.hash === hashPassword(password, this.salt);
};

const generateSalt = () => {
	return crypto.randomBytes(16).toString("hex");
};

const hashPassword = (password, salt) => {
	const hash = crypto
		.pbkdf2Sync(password, salt, 10000, 512, "sha512")
		.toString("hex");
	return hash;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
