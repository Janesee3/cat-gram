const Post = require("../models/Post");
const { getNotFoundError } = require("../utility/custom-errors");
const ERR_POST_NOT_FOUND_MSG = "Cannot find post with this id!";


const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("author", "username bio _id"); // 'author' here refers to the KEY name inside the Post model!
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

const getPostById = async (req, res, next) => {
	try {
		let post = await Post.findById(req.params.id).populate(
			"author",
			"username bio _id"
		);
		if (!post)  return next(getNotFoundError(ERR_POST_NOT_FOUND_MSG));
		res.json(post);
	} catch (err) {
		next(err);
    }
}

const createNewPost = async (req, res, next) => {
	const newPost = new Post({
		author: req.user._id, // id of the currently authenticated user
		caption: req.body.caption,
		image: req.body.image
	});

	try {
		let createdPost = await newPost.save();
		res.status(201).json({
			message: `Successfully created a new post.`,
			post: createdPost
		});
	} catch (err) {
		next(err);
	}
}

const updatePost = 	async (req, res, next) => {
    try {
        let post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        res.json(post);
    } catch (err) {
        next(err);
    }
}

const deletePost = 	async (req, res, next) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({
            message: `Successfully deleted post with ID ${req.params.id}.`
        });
    } catch (err) {
        next(err);
    }
}



module.exports = {
  getAllPosts,
  getPostById,
  createNewPost,
  updatePost,
  deletePost
};
