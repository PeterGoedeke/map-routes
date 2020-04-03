// const passport = require('passport')
// const LocalStrategy = require('passport-local').Strategy
// const JWTStrategy = require('passport-jwt').Strategy
// const mongoose = require('mongoose')
// const User = mongoose.model('User')

// passport.use(new LocalStrategy({}, (username, password, done) => {
//     User.findOne({ username }, (err, user) => {
//         if(err) {
//             return done(err)
//         }
//         if(!user) {
//             return done(null, false, {
//                 message: 'Incorrect email address.'
//             })
//         }
//         if(!user.validPassword(password)) {
//             return done(null, false, {
//                 message: 'Incorrect password.'
//             })
//         }
//         return done(null, user)
//     }) 
// }))

// passport.use(new JWTStrategy({
//     jwtFromRequest: req => {
//         console.log(req.cookies.jwt)
//         console.log(process.env.JWT_SECRET)
//         return req.cookies.jwt
//     },
//     secretOrKey: process.env.JWT_SECRET
// }, (payload, done) => {
//     if(Date.now() > payload.exp) {
//         return done('expired')
//     }
//     return done(null, payload)
// }))

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')

const User = mongoose.model('User')

passport.use(new LocalStrategy({
//   usernameField: username,
//   passwordField: password,
}, async (username, password, done) => {
  try {
    const userDocument = await User.findOne({username: username});
    const passwordsMatch = await bcrypt.compare(password, userDocument.passwordHash);

    if (passwordsMatch) {
        console.log('??????????????????')
        console.log(userDocument)
      return done(null, userDocument);
    } else {
      return done('Incorrect Username / Password');
    }
  } catch (error) {
      console.log(error)
    return done(error);
  }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: process.env.JWT_SECRET,
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }

    return done(null, jwtPayload);
  }
));