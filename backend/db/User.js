// user schema
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const { Schema } = mongoose;

const UserSchema = new Schema({
	username: String,
	online: {
		type: Boolean,
		default: true,
	},
	_id: {
		type: Schema.Types.UUID,
		default: () => randomUUID(),
	},
	creationDate: { type: Date, default: Date.now },
	highScore: { easy: Number, medium: Number, hard: Number },
});

module.exports = mongoose.model("User", UserSchema);
