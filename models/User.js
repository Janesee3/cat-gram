const mongoose = require("mongoose");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "username is required!"],
			match: [/^[a-zA-Z0-9]+$/, "username format is invalid"],
			lowercase: true,
			unique: true,
			index: true
		},
		bio: { type: String, default: "" },
		bookmarked: {
			type: [{ type: ObjectId, ref: "Post" }],
			validate: {
				validator: bookmarkArray => {
					const bookmarkStrings = bookmarkArray.map(id => id.toString()); // Convert to string so that Set will not use object equality
					return bookmarkStrings.length === new Set(bookmarkStrings).size;
				},
				message: "Cannot have duplicates in the bookmark list!"
			},
			default: []
		},
		likes: {
			type: [{ type: ObjectId, ref: "Post" }],
			validate: {
				validator: likesArray => {
					const postStrings = likesArray.map(id => id.toString()); // Convert to string so that Set will not use object equality
					return postStrings.length === new Set(postStrings).size;
				},
				message: "Cannot have duplicates in the likes list!"
			},
			default: []
		},
		hash: String,
		salt: String
	},
	{ timestamps: true }
);

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

userSchema.methods.toDisplay = function() {
	let smallObject = {
		_id: this._id,
		username: this.username,
		bio: this.bio,
		likes: this.likes,
		bookmarked: this.bookmarked,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt
	};
	return smallObject;
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
