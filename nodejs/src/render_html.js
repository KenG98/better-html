const pretty = require('pretty');
const util = require('util')
const ht = require('./html_utils.js')

module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	Object.keys(files)
		.filter(f => files[f].type == "page")
		.forEach(f => {
			// console.log(f, ":", JSON.stringify(files[f].contents, null, 2))
			files[f].contents = pretty(renderHTML(files[f].contents))
		})
}

function renderHTML(obj) {
	if (Array.isArray(obj)) {
		return obj.map(x => renderHTML(x)).join("")
	}
	else if (typeof obj == "object") {
		return renderHtmlObj(obj)
	}
	else if (typeof obj == "string") {
		return obj
	}
	else {
		// throw "Unrecognized renderHTML object type: " + JSON.stringify(obj)
		return ""
	}
}

function renderHtmlObj(obj) {
	// console.log("OBJ:", obj)
	if (!obj.type) {
		throw "renderHtmlObj must provide a type: " + JSON.stringify(obj)
	}
	if (genFuncNames.includes(obj.type)) {
		// copy any generic generation attributes into attr
		let attr = ht.getRenderAttributes(obj)
		// the genFunc will have any special instructions that happen 
		// for this element specifically
		return genFuncs[obj.type](obj, attr)
	}
	else {
		throw "Unrecognized renderHtmlObj object type: " + JSON.stringify(obj)
	}
}

function container(obj, attrs) {
	let tagName = "div"
	if (getOption(obj).includes("span")) {
		tagName = "span"
	}
	return ht.genElem(tagName, attrs, renderHTML(obj.content))
}

function row(obj, attrs) {
	// make all children nonresponsive
	if (getOption(obj).includes("nonresponsive")) {
		for (c in obj.content) {
			if (obj.content[c].option) {
				obj.content[c].option.push("nonresponsive")
			}
			else {
				obj.content[c].option = ["nonresponsive"]
			}
		}
	}
	// give self the "pure-g" class
	attrs = ht.addProp(attrs, "class", "pure-g")
	return ht.genElem("div", attrs, renderHTML(obj.content))
}

function column(obj, attrs) {
	var widthStr = obj.width.replace("/", "-");
  var columnClass = "";
  if (getOption(obj).includes("nonresponsive")) {
    columnClass = util.format('pure-u-%s', widthStr);
  }
  else {
    columnClass = util.format('pure-u-1 pure-u-md-%s', widthStr);
  }
  attrs = ht.addProp(attrs, "class", columnClass)
  return ht.genElem("div", attrs, renderHTML(obj.content))
}

function text(obj, attrs) {
	tagName = "div"
	if (getOption(obj).includes("span")) {
		tagName = "span"
	}
	attrs = ht.addProp(attrs, "class", "bhtml-text")
	return ht.genElem(tagName, attrs, renderHTML(obj.content))
}

function img(obj, attrs) {
	attrs = ht.addProp(attrs, "class", "pure-img")
	return ht.genElemClosed("img", attrs)
}

function link(obj, attrs) {
	return ht.genElem("a", attrs, obj.content)
}

function button(obj, attrs) {
	attrs = ht.addProp(attrs, "class", "pure-button")
	return ht.genElem("a", attrs, obj.content)
}

function hr(obj, attrs) {
	let hrTag = ht.genElemClosed("hr", null)
	if (obj.count){
		hrTag = hrTag.repeat(obj.count)
	}
	return hrTag
}

function br(obj, attrs) {
	let brTag = ht.genElemClosed("br", null)
	if (obj.count){
		brTag = brTag.repeat(obj.count)
	}
	return brTag
}

function nbsp(obj, attrs) {
	let nbsp = "&nbsp;"
	if (obj.count){
		nbsp = nbsp.repeat(obj.count)
	}
	return nbsp
}

function script(obj, attrs) {
	return ht.genElem("script", attrs, obj.content)
}

function verbatim(obj, attrs) {
	if (getOption(obj).includes("unescaped")) {
		return obj.content
	}
	return ht.escapeHtml(obj.content)
}

function codeBlock(obj, attrs) {
  attrs = ht.addProp(attrs, "data-language", "none")
  var inner = ht.genElem("code", null, ht.escapeHtml(obj.content))
  return ht.genElem("pre", attrs, inner)
}

function noneBlock(obj, attrs) {
	return ""
}

const genFuncs = {
	container,
	row,
	column,
	text,
	"image": img,
	img,
	link, 
  button, 
  hr,
  "break": br,
  br,
  nbsp,
  script,
  verbatim,
  "code": codeBlock,
  "none": noneBlock
}
const genFuncNames = Object.keys(genFuncs)

function getOption(obj) {
	if (obj.option) {
		return obj.option
	}
	else {
		return []
	}
}
