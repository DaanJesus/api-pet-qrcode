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

router.get('/get-all', authenticateToken, async (req, res) => {

    try {
        const posts = await Post.find()
            .populate('author')
            .sort({ createdAt: -1 });
            
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
})


module.exports = router;