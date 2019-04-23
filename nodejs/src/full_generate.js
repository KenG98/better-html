const metalsmith = require('metalsmith')
// const ensureTypes = require('./ensure_types.js')
const contentsToYaml = require('./contents_to_yaml.js')
const wrapFromTemplate = require('./wrap_from_template.js')
const getAllGlobalParams = require('./get_all_global_params.js')
const getAllStyles = require('./get_all_styles.js')
const preprocessStyles = require('./preprocess_styles.js')
const shorthandProcessing = require('./shorthand_processing.js')
const collectTemplates = require('./collect_templates.js')
const processTemplating = require('./process_templating.js')
const gridPreprocessing = require('./grid_preprocessing.js')
const renderHTML = require('./render_html.js')
const renderStyleTag = require('./render_style_tag.js')
const prepHtmlFiles = require('./prep_html_files.js')
const removeExtraFiles = require('./remove_extra_files.js')
const addDependencyFiles = require('./add_dependency_files.js')
const warnNoIndex = require('./warn_no_index.js')

module.exports = function gen(dir, done) {
	const ms = metalsmith(dir)
		.source('./source')
		.destination('./build')
		// figure out a good alternative to ensuring each file has a type
		// (imgs and assets don't match here)
		// .use(ensureTypes)
		.use(contentsToYaml)
		.use(wrapFromTemplate)
		.use(getAllGlobalParams)
		.use(getAllStyles)
		.use(preprocessStyles)
		.use(collectTemplates)
		.use(shorthandProcessing)
		.use(processTemplating)
		.use(gridPreprocessing)
		.use(renderHTML)
		.use(renderStyleTag)
		.use(prepHtmlFiles)
		.use(removeExtraFiles)
		.use(addDependencyFiles)
		.use(warnNoIndex)
	  .clean(true)
	if (done) {
		ms.build(done)
	}
	else {
		ms.build((err, files) => {
			if (err) throw err
		})
	}

		// .build((err, files) => {
		// 	if (err) {
		// 		throw err
		// 	}
		// 	// Object.keys(files).forEach(f => console.log(f))
		// })
}

