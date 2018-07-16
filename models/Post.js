const mongoose = require("mongoose");

// Create schema
const postSchema = mongoose.Schema(
	{
		author: { type: String, required: true }, // for now
		caption: { type: String, required: true },
		image: { type: String, required: true },
		likes: Number
	},
	{ timestamps: true }
);

// Model
const post = mongoose.model("Post", postSchema);

module.exports = post;
