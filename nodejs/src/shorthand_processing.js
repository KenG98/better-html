const bhUtil = require('./bhtml_utils.js')
const util = require('util')

const reservedWords = bhUtil.reservedWords
const dontPreprocess = bhUtil.dontPreprocess
const templatingTypes = bhUtil.templatingTypes

module.exports = plugin

/* 
This is the really big and complicated plugin to preprocess all shorthand and
other convenience capabilities of BHTML. The functionality is described with
some detail in plans.md.

NOTE: shouldn't preprocess the content of "code" or "verbatim" blocks.
The current logic doesn't do that, but I need to be careful of it going forward.
*/

function plugin(files, metalsmith, done) {
	setImmediate(done);
	Object.keys(files)
		.filter(f => files[f].type == "page")
		.forEach(f => {
			files[f].contents = preprocess(files[f].contents)
		})
	if (files.allTemplates) {
		Object.keys(files.allTemplates).forEach(t => {
			files.allTemplates[t] = preprocess(files.allTemplates[t])
		})
	}
}

function preprocess(obj) {
	if (Array.isArray(obj)) {
    return obj.map(x => preprocess(x));
  }
  else if (typeof obj == "string") {
    return preprocessString(obj);
  }
  else if (!obj) {
    return null;
  }
  else {
    // if it's not the others, it's likely an object
    return preprocessObj(obj);
  }
}

function preprocessString(s) {
	// if it's shorthand, preprocess it as an object
	if (bhUtil.parseShorthand(s).isShorthand) {
		// this is a bit wasteful as we've already parsed the shorthand
		// but it makes our logic much simpler - the extra arguments are
		// handled by the preprocessObj function.
		let res = {}
		res[s] = {}
		return preprocess(res)
	}
	// maybe it's a template type
	let tem = bhUtil.parseTemplate(s)
	if (tem.isTemplate) {
		if (tem.type == "conditional") {
			// can't use an "if" as a standalone string
			throw "Can't use a standalone conditional: " + s
		}
		else {
			// it's either a template or parameter, fine either way
			return {type: tem.type, name: tem.name}
		}
	}
	// maybe it's a reserved keyword
	if (reservedWords.includes(s)) {
		return {type: s}
	}
	// it's just text
	// parse markdown
	s = parseMarkdownLinks(s)
	return {type: "text", content: s}
}

function preprocessObj(obj) {
	// resolve any shorthand and make sure list properties are correct
	if (obj.type) {
		// has type, no shorthand here
		// fix list properties (options, styles, classes, etc)
		obj = bhUtil.fixListsInObject(obj)
	}
	else if (Object.keys(obj).length > 1) {
		throw "Object has no type but has multiple keys: " + JSON.stringify(obj)
	}
	else if (Object.keys(obj) == 0) {
		return null
	}
	else {
		let singleKey = Object.keys(obj)[0]
		// if it's a nbsp or break or something like that
		if (reservedWords.includes(singleKey)) {
			return {type: singleKey, count: obj[singleKey]}
		}
		// handle templatingTypes
		let tem = bhUtil.parseTemplate(singleKey)
		if (tem.isTemplate) {
			return preprocessTemplate(obj, singleKey, tem)
		}
		// wrap content and process any shorthand
		obj = wrapContentParseShorthand(obj, singleKey)
	}
	// preprocess object "content"
	// if (!obj.content || !obj.type) {
	// 	throw "Preprocessed object is required to have content and type: " + JSON.stringify(obj)
	// }
	if (!obj.type) {
		throw "Preprocessed object is required to have a type: " + JSON.stringify(obj)
	}
	// handle any conditional properties
	obj = handleConditionals(obj)
	// filter is required so that text fields don't get burried in a nested content
	// NOTE: may have unintended consequences... will look into it.
	// this behavior doesn't preprocess code and verbatim blocks, 
	// which is what we want, so we'll leave it for now.
	if (Array.isArray(obj.content)) {
		obj.content = preprocess(obj.content)
	}
	if (obj.type == "link") {
		obj = fixLink(obj)
	}
	if (obj.type == "text") {
		obj.content = parseMarkdownLinks(obj.content)
	}
	if (obj.type == "button") {
		obj = fixButton(obj)
	}
	return obj
}

