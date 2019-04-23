module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	if (!Object.keys(files).includes("index.html")) {
		console.log("WARNING: Your files don't include an 'index.html' file.")
	}
}