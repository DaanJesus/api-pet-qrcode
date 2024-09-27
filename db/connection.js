const mongoose = require('mongoose');
require('dotenv').config();

const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@forsale.ukynm.mongodb.net/tagMyPet?retryWrites=true&w=majority&appName=ForSale`;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log('Connected to DB')).catch((e) => console.log('Error', e))