const inlinedFiles = require('./inlined_files_bundle.js')

module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	inlinedFiles.filenames.forEach(f => {
		files["site-resources/" + f] = {contents: inlinedFiles[f]}
	})
}