const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const authenticateToken = require('../middleware/authtoken');

router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.body;

        const post = await Post.findById(postId).populate('author', '-password');

        if (!post) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }

        const isLiked = post.likes.includes(userId.user);

        if (isLiked) {
            post.likes = post.likes.filter((like) => like.toString() !== userId.user);
        } else {
            post.likes.push(userId.user);
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/register', authenticateToken, async (req, res) => {
    try {

        let post = new Post(req.body);

        await post.save();

        const populatedPost = await Post.findById(post._id).populate('author', '-password');

        res.status(201).json(populatedPost);

    } catch (error) {
        res.status(500).json({ error: err.message });
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