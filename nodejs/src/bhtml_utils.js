const util = require('util')

const fileTypes = ["page", "style", "template", "global-parameter"]

const plurals = {
	"options": "option",
	"classes": "class",
	"ids": "id",
	"styles": "style"
}
const listTypes = Object.keys(plurals).concat(Object.values(plurals))
const templatingTypes = ["template", "if", "param"]
const reservedWords = ["nbsp", "br", "break", "hr"]
const dontPreprocess = ["code", "verbatim"]

module.exports = {
	fileTypes,
	parseShorthand,
	parseTemplate,
	fixListsInObject,
	templatingTypes, reservedWords, dontPreprocess,
	replaceObjectPropsWithParams,
	copyObject,
	flattenArray,
	addValToObj
}

// detect format "a-b-c (d ...) (e ...)"
function parseShorthand(s) {
	// a (b) (c) => [a, b), c)]
	let parts = s.split(" (")
	// any spaces in "a" mean it's not shorthand
	if (parts[0].indexOf(" ") != -1) {
		return {isShorthand: false}
	}
	// get the type and options
	let dashSplit = parts[0].split("-")
	let elementType = dashSplit[0]
	let option = dashSplit.slice(1) // might be empty list
	if (parts.length == 1) {
		if (option.length > 0) {
			return {
				isShorthand: true,
				elementType: elementType,
				additional: {
					option: option,
				}
			}
		}
		else {
			// it's just a single word
			return {isShorthand: false}
		}
	}
	// there are other parts
	else {
		// check that all open parens are closed
		let partsTail = parts.slice(1)
		let kvArgs = {}
		partsTail.forEach(t => {
			if (t[t.length-1] != ")") {
				return {isShorthand: false}
			} else {
				// paren is closed, add to kvArgs
				let arg = t.slice(0, t.length-1)
				let argKey = arg.split(" ")[0]
				let argVal = arg.split(" ").slice(1).join(" ")
				kvArgs[argKey] = argVal
			}
		})
		kvArgs = fixListsInObject(kvArgs)
		// if we have dashed options and an option kvArg
		if (option.length > 0) {
			if (kvArgs.option) {
				kvArgs.option = kvArgs.option.concat(option)	
			}
			else {
				kvArgs.option = option
			}
		}
		return {
			isShorthand: true,
			elementType: elementType,
			additional: kvArgs
		}
	}
}

// split comma separated list, but more flexible
// split on "comma" or "comma and space"
// "a, b, c,d,e" => [a,b,c,d,e]
function splitCommaString(s) {
	return s.split(/,\s|,/)
}

function fixLists(listKey, listVal) {
	if (plurals[listKey]) {
		listKey = plurals[listKey]
	}
	if (typeof listVal == "string") {
		listVal = splitCommaString(listVal)
	}
	return {k: listKey, v: listVal}
}

// {options: "a,b,c"} becomes...
// {option: ["a", "b", "c"]}
// same with styles, ids, classes, etc
function fixListsInObject(obj) {
	Object.keys(obj).forEach(k => {
		if (listTypes.includes(k)) {
			let fixed = fixLists(k, obj[k])
			delete obj[k]
			obj[fixed.k] = fixed.v
		}
	})
	// move "style" items to "class"
	if (obj.style) {
		if (obj.class) {
			obj.class = obj.class.concat(obj.style)
		}
		else {
			obj.class = obj.style
		}
		delete obj.style
	}
	return obj
}

function parseTemplate(s) {
	// console.log("s:", s)
	if (typeof s != "string") {
		return {isTemplate: false}
	}
	if (s.indexOf("$$ ") != 0) {
		return {isTemplate: false}
	}
	// "$$ if ..." => if
	let parts = s.split(" ")
	let t = parts[1]
	if (!templatingTypes.includes(t)) {
		throw util.format("Unrecognized templating type: '%s'", s)
	}
	// handle the templating type
	if (t == "template") {
		return {isTemplate: true, type: "template", name: parts[2]}
	}
	else if (t == "if") {
		return {isTemplate: true, type: "conditional", test: parts.slice(2).join(" ")}
	}
	else if (t == "param") {
		return {isTemplate: true, type: "parameter", name: parts[2]}
	}
	else {
		throw "Unknown templating type: " + t
	}
}

function replaceObjectPropsWithParams(obj, params) {
	Object.keys(obj).forEach(k => {
		let tem = parseTemplate(obj[k])
		if (tem.isTemplate && tem.type == "parameter") {
			if (params[tem.name]) {
				obj[k] = params[tem.name]
			}
			else {
				throw "Parameter not found: " + obj[k]
			}
		}
	})
	return obj
}

function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj))
}

function flattenArray(arr) {
	if (!Array.isArray(arr)) {
		return arr
	}
	let res = []
	arr.forEach(a => {
		if (Array.isArray(a)) flattenArray(a).forEach(b => res.push(b))
		else res.push(a)
	})
	return res
}

// set a key-value for an object if it doesn't exist,
// if it exists and is an array, concatenate it onto the end
// if it exists and is not an array, throw an error
function addValToObj(obj, k, v) {
	if (!obj[k]) {
		obj[k] = v
	}
	else if (Array.isArray(obj[k])) {
		obj[k] = obj[k].concat(v)
	}
	else {
		throw util.format("Can't addValToObj. \nObj: %s, \nkey: %s, \nval: %s",
			obj, k, v)
	}
	return obj
}