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

        console.log("Comment", populatedComment);


        res.status(201).json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:postId/comment/:commentId/reply', authenticateToken, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { author, text } = req.body;

        // Busca o post pelo ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post não encontrado' });
        }

        // Encontra o comentário específico
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comentário não encontrado' });
        }

        // Cria uma nova resposta
        const newReply = {
            author: author, // Isso deve ser um ObjectId do usuário
            text: text,
            createdAt: new Date(),
        };

        comment.replies.push(newReply);
        await post.save();

        // Popula o post novamente para obter a resposta mais recente com autor
        const populatedPost = await Post.findById(postId)
            .populate('comments.replies.author', "-password");

        // Encontre a última resposta que foi adicionada
        const reply = populatedPost.comments
            .find(c => c._id.equals(commentId)) // Encontrar o comentário
            .replies[populatedPost.comments.find(c => c._id.equals(commentId)).replies.length - 1]; // Pegar a última resposta

        console.log(reply);

        res.status(201).json({ _id: commentId, reply }); // Retorna a resposta populada
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:postId/comment/:commentId/like', authenticateToken, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { userId, replyId, isComment } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Encontra o post pelo ID
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Verifica se é um comentário ou uma resposta
        let comment = post.comments.id(commentId);

        if (!comment) {
            // Procura a resposta dentro de cada comentário
            for (const com of post.comments) {
                const foundReply = com.replies.id(commentId);
                if (foundReply) {
                    comment = com;
                    replyId = commentId; // Define o replyId como o commentId
                    break;
                }
            }
        }

        if (!comment) {
            return res.status(404).json({ error: 'Comment or reply not found' });
        }

        if (isComment) {
            // Verifica se o usuário já curtiu o comentário
            const isLiked = comment.likes && comment.likes.includes(userId);

            if (isLiked) {
                // Remove a curtida do usuário
                comment.likes = comment.likes.filter((like) => like.toString() !== userId);
            } else {
                // Adiciona a curtida do usuário
                if (!comment.likes) {
                    comment.likes = []; // Inicializa se for null
                }
                comment.likes.push(userId);
            }
        } else {
            // Se for uma resposta
            const reply = comment.replies.id(replyId);
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }

            // Verifica se o usuário já curtiu a resposta
            const isLiked = reply.likes && reply.likes.includes(userId);

            if (isLiked) {
                // Remove a curtida do usuário
                reply.likes = reply.likes.filter((like) => like.toString() !== userId);
            } else {
                // Adiciona a curtida do usuário
                if (!reply.likes) {
                    reply.likes = []; // Inicializa se for null
                }
                reply.likes.push(userId);
            }
        }

        // Salva o post atualizado
        await post.save();

        // Determina se o usuário curtiu ou descurtiu
        const liked = isComment ? comment.likes.includes(userId) : comment.replies.id(replyId).likes.includes(userId);

        console.log(liked);


        // Retorna o status atualizado de curtida (true = curtiu, false = descurtiu)
        res.status(200).json(liked);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/new', authenticateToken, async (req, res) => {
    try {
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
            .populate('author', "-password")
            .populate('comments.author', "-password")
            .populate('comments.replies.author', "-password")
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

// Rota para buscar todos os posts de um usuário específico
router.get('/user/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id; // Obtendo o ID do usuário da URL

        // Busca os posts que pertencem ao usuário especificado e onde o campo "image" é maior que zero
        const posts = await Post.find({
            author: userId,
            images: { $gt: 0 } // Condição que filtra posts onde o campo "image" é maior que zero
        })
            .populate('author', '-password') // Popula o autor, omitindo a senha
            .populate('comments.author', '-password') // Popula os autores dos comentários, omitindo a senha
            .sort({ createdAt: -1 }); // Ordena os posts pela data de criação (mais recentes primeiro)

        console.log(posts.length);

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Nenhum post encontrado para este usuário.' });
        }

        res.status(200).json(posts); // Retorna os posts encontrados
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;