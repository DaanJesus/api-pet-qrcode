const mongoose = require('mongoose');
const PetSchema = require('./pet');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, uniq: true },
    password: { type: String, required: true },
    photo: { type: String },
});

module.exports = mongoose.model('User', UserSchema);
