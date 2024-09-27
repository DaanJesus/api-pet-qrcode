const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const petRoutes = require('./routes/pets');
const authRoutes = require('./routes/auth');
// Connect DB
require('./db/connection');

const app = express();

const allowedOrigins = ['https://tag-my-pet.vercel.app', 'http://localhost:4200']

// Middleware
app.use(bodyParser.json());
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // Permitir a origem se estiver na lista ou se for um request sem origem (como o cURL)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

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
