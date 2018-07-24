const express = require("express");
const { passport } = require("../config/passport");
const errorHandler = require("../middlewares/error-handler");
const isUserAuthorisedForPostAction = require("../middlewares/post-action-authorisation-checker");
const postServices = require("../services/post-services");

const unprotectedRoutes = express.Router();
const protectedRoutes = express.Router();

unprotectedRoutes.get("/", postServices.getAllPosts);

unprotectedRoutes.get("/:id", postServices.getPostById);

protectedRoutes.post("/", postServices.createNewPost);

protectedRoutes.put(
  "/:id",
  isUserAuthorisedForPostAction,
  postServices.updatePost
);

protectedRoutes.delete(
  "/:id",
  isUserAuthorisedForPostAction,
  postServices.deletePost
);

module.exports = app => {
  app.use(express.json());
  app.use("/posts", unprotectedRoutes, errorHandler);
  app.use(
    "/posts",
    passport.authenticate("jwt", { session: false }),
    protectedRoutes,
    errorHandler
  );
};
