const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const authenticateToken = require('../middleware/authtoken');

router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.body.user;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes = post.likes.filter((like) => like.toString() !== userId);
            await post.save();
            return res.status(200).json(false);
        } else {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json(true);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Nova rota para adicionar um comentário a um post
router.post('/:id/comment', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id; // Obtendo o ID do post da URL
        const { author, text } = req.body; // Extraindo os dados do comentário do corpo da requisição

        // Encontrar o post pelo ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }

        // Criar um novo comentário
        const newComment = {
            author: author,
            text: text,
            createdAt: new Date()
        };

        // Adicionar o comentário ao post
        post.comments.push(newComment);
        await post.save(); // Salvar as alterações no banco de dados

        // Popular o campo author do novo comentário
        const populatedComment = await Post.findById(postId)
            .populate('comments.author', "-password") // Aqui você popula o autor do comentário
            .then(post => {
                const comment = post.comments[post.comments.length - 1]; // Obtém o último comentário adicionado
                return comment;
            });

        
            console.log(populatedComment);
            
        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/new', authenticateToken, async (req, res) => {
    try {

        console.log('teste', req.body);

        const postData = {
            author: req.body.author,
            content: req.body.content
        };

        if (req.body.images && req.body.images.length > 0) {
            postData.images = req.body.images;
        }

        let post = new Post(postData);

        await post.save();

        const populatedPost = await Post.findById(post._id).populate('author', '-password');

        res.status(201).json(populatedPost);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/get', authenticateToken, async (req, res) => {

    const { page = 1, limit = 10 } = req.query;  // Define valores padrões para página e limite

    try {
        // Converte o número da página e o limite para inteiros
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Calcula o número de documentos que serão "pulados" com base na página e no limite
        const skip = (pageNumber - 1) * limitNumber;

        // Busca os posts com paginação e popula os autores
        const posts = await Post.find()
            .populate('author')
            .populate('comments.author')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        // Conta o total de posts para fornecer no frontend
        const totalPosts = await Post.countDocuments();

        res.status(200).json({
            posts,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalPosts / limitNumber),
            totalPosts,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;