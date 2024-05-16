const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    role:{type: String, default: 'user'},
    rating: {type: Number, default: 0},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
