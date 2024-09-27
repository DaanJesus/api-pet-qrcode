const mongoose = require('mongoose');

const breedsSchema = new mongoose.Schema({
    type: String,
    breeds: [String]
});

module.exports = mongoose.model('Breeds', breedsSchema);