/**
 * User Schema in MongoDB
 * @typedef {Object} User
 * @property {string} username - user name, has to be unique, serve as index attribute
 * @property {string} password - hashed value of user passowrd
 * @property {boolean} online - whether user is currently online
 * @property {UUID} private_id - internal ID for user lookup
 * @property {Date} createdAt - when the user account was created
 * @property {{easy: number, medium: number, high: number}} highScore - user high score for 3 different difficulty modes
 */

const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

const { Schema } = mongoose;

const UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		index: { unique: true },
	},
	password: {
		type: String,
		required: true,
	},
	online: {
		type: Boolean,
		default: true,
	},
	_id: {
		type: Schema.Types.UUID,
		default: () => randomUUID(),
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	highScore: {
		easy: { type: Number, default: 0 },
		medium: { type: Number, default: 0 },
		hard: { type: Number, default: 0 },
	},
});

UserSchema.pre("save", async function save(next) {
	if (!this.isModified("password")) return next();
	try {
		const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
		this.password = await bcrypt.hash(this.password, salt);
		return next();
	} catch (err) {
		return next(err);
	}
});

module.exports = mongoose.model("User", UserSchema);
