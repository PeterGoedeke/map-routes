const passport = require('passport')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const jwt = require('jsonwebtoken')

function register(req, res) {
    if(!req.body.username || !req.body.password) {
        return res.status(400).json('All fields required.')
    }
    const user = new User()
    user.username = req.body.username
    user.setPassword(req.body.password)
    user.save((err) => {
        if(err) {
            return res.status(404).json(err)
        }
        
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 7)
        const payload = {
            username: user.username,
            exp: expiry
        }

        req.login(payload, { session: false }, (error) => {
            if(error) {
                return res.status(400).send({ error })
            }

            const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET)

            res.cookie('jwt', token, { httpOnly: true, secure: true })
            return res.status(200).send({ username: req.body.username })
        })
    })
}

function login(req, res) {
    if(!req.body.username || !req.body.password) {
        return res.status(400).json('All fields required')
    }
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if(err) {
            return res.status(404).json(err)
        }
        if(!user) {
            return res.status(401).json(info)
        }
        
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 7)
        const payload = {
            username: user.username,
            exp: expiry
        }
        
        req.login(payload, { session: false }, (error) => {
            if(error) {
                return res.status(400).send({ error })
            }
            const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET)
            
            res.cookie('jwt', token, { httpsOnly: true, secure: true })
            return res.status(200).send({ username: req.body.username })
        })
    })(req, res)
}


module.exports = {
    register,
    login
}