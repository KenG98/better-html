const bhUtil = require('./bhtml_utils.js')
const solver = require('./equation_solver.js')

let templates = {}

module.exports = (files, metalsmith, done) => {
	setImmediate(done)
	if (files.allTemplates) templates = files.allTemplates
	let params = {}
	if (files.globalParameters) params = files.globalParameters
	Object.keys(files)
		.filter(k => files[k].type == "page")
		.forEach(k => {
			params["page-name"] = files[k]["page-name"]
			files[k].contents = render(files[k].contents, params)
		})
}

function render(obj, params) {
	if (Array.isArray(obj)) {
		return bhUtil.flattenArray(obj.map(o => render(o, params)))
	}
	else if (typeof obj == "object") {
		let rendered = renderObj(obj, params)
		if (Array.isArray(rendered)) rendered = bhUtil.flattenArray(rendered)
		return rendered
	}
	else if (typeof obj == "string") {
		return obj
	}
	else {
		throw "Unexpected type for template rendering: " + obj
	}
}

function renderObj(obj, params) {
	// First thing, create a copy of params 
	// so that we don't overwrite higher level scope.
	// There's gotta be a better way to do this but I'm not sure.
	// params = bhUtil.copyObject(params)

	// resolve conditional properties
	if (obj.conditional) {
		obj.conditional.forEach(c => {
			let passed = solver.solve(c.test, params)
			if (passed) {
				Object.keys(c.pass).forEach(k => {
					obj = bhUtil.addValToObj(obj, k, c.pass[k])
				})
			}
			else if (c.fail) {	
				Object.keys(c.fail).forEach(k => {
					obj = bhUtil.addValToObj(obj, k, c.fail[k])
				})	
			}
		})
	}

	// check if there are object properties which are parameters
	// NOTE: this won't work on params in lists (line for a "class")
	Object.keys(obj).forEach(k => {
		let tem = bhUtil.parseTemplate(obj[k])
		if (tem.isTemplate) {
			if (tem.type == "parameter") {
				if (params[tem.name]) {
					obj[k] = params[tem.name]
				}
				else {
					throw "Non-existent parameter: " + tem.name
				}
			}	
		}
	})

	if (obj.type == "template") {
		let thisTem = bhUtil.copyObject(templates[obj.name])
		let newParams = bhUtil.copyObject(params)
		if (obj.parameters)
			Object.keys(obj.parameters).forEach(k => newParams[k] = obj.parameters[k])
		return render(thisTem, newParams)
	}
	else if (obj.type == "parameter") {
		if (params[obj.name]) {
			return render(params[obj.name], params)
		}
		else {
			throw "Non-existent parameter: " + obj.name
		}
	}
	else if (obj.type == "conditional") {
		let passed = solver.solve(obj.test, params)
		if (passed) {
			return render(obj.pass, params)
		}
		else if (obj.fail) {
			return render(obj.fail, params)
		}
		else {
			// throw "Test didn't pass, no 'else' specified."
			return {type: "none"}
		}
	}
	else {
		if (obj.content) {
			obj.content = render(obj.content, params)
		}
		return obj
	}
}
