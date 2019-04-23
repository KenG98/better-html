const util = require('util')
const cssUtil = require('./css_utils.js')

module.exports = {
	genElem,
	genElemClosed,
	escapeHtml,
	getRenderAttributes,
	addProp
}

// don't include class or style, they're handled by getRenderAttributes
const importantProps = ["href", "src", "id", "onclick", "class"]

/**
 * Does the generation logic. Object has properties:
 * 
 * tagName (string with tag name)
 * attributes (to place in opening tag)
 * selfClosing (boolean)
 * content (to place inside the tag)
 */
function generateElement(tagName, attributes, selfClosing, content) {
	let openTag = util.format("<%s", tagName)
	if (attributes) {
		Object.keys(attributes).forEach(a => {
			let attr = attributes[a]
			if (Array.isArray(attr)) attr = attr.join(" ")
			openTag += util.format(' %s="%s"', a, attr)
		})
	}
	if (selfClosing) {
		return (openTag + " />")
	}
	else {
		openTag += ">"
		closeTag = util.format("</%s>", tagName)
		return (openTag + content + closeTag)
	}
}

// generate an HTML tag w/ attributes, content, and a closing tag
function genElem(tagName, attributes = null, content = null) {
	return generateElement(tagName, attributes, false, content)
}

// generate a self closing HTML tag
function genElemClosed(tagName, attributes = null) {
	return generateElement(tagName, attributes, true, null)
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\(/g, "&#40;") // escaped for bhtml
    .replace(/\)/g, "&#41;") // escaped for bhtml
}

// addProp
function addProp(attrs, prop, val) {
	// already exists
	if (attrs[prop]) {
		// turn the prop into an array if necessary
		if (!Array.isArray(attrs[prop])) {
			attrs[prop] = [attrs[prop]]
		}
		attrs[prop] = attrs[prop].concat(val)
	}
	// doesn't exist, go ahead and set it
	else {
		attrs[prop] = val
	}
	return attrs
}

// return the "render attributes" - these are the attributes in the 
// html tag <tagName attr1="val1", attr2="val2">
// it returns them in list form, the concatenation is done by genElem
function getRenderAttributes(obj) {
	let res = {}
	// process options
	if (obj.option) {
		obj.option.forEach(opt => {
			let thisOpt = cssUtil.getCssOpt(opt)
			if (thisOpt) {
				res = addProp(res, "style", thisOpt)
			}
		})
	}
	// process other attributes
	Object.keys(obj).forEach(k => {
		let thisProp = cssUtil.getCssProp(k, obj[k])
		if (thisProp) res = addProp(res, "style", thisProp)
	})
	// copy over other important attributes (href, src, etc)
	importantProps.forEach(p => {
		if (obj[p]) {
			res = addProp(res, p, obj[p])
		}
	})
	// special attributes specific to betterhtml
	if (obj.option) {
		obj.option.forEach(opt => {
			if (opt == "nonfooter") {
				attributes = addProp(attributes, "class", "non-footer-content")
			} 
			else if (opt == "footer") {
				attributes = addProp(attributes, "class", "footer-content")
			} 
			else if (opt == "desktoponly") {
				attributes = addProp(attributes, "class", "desktoponly")
			} 
			else if (opt == "mobileonly") {
				attributes = addProp(attributes, "class", "mobileonly")
			} 
		})
	}
	return res
}
