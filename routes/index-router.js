const express = require("express");
const router = express.Router();

router.use(express.json());

router.get("/", (req, res) => {
	res.json("CatGram API is up!");
});
module.exports = app => {
	app.use("/", router);
};