function handleConditionals(obj) {
	// handle any conditional properties "{$$ if param x = param y: {color: green}}"
	// TODO: please implement
	// put conditionals in a "conditional" property (array) with test, pass, and fail props
	let cond = []
	Object.keys(obj).forEach(k => {
		if (k.indexOf("$$") != -1) {
			let tem = bhUtil.parseTemplate(k)
			if (tem.type == "conditional") {
				let thisConditional = {test: tem.test}
				// extract the "pass" and "fail" properties
				if (!obj[k].then) {
					thisConditional.pass = obj[k]
				}
				else {
					thisConditional.pass = obj[k].then
				}
				if (!obj[k].else) {
					thisConditional.fail = {}
				}
				else {
					thisConditional.fail = obj[k].else
				}
				delete obj[k]
				// preprocess the conditional properties (just fixing lists)
				thisConditional = bhUtil.fixListsInObject(thisConditional)
				cond.push(thisConditional)
			}
		}
	})
	if (cond.length > 0) {
		obj.conditional = cond
	}
	return obj
}

function preprocessTemplate(obj, singleKey, tem) {
	if (tem.type == "parameter") {
		return {type: "parameter", name: tem.name}
	}
	else if (tem.type == "template") {
		if (Array.isArray(obj[singleKey])) {
			let contentParam = preprocess(obj[singleKey])
			return {
				type: "template", 
				name: tem.name, 
				parameters: {content: contentParam}
			}
		}
		else if (typeof obj[singleKey] == "string") {
			throw "Can't supply template with a string. " + JSON.stringify(obj)
		}
		else {
			let params = obj[singleKey]
			Object.keys(params).forEach(k => {
				// leave single strings alone
				// a single string probably means that's exactly what we want, don't wrap in "text"
				// TODO: document this behavior
				if (typeof params[k] != "string") {
					params[k] = preprocess(params[k])
				}
			})
			return {
				type: "template", 
				name: tem.name, 
				parameters: params
			}
		}
	}
	else if (tem.type == "conditional") {
		if (Array.isArray(obj[singleKey])) {
			let then = preprocess(obj[singleKey])
			return {type: "conditional", test: tem.test, pass: then}
		}
		else if (typeof obj[singleKey] == "string") {
			throw "Can't supply conditional with a string. " + JSON.stringify(obj)
		}
		else {
			let res = {type: "conditional", test: tem.test}
			if (!obj[singleKey].then) {
				throw "Can't have a conditional without a 'then' statement. " + JSON.stringify(obj) 
			}
			res.pass = preprocess(obj[singleKey].then)
			if (obj[singleKey].else) {
				res.fail = preprocess(obj[singleKey].else)
			}
			return res
		}
	}
}

