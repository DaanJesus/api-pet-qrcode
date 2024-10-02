const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, uniq: true },
    password: { type: String, required: true },
    tag: { type: String, required: true },
    photo: { type: String },
});

module.exports = mongoose.model('User', UserSchema);