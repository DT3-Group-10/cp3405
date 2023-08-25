const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;

const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const mongoose = require("mongoose");
const User = require("./models/User");

const DB_URI =
	"mongodb+srv://group7:design3@cluster0.mdi62wp.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB_URI);

// Create New User
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

// Login User
app.post("/login", (req, res) => {
	const username = req.body.username;
	User.findOne({ username: username }).then((user) => {
		bcrypt.compare(req.body.password, user.password, (err, result) => {
			if (result) {
				return res
					.status(200)
					.json({
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

// Update User Score
app.post("/update-score", (req, res) => {
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

app.listen(PORT, () => {
	console.log(`Express JS is running on port ${PORT}`);
});
