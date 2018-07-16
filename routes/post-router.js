const express = require("express");
const router = express.Router();
const Post = require('../models/Post');
const mongoose = require('mongoose');

router.use(express.json());

router.get('/', (req, res, next) => {
    res.json("Hi from post router.")
})

module.exports = (app) => {
    app.use('/posts', router)
}
