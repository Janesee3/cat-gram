const mongoose = require("mongoose");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, "username is required!"],
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

userSchema.plugin(uniqueValidator, { message: "should be unique" });

const user = mongoose.model("User", userSchema);

module.exports = user;
