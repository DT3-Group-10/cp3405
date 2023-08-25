const mongoose = require("mongoose");
const User = require("./db/User");

const DB_URI =
	"mongodb+srv://group7:design3@cluster0.mdi62wp.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB_URI);

const testuser = new User({
	username: "sihan",
	highScore: {
		easy: 1,
		medium: 2,
		hard: 3,
	},
});

testuser.save().then(() => {
	console.log("user saved into DB!");
});

// main().catch((err) => console.log(err));

// async function main() {
// 	await mongoose.connect(DB_URI);
// 	console.log("db connected");
// 	const User = new mongoose.model("User", UserSchema, "snakegame");
// 	const testUser = new User({
// 		username: "testUser",
// 	});
// 	console.log("saving to db");
// 	testUser.save();
// 	console.log("done");
// }
