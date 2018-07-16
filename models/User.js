const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
	username: { type: String, required: [true, "username is required!"] },
	bio: String,
    bookmarked: [{type: ObjectId, ref: 'Post'}],
    likes: [{type: ObjectId, ref: 'Post'}]
});

const user = mongoose.model("User", userSchema);

module.exports = user;
