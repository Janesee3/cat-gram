const express = require("express");
const router = express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');

router.use(express.json());

router.get('/', async (req, res, next) => {
    try {
		const posts = await Post.find().populate("author"); // 'author' here refers to the KEY name inside the Post model!
		res.json(posts);
	} catch (err) {
		next(err);
	}
})

module.exports = (app) => {
    app.use('/posts', router)
}
