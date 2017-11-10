const express = require('express');
const router = express.Router();
const { User, Post, Vote } = require('../models');


module.exports = function(passport) {
    router.post('/register', (req, res) => {
        if (req.body.password !== req.body.password2) {
            res.status(400).json({"success": false, "error": "Passwords do not match"});
        } else {
            User.create({ username: req.body.username, password: req.body.password, img_url: req.body.img_url })
            .then(() => {
                res.status(200).json({"success": true});
            })
            .catch(err => {
                console.log('error registering: ', err);
                res.status(400).json({"success": false, "error": "User with that name already exists."});
            });
        }
    });

    router.post('/login', passport.authenticate('local'), (req, res) => {
        if (!req.user) {
            res.status(400).json({"success": false, "error": "Invalid username or password"});
        } else {
            // console.log(req.user);
            res.status(200).json({"success": true });
        }
    });

    router.get('/post/all', async (req, res) => {
        try {
            const allPosts = await Post.findAll({where: { parentId: null }});
            res.status(200).json({"success": true, "posts": allPosts });
        } catch (e) {
            res.status(500).json({"success": false, "error": e });
        }
    });

    router.get('/post/:postid', async (req, res) => {
        try {
            const postDetails = await Post.find({
                include: [
                    {
                        model: User,
                        attributes: ['username', 'img_url']
                    },
                    {
                        model: Vote,
                        attributes: ['up']
                    },
                    {
                        model: Post,
                        as: 'descendents',
                        hierarchy: true,
                        include: [
                            {
                                model: User,
                                attributes: ['username', 'img_url']
                            },
                            {
                                model: Vote,
                                attributes: ['up']
                            }
                        ]
                    }
                ],
                where: {
                    id: req.params.postid
                }
            });
            console.log("POST RESULT: ", postDetails.dataValues);
            res.status(200).json({ "success": true, "post": postDetails.dataValues});
        } catch (e) {
            res.status(500).json({ "success": false, "error": e });
        }
    });

    router.get('/', (req, res) => {
        if (req.user) {
            res.status(200).json({ "success": true, "user": {"username": req.user.username, "img_url": req.user.img_url} });
        } else {
            res.status(200).json({"success": true, "user": null});
        }
    });

    router.use((req, res, next) => {
        // console.log('USER: ', req.user);
        if (!req.user) {
            res.status(400).json({"success": false, "error": "Not logged in."});
        } else {
            next();
        }
    });

    router.get('/logout', (req, res) => {
        req.logout();
        res.json({"success": true});
    });

    router.post('/post/new', async (req, res) => {
        try {
            await Post.create({ title: req.body.title, content: req.body.content, parentId: req.body.parentId || null, userId: req.user.id });
            res.status(200).json({ "success": true });
        } catch (e) {
            res.status(500).json({"success": false, "error": e });
        }
    });

    router.post('/post/vote', async (req, res) => {
        try {
            const votedBefore = await Vote.findOne({where: { postId: req.body.postId, userId: req.user.id }});
            console.log(votedBefore);
            if (votedBefore !== null) {
                if (votedBefore.up === req.body.vote ){
                    res.status(200).json({ "success": true, "new": false, "changed": false});
                } else {
                    await Vote.update({ up: req.body.vote }, { where: { postId: req.body.postId, userId: req.user.id }});
                    res.status(200).json({"success": true, "new": false, "changed": true })
                }
            } else {
                await Vote.create({ postId: req.body.postId, userId: req.user.id, up: req.body.vote });
                console.log('voted');
                res.status(200).json({ "success": true, "new": true });
            }
        } catch (e) {
            res.status(500).json({"success": false, "error": e });
        }
    });

    router.get('/:username', async (req, res) => {
        try {
            const userProfile = await User.findOne({attributes: ['username', 'img_url'], where: { username: req.params.username }});
            res.status(200).json({ "success": true, "user": userProfile });
        } catch (e) {
            res.status(400).json({ "success": false, "error": e });
        }
    });

    return router;
};
