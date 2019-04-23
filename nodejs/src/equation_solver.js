module.exports = {solve}

const operators = ["==", "!="]
const operatorTests = {
	"==": (x, y) => x == y,
	"!=": (x, y) => x != y,
}

function solve(test, params) {
	for (op of operators) {
		// operator exist in the test string
		if (test.indexOf(op) != -1) {
			// split on the operator
			let sides = test.split(op)
			// trim whitespace
			sides[0] = sides[0].trim()
			sides[1] = sides[1].trim()
			// get left and right hand side values
			let left = sideValue(sides[0], params)
			let right = sideValue(sides[1], params)
			return operatorTests[op](left, right)
		}
	}
	throw "Unrecognized operator: " + test
}

// "param xyz" => "hello"
// "home" => "home"
function sideValue(v, params) {
	let parts = v.split(" ")
	// it's a single string
	if (parts.length == 1) {
		return parts[0]
	}
	// it's preceded by param
	else if (parts.length == 2 && parts[0] == "param") {
		if (params[parts[1]]){
			return params[parts[1]]
		}
		else {
			throw "Unrecognized parameter: " + v
		}
	}
	else if (parts.length > 2 || parts[0] != "param") {
		throw "Equation expects a no-space string or single parameter: " + v
	}
	else {
		throw "Unexpected sideValue() result for query: " + v
	}
}
