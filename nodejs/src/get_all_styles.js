module.exports = plugin

/*
Get all of the styles from the "style" type.

Combine them into a single file, remove all other style files.
*/

function plugin(files, metalsmith, done) {
	setImmediate(done)
	let allStyles = {}
	Object.keys(files)
		.filter(f => files[f].type == "style")
		.forEach(f => {
			// for each style
			Object.keys(files[f].contents).forEach(k => {
				allStyles[k] = files[f].contents[k]
			})
			delete files[f]
		})
	files["globalStyles"] = allStyles
}
