const express = require("express");
const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");

router.use(express.json());

router.get("/", (req, res, next) => {
	res.json("hello");
});

module.exports = app => {
	app.use("/users", router);
};
