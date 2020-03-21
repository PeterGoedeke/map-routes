const institutionManager = require('./institutionManager.js')

function institutionList(req, res) {
    const institutions = institutionManager.getList()

    res.render('institutionList.pug', { institutions: institutions })
}
function aboutUs(req, res) {

}
function openSource(req, res) {

}
function register(req, res) {

}
function admin(req, res) {

}
function contactUs(req, res) {

}

module.exports = {
    institutionList,
    aboutUs,
    openSource,
    register,
    admin,
    contactUs
}