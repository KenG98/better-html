const cssUtils = require('./css_utils.js')
const util = require('util')
const pretty = require('pretty')

module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	if (files.globalStyles) {
		// generate a list of style classes
		var styleClasses = Object.keys(files.globalStyles)
	  var cssStyles = styleClasses.map(st => {
	  	// get all style properties
	    var stylesTextList = Object.keys(files.globalStyles[st])
	      .map(k => cssUtils.getCssProp(k, files.globalStyles[st][k]))
	      .filter(x => x != null);
	    // process all style options
	    if (files.globalStyles[st].options) {
	      stylesTextList = stylesTextList.concat(
	      	files.globalStyles[st].options
		        .map(opt => cssUtils.getCssOpt(opt))
		        .filter(x => x != null));
	    }
	    // join by new line and format as CSS
	    var styleText = stylesTextList.join("\n");
	    return util.format('.%s {\n%s\n}', st, styleText);
	  }).join("\n");
	  // surround by style tags and return
	  files.globalStyles = pretty(util.format('<style>\n%s\n</style>', cssStyles));
	}
}