// wrap object content in a "content" propery if necessary
function wrapContentParseShorthand(obj, singleKey) {
	let sh = bhUtil.parseShorthand(singleKey)
	if (Array.isArray(obj[singleKey])) {
		let res = {content: obj[singleKey]}
		if (sh.isShorthand) {
			res.type = sh.elementType
			// we can simply add the additional keys
			Object.keys(sh.additional).forEach(k => res[k] = sh.additional[k])
		}
		else {
			res.type = singleKey
		}
		return res
	}
	else if (typeof obj[singleKey] == "object") {
		// fix the lists in the object
		obj[singleKey] = bhUtil.fixListsInObject(obj[singleKey])
		// form the response object
		res = {}
		Object.keys(obj[singleKey]).forEach(k => res[k] = obj[singleKey][k])
		if (sh.isShorthand) {
			res.type = sh.elementType
			Object.keys(sh.additional).forEach(k => {
				// replaces below code
				res = bhUtil.addValToObj(res, k, sh.additional[k])
				// // key doesn't already exist, simply create it
				// if (!res[k]) {
				// 	res[k] = sh.additional[k]
				// }
				// // key exists, concatenate lists, throw error on overwrite
				// else {
				// 	if (Array.isArray(res[k]) != Array.isArray(sh.additional[k])) {
				// 		throw util.format(
				// 			"Array / Object mismatch for key '%s'. object[k]: %s , shorthand[k]: %s",
				// 			JSON.stringify(res[k]), JSON.stringify(sh.additional[k]))
				// 	}
				// 	if (Array.isArray(res[k])) {
				// 		res[k] = res[k].concat(sh.additional[k])	
				// 	}
				// 	else {
				// 		throw util.format(
				// 			"Shorthand overwrites object key '%s'. Object %s. Shorthand %s.",
				// 			k, JSON.stringify(obj), JSON.stringify(sh))
				// 	}
				// }
			})
		}
		else {
			res.type = singleKey
		}
		return res
	}
	else if (typeof obj[singleKey] == "string") {
		// TODO: possibly parse shorthand and put string in "content"
		// e.g. {"text-150%-bold": "Home Page!"}
		let res = {content: obj[singleKey]}
		if (sh.isShorthand) {
			res.type = sh.elementType
			Object.keys(sh.additional).forEach(k => res[k] = sh.additional[k])
		}
		else {
			res.type = singleKey
		}
		return res
	}
}

function fixLink(obj) {
	if (obj.address) {
		obj.href = obj.address
		delete obj.address
	}
	if (obj.text) {
		obj.content = obj.text
		delete obj.text
	}
	return obj
}

function fixButton(obj) {
	if (obj.text) {
		obj.content = obj.text
		delete obj.text
	}
	return obj
}

// "abc [link text](https://www.website.com/)"
// "abc <a href="https://www.website.com">link text</a>"
// NOTE: this is a completely wonky way of doing it, and it's not sure that it doesn't have bugs.
// Re-do this part with a simple regex (doing this on a plane and I don't have a regex reference).
function parseMarkdownLinks(st) {
  var result = [];
  // split on left square bracket "["
  // "abc [def](ghi) jkl [mno](pqr) [stu] [random] st (uff)" =>
  // ["abc ", "def](hgi) jkl ", "mno](pqr) ", "stu] ", "random] st (uff)"]
  var split1 = st.split("[");
  // if there's only 1 string, there's no right bracket and hence no markdown
  if (split1.length == 1) {
    return st;
  }
  // move the 0th string to result and remove it from here
  result.push(split1[0]);
  split1 = split1.slice(1);
  // of remaining strings, split at right close paren ")"
  split1.forEach(s => {
    var split2 = s.split(")");
    // if there's no right paren and hence one string, it's not markdown
    // prepend the removed open bracket and leave this string alone
    if (split2.length == 1) {
      result.push("[" + s);
      return;
    }
    // if there are other ")", replace and capture them into this var
    var split2Remainder = split2.slice(1).join(")");
    // console.log("split2Remainder:", split2Remainder);
    // split on "](", the separator of text and href
    // only target split2[0] because that's the first markdown link in this split
    var split3 = split2[0].split("](");
    // no result, AKA no markdown, AKA return it untouched
    if (split3.length == 1) {
      result.push("[" + s);
      return;
    }
    // get text and href
    var linkText = split3[0];
    var linkHref = split3[1];
    // if there are other "](" they will be replaced in remained, they're not part of the markdown
    var split3Remainder = split3.slice(2).join("](");
    // console.log("split3Remainder:", split3Remainder);
    // return the result
    result.push(util.format('<a href="%s">%s</a>%s%s', 
        linkHref, linkText, split3Remainder, split2Remainder));
  });
  return result.join("");
}
