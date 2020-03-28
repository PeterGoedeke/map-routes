const databaseAPI = require('../controllers/database_api')


function institutionList(req, res) {
    // make this use the database_api
    // also add comments to all of the stuff and finish the database_api and add it to routes
    console.log('we are here')
    databaseAPI.readInstitutionListProperties().then(institutions => {
        institutions.forEach(i => console.log(i))
        res.render('institutionList', { institutions: institutions })
    }).catch(reason => {
        res.render('error', reason)
    })
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