/**
 * Prints a message to the node.js console with a red background. Should be used for errors.
 * @param {String} message The message to print to the console
 */
function warn(message) {
    console.log('\x1b[41m%s\x1b[0m', message)
}

module.exports = warn