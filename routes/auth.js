const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Variáveis de ambiente (defina no seu .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Substitua por uma chave secreta mais segura

// Registro de usuário
router.post('/register', async (req, res) => {
    const { name, email, password, tag, photo } = req.body;

    if (!name || !email || !password || !tag) {
        return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Erro ao cadastrar' });
        }

        const existingTag = await User.findOne({ tag });
        if (existingTag) {
            return res.status(400).json({ message: 'Erro ao cadastrar' });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Cria um novo usuário
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            tag,
            photo
        });

        await newUser.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Login de usuário
router.post('/login', async (req, res) => {
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Preencha todos os campos' });
    }

    try {
        // Verifica se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Verifica a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Gera o token JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.json({ token, user: userWithoutPassword, message: "Login efetuado com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

module.exports = router;