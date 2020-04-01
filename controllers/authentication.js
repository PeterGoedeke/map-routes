const passport = require('passport')
const mongoose = require('mongoose')
const User = mongoose.model('User')

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
        const token = user.generateJwt()
        return res.status(200).json({token})
    })
}

function login(req, res) {
    if(!req.body.username || !req.body.password) {
        return res.status(400).json('All fields required')
    }
    passport.authenticate('local', (err, user, info) => {
        let token
        if(err) {
            return res.status(404).json(err)
        }
        if(user) {
            token = user.generateJwt()
            res.status(200).json({token})
        }
        res.status(401).json(info)
    })(req, res)
}


module.exports = {
    register,
    login
}