const yaml = require('yamljs')
const bhUtil = require('./bhtml_utils.js')

module.exports = plugin

// transform the contents of each file to YAML
function plugin(files, metalsmith, done) {
	setImmediate(done);
	Object.keys(files)
		.filter(f => bhUtil.fileTypes.includes(files[f].type))
		.forEach(f => {
			files[f].contents = yaml.parse(files[f].contents.toString('utf8'))
		})
	if (files["settings.yml"]) {
		files.settings = yaml.parse(files["settings.yml"].contents.toString('utf8'))
		delete files["settings.yml"]
	}
}