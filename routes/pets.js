const express = require('express');
const router = express.Router();
const Pet = require('../models/pet');
const Breeds = require('../models/breeds');
const QRCode = require('qrcode');
const authenticateToken = require('../middleware/authtoken');

const generateQRCode = async (petId) => {
    return await QRCode.toDataURL(`${process.env.BASE_URL}/${petId}`, {
        color: {
            dark: '#ffffff',
            light: '#2fb145'
        }
    });
};

router.post('/register', authenticateToken, async (req, res) => {

    try {
        let pet = new Pet(req.body);

        pet.qrCode = await generateQRCode(pet._id);

        await pet.save();

        const populatedPet = await Pet.findById(pet._id).populate('mentor', '-password');
        
        res.status(201).json(populatedPet);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/pet-info/:id', async (req, res) => {

    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet não encontrado' });
        }
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/my-pets/:userId', authenticateToken, async (req, res) => {

    try {
        const pets = await Pet.find({ mentor: req.params.userId }).populate("mentor", "-password")

        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/breeds/:type', authenticateToken, async (req, res) => {

    try {
        const type = req.params.type;
        const breeds = await Breeds.findOne({ type: type });

        if (!breeds) {
            return res.status(404).send('No breeds found for this type');
        }

        res.json(breeds.breeds);
    } catch (error) {
        console.error('Error fetching breeds:', error);
        res.status(500).send(error.message);
    }
});

module.exports = router;