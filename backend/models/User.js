// user schema
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
	creationDate: {
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
