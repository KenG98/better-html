const util = require('util')
const pretty = require('pretty')

module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	files = buildEntirePageHTML(files)
	files = renamePagesToHTML(files)
}

function buildEntirePageHTML(files) {
	let styleTag = files.globalStyles
	if (!styleTag) {
		styleTag = ""
	}
	Object.keys(files)
		.filter(f => files[f].type == "page")
		.forEach(f => {
			let fileBody = files[f].contents
			let titleTag = ""
			if (files.settings && files.settings.title) {
				titleTag = util.format("<title>%s</title>", files.settings.title)
			}
			let headTag = (`
		    <head>
		      <meta charset="UTF-8">
		      ` + titleTag + `
		      <link rel="stylesheet" href="/site-resources/purecss/pure-min.css">
		      <link rel="stylesheet" href="/site-resources/purecss/grids-responsive-min.css">
		      <link rel="stylesheet" href="/site-resources/rainbow/github.css">
		      <link rel="stylesheet" href="/site-resources/betterhtml/bhtml.css">
		      <script src="/site-resources/betterhtml/bhtml.js"></script>
		      <meta name="viewport" content="width=device-width, initial-scale=1">
		      ` + styleTag + `
		    </head>`)
		  let bodyTag = (`
		    <body>
		      ` + fileBody + `
		      <script src="/site-resources/rainbow/rainbow.js"></script>
		      <script src="/site-resources/rainbow/generic.js"></script>
		      <script src="/site-resources/rainbow/html.js"></script>
		    </body>`)
			let fullHTML = pretty(util.format(
				"<!DOCTYPE html> <html> %s %s </html>", 
				headTag,
				bodyTag))
			files[f].contents = fullHTML
		})
	return files
}

function renamePagesToHTML(files) {
	Object.keys(files)
		.filter(f => files[f].type == "page")
		.forEach(f => {
			// rename pages from .yml to .html
			let htmlFilename = f.slice(0, f.indexOf(".yml")) + ".html"
			files[htmlFilename] = files[f]
			delete files[f]
		})
	return files
}
