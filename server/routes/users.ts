import { Router } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/User";

const usersRouter = Router();

/**
 * @route   POST api/users
 * @desc    Create a user
 */
usersRouter.post("", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check that user is admin
    if (req.user.role !== "admin")
      throw Error("You don't have permission to create users");

    // Simple validation
    if (!username || !password) {
      return res.status(400).json({
        msg: "Please enter all required fields",
      });
    }

    // Check that username is not duplicate
    const checkUsername = await UserModel.findOne({ username }).exec();
    if (checkUsername) throw Error("Username is already registered");

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username,
      password: hash,
      role: role || "regular",
    });

    // Save user to db
    const savedUser = await newUser.save();
    if (!savedUser) throw Error("Unexpected error creating the user");

    res.status(201).json({
      username: savedUser.username,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    });
  } catch (e) {
    res.status(500).json({
      msg: e.message,
    });
  }
});

/**
 * @route   GET api/users/is-admin
 * @desc    Check if a user is an admin
 */
usersRouter.get("/is-admin", async (req, res) => {
  try {
    // Check that user is admin
    res.status(200).json(req.user?.role === "admin");
  } catch (e) {
    res.status(500).json({
      msg: e.message,
    });
  }
});

export default usersRouter;
