const mongoose = require("mongoose");

// Create schema
const postSchema = mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // String must be the same as the string in Author model!
			required: [true, "User ID is required!"]
			// validate: {
			// 	validator: user => {
			// 		return User.findById(user); // returns false if cant find such author with this id
			// 	},
			// 	message: "Cannot find user with this ID."
			// }
		},
		caption: { type: String, required: [true, "Caption is required!"] },
		image: { type: String, required: [true, "Image url is required!"] },
		likes: Number
	},
	{ timestamps: true }
);

// Model
const post = mongoose.model("Post", postSchema);

module.exports = post;
