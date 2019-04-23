module.exports = plugin

function plugin(files, metalsmith, done) {
	setImmediate(done);
	let allTemplates = {}
	Object.keys(files)	
		.filter(k => files[k].type == "template")
		.forEach(k => {
			// file contains a single template by the name of the filename
			if (Array.isArray(files[k].contents)) {
				let templateName = k.slice(0, k.length-4)
				allTemplates[templateName] = files[k].contents
				delete files[k]
			}
			// this file contains multiple templates
			else if (typeof files[k].contents == "object") {
				Object.keys(files[k].contents).forEach(t => {
					allTemplates[t] = files[k].contents[t]
				})
				delete files[k]
			}
			else {
				throw "Unrecognized template file: " + k
			}
		})
	files.allTemplates = allTemplates
}
