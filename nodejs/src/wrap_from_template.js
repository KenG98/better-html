const util = require('util')

module.exports = plugin

/*
if a page type has a "from_template" property in the header, 
wrap the entire contents of the page in a template object.

Assign the original content of the page to the "content"
parameter in the template.
*/

function plugin(files, metalsmith, done) {
	setImmediate(done)
	Object.keys(files)
		.filter(f => 
			(files[f].type == "page" || files[f].type == "template")
			&& files[f]["from-template"])
		.forEach(f => {
			let templateKey = util.format("$$ template %s", files[f]["from-template"])
			let newContent = {}
			newContent[templateKey] = {content: files[f].contents}
			files[f].contents = [newContent]
		})
}
