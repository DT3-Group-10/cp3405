/**
 * Express JS API module - Check {@tutorial mongodb-express-api-tutorial} for examples of how to make API calls
 * @module express-api-server
 */
const cors = require("cors");
const express = require("express");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const mongoose = require("mongoose");
const User = require("./models/User");

/**
 * MongoDB URI
 * @type {string} URI to connect to MongoDB for data modification
 */
const DB_URI =
	"mongodb+srv://group7:design3@cluster0.mdi62wp.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB_URI);

/**
 * API for generating new users in MongoDB.
 * @name new-users
 * @function
 * @param {string} path - express path
 * @returns {res} 200 if success, else 422 - failed to create user
 */
app.post("/new-user", (req, res) => {
	const newUser = new User(req.body);

	newUser
		.save()
		.then(() => {
			console.log(`user ${req.body.username} saved into DB!`);
			return res
				.status(200)
				.json({ success: true, message: `User ${req.body.username} Created` });
		})
		.catch((err) => {
			if (err.code === 11000) {
				// Duplicate username
				return res
					.status(422)
					.send({ succes: false, message: "User already exist!" });
			}
			return res.status(422).json({ success: false, message: err.message });
		});
});

/**
 * API for validating user password with MongoDB data, for users to log in.
 * @name login
 * @function
 * @param {string} path - express path
 * @returns {res} 200 if success, else 401 - failed to varify user
 */
app.post("/login", (req, res) => {
	const username = req.body.username;
	User.findOne({ username: username }).then((user) => {
		if (user === null) {
			return res.status(401).json({
				success: false,
				message: "Unable to find user!",
			});
		}
		bcrypt.compare(req.body.password, user.password, (err, result) => {
			if (result) {
				return res.status(200).json({
					success: true,
					message: `User ${username} logged in!`,
					data: user,
				});
			} else {
				return res.status(401).json({
					success: false,
					message: "Please check your username and password and try again!",
				});
			}
		});
	});
});

/**
 * API for updating user high score and other information
 * @name update-info
 * @function
 * @param {string} path - express path
 * @returns {res} 200 if success, else 401 - failed to update user info
 */
app.post("/update-info", (req, res) => {
	const username = req.body.username;
	if (username === undefined) {
		return res.status(422).json({
			success: false,
			message: "Missing data, unable to process request!",
		});
	}

	User.findOneAndUpdate(
		{ username: username },
		{ highScore: req.body.highScore },
		{ new: true }
	)
		.then((user) => {
			return res
				.status(200)
				.json({ success: true, message: `Highscore for ${username} updated!` });
		})
		.catch((err) => {
			return res.status(422).json({ success: false, message: err.message });
		});
});

/**
 * @param {number} PORT the port number which express server will run on
 * @property {Function} listen start express server for API calls
 * @returns void
 */
app.listen(PORT, () => {
	console.log(`Express JS is running on port ${PORT}`);
});
