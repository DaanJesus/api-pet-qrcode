const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const petRoutes = require('./routes/pets');
const authRoutes = require('./routes/auth');
// Connect DB
require('./db/connection');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:4200',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Rotas
app.get('/', (req, res) => {
    res.send('API Pet Profile funcionando!');
});

// Usar as rotas de Pets
app.use('/api/pets', petRoutes);
app.use('/api/auth', authRoutes);

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
