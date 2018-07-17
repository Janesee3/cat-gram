const Post = require("../models/Post");
const User = require("../models/User");

const _addMockUsers = async mockUsers => {
	const user1 = new User({
		username: "MockUser1",
		bio: "Hello Im mock user 1"
	});

	const user2 = new User({
		username: "MockUser2",
		bio: "Hello Im mock user 2"
	});

	mockUsers.user1 = await user1.save();
	mockUsers.user2 = await user2.save();
};

const _addMockPosts = async (mockUsers, mockPosts) => {
	const post1 = new Post({
		author: mockUsers.user1._id,
		caption: "Cheesy caption for post1",
		image: "https://sampleurl.com"
	});

	const post2 = new Post({
		author: mockUsers.user2._id,
		caption: "my caption for post 2",
		image: "https://sampleurl.com"
	});

	mockPosts.post1 = await post1.save();
	mockPosts.post2 = await post2.save();
};

addFakeData = async (mockUsers, mockPosts) => {
	await _addMockUsers(mockUsers);
	await _addMockPosts(mockUsers, mockPosts);
};

module.exports = {
	addFakeData
};
