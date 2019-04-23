# Ignored

I picked Metalsmith and threw out lots of other viable options. Here's a list of them in case I choose to go back on my decision...

Wintersmith, Blacksmith, DocPad, Gatsby, Harp, Assemble, Jekyll, Jinja, Liquid, Pug, Sass, Reveal.js, etc.

# Templating

Looks like adding Handlebars is more complicated than I thought - can't really do nested templated, but can do partials, but partials don't have nested scope like my templates need... It's complicated. 

So maybe my custom templating is actually alright. After all, such a simple tool doesn't need extreme templates, just reusable code and some basic logic ("if-elseif-else" comparisons). More impressive logic can be added after release.

Another thing to make templating logic simpler is to prepend all templating commands with some character, such as "$$". Good for conditionals and argument inclusion.

* $$ if param page-name == home
* $$ param page-content

# Compilation Steps

Now that we're using metalsmith, working with files becomes a bit easier. We can easily collect all pages and templates and process them repeatedly. Here are all compilation steps, without any "level" files (that separation of logic wasn't necessary, metalsmith gives us more fine grained control).

Steps
* Make sure all files have a "type" (page|style|template|global-parameter)
* For all pages:
	* if page has "from-template" key, wrap object content in template
* combine all global parameter files and style files
* For all "page" and "template" types, iterate through all objects for preprocessing:
	* it's a string
		* reserved string? render appropriate object (nbsp, br, etc)
		* is it a shorthand string? "a-b-c (d e) (f g)" - make object, preprocess again
		* is it templating logic? "$$ template xyz" - handle templates and params
		* is it regular text? Turn into text object type, preprocess again
	* it's an object
		* it's a templating type ("$$...")
			* it's a conditional ("$$ if param page-name == home")
				* string or array? wrap it in a "then" key-value
				* parse the condition and create tests, pass, and fail properties
				* preprocess the "pass" and possibly "fail" values
			* it's an arg/param ("$$ param page-name")
				* unfold to "{type: parameter, name: ...}"
			* it's a template ("$$ template name")
				* value is array or string?
					* put it in a param called "content" (neat shorthand for main page templates, you don't need to specify param name, default is content)
				* create a "{type: template, name: ...}" object (maybe also params)
				* preprocess given params
		* NOT a templating type
			* the value is an array or string
				* wrap value in "content" key-val
			* object contains options, styles, classes, or IDs
				* make singular instead of plural (styles -> style)
				* if they're comma separated strings, turn them into lists of strings
			* the key has shorthand
				* add the options, keys, and values to the object
				* appropriately handle new classes, options, styles, and IDs
			* object has templating properties ("$$ if param x == param y")
				* create conditionals property with list of conditionals (create or add on)
				* each conditional has tests, pass, and fail
				* preprocess properties in pass and fail
				* pass and fail may include nested conditional properties
				* appropriately handle classes, options, styles, ids
			* object type is text
				* compile any markdown to html
			* object type is link
				* make sure "address" and "text" become "href" and "content"
			* give object a "type" property ({text: {content: ...}} => {type: text, content: ...})
* collect all templates into a workable dict you can use to easily find them
* Process all "global-patameter" types
	* record them in a separate object for re-use
	* these can only be simple strings, not objects for re-use (that's for templates)
* Process all "style" types
	* seach for params (parsed above) - replace them
	* turn options from comma separated string into a list
* for all pages, render the templating logic (AKA "process")
	* iterate through each object, begin with params set to global parameters
	* object type is template
		* push parameters into scoped param object
		* substitute the appropriate template into place and process it w/ new params
	* object type is conditional
		* run the test, substitute either pass or fail properties
		* process the substituted value (it might contain more conditionals or templates)
	* normal object type (not template or conditional)
		* contains a "conditionals" property
			* for each conditional
				* run tests
				* append appropriate (pass or fail) properties
				* properly handle styles, options, classes, ids (create/append list)
		* check for parameterized properties: {text-size: "$$ param ts"}
			* substitute correct parameter into place for said properties
		* check for parameterized options, styles, classes, ids
			* substitute correct parameters into said options, styles, etc.
* for all pages, do some grid work
	* object type is row
		* child objects are not columns
			* wrap child objects in equally sized columns
		* child columns don't have width
			* assign them all equal width
	* if object isn't row or column but has offset and width
		* wrap in row and column, with offset column
* for all pages, generate body HTML
	* turn all options into inline CSS
	* turn specified styles into classes
	* check for special options
		* span container instead of div
		* non-responsive rows
	* pass along classes, ids, href, style to generate HTML
* for all pages, generate the entire HTML page
	* use JSDOM, prettier
	* head tag with title, CSS, JS, and custom styles
	* body tag w/ relevant JS included in front of and behind body content
* write to build folder:
	* HTML pages
	* assets
	* relevant included CSS and JS (site-resources)
* done!
