const bhUtil = require('./bhtml_utils.js')
const util = require('util')

module.exports = plugin

/*
Make sure that all files have a "type" in the header which is one
of the specified "fileTypes".

Throw an error - metalsmith will catch it.
*/

function plugin(files, metalsmith, done) {
	setImmediate(done)
	Object.keys(files).forEach(f => {
		let file = files[f]
		if (!file.type) {
			throw util.format("File %s doesn't include a 'type' field.", f)
		}
		if (!bhUtil.fileTypes.includes(file.type)) {
			throw util.format("File %s has invalid type '%s'.", f, file.type)
		}
	})
}
