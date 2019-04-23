const bhUtil = require('./bhtml_utils.js')

module.exports = plugin

function plugin(files, metalsmith, done) {
	setImmediate(done)
	// if there are global styles and global parameters
	let params = files.globalParameters
	let styles = files.globalStyles
	if (params && styles) {
		Object.keys(styles).forEach(k => {
			styles[k] = bhUtil.replaceObjectPropsWithParams(styles[k], params)
		})
		files.globalStyles = styles
	}
}