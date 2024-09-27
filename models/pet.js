const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    type: { type: String, required: true },
    breed: { type: String },
    birthDate: { type: Date },
    furColor: { type: String },
    weight: { type: Number },
    name: { type: String },
    photo: { type: String },
    sex: { type: String },
    medicalInfo: { type: String },
    castrated: { type: String },
    qrCode: { type: String },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Pet', PetSchema);
