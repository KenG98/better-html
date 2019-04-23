module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	delete files["globalParameters"]
	delete files["globalStyles"]
	delete files["allTemplates"]
	delete files["settings"]
}