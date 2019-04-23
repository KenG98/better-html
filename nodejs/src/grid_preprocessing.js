const bhUtil = require('./bhtml_utils.js')

module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	Object.keys(files)
		.filter(k => files[k].type == "page")
		.forEach(k => {
			files[k].contents = preprocess(files[k].contents)
		})
}

function preprocess(obj){
	if (Array.isArray(obj)) {
		return bhUtil.flattenArray(obj.map(x => preprocess(x)))
	}
	else if (typeof obj == "object") {
		let complete = preprocessObj(obj)
		if (Array.isArray(complete)) return bhUtil.flattenArray(complete)
		else return complete
	}
	else if (typeof obj == "string") {
		return obj
	}
	else {
		throw "Unknown gridPreprocess type of obj: " + JSON.stringify(obj)
	}
}

function preprocessObj(obj) {
	if (obj.type == "row") obj = preprocessRow(obj)
	if (obj.width && obj.offset) obj = wrapWidthOffset(obj)
	if (bhUtil.dontPreprocess.includes(obj.type)) return obj
	else if (obj.content) obj.content = preprocess(obj.content)
	return obj
}

function preprocessRow(obj) {
	// make sure all children are columns
	let hasCol = false
	let hasNonCol = false
	obj.content.forEach(c => {
		if (c.type == "column") hasCol = true
		else hasNonCol = true
	}) 
	if (hasCol && hasNonCol) {
		throw "Row object has a column and non column type child: " + JSON.stringify(obj)
	}
	// wrap children in columns
	if (hasNonCol) {
		obj.content = obj.content.map(c => {return {type: "column", content: c}})
	}
	// make sure all children have a width
	let hasWidth = false
	let hasNoWidth = false
	obj.content.forEach(c => {
		if (c.width) hasWidth = true
		else hasNoWidth = true
	})
	if (hasWidth && hasNoWidth) {
		throw "Row object has columns with width and without width: " + JSON.stringify(obj)
	}
	if (hasNoWidth) {
		let width = "1/" + obj.content.length
		obj.content.forEach(c => c.width = width)
	}
	return obj
}

function wrapWidthOffset(obj) {
	let width = obj.width
	let offset = obj.offset
	delete obj.width
	delete obj.offset
	let result = {
		type: "row",
		content: [
			{type: "column", width: offset},
			{type: "column", width: width, content: obj}
		]
	}
	if (obj.option && obj.option.includes("nonresponsive")) {
		result.option = ["nonresponsive"]
	}
	return result
}
