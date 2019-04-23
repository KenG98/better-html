module.exports = plugin

/*
Get all of the global params from the "global-parameters" type.

Combine them into a single file, remove all other global-parameters files.
*/

function plugin(files, metalsmith, done) {
	setImmediate(done)
	let allGlobalParams = {}
	Object.keys(files)
		.filter(f => files[f].type == "global-parameter")
		.forEach(f => {
			// for each global param
			Object.keys(files[f].contents).forEach(k => {
				allGlobalParams[k] = files[f].contents[k]
			})
			delete files[f]
		})
	files["globalParameters"] = allGlobalParams
}
