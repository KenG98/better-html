// This module is necessary because the user of the CLI won't have the dependencies.
// This will inline the dependencies using browserify so that it can write to the
// user's output folder.

// After making changes here, get browserify and run:
// browserify -t brfs inlined-files.js --standalone inlinedFiles --node -o inlined-files-bundle.js
// or install dev dependencies and run 
// node ../node_modules/browserify/bin/cmd.js -t brfs inlined_files.js --standalone inlinedFiles --node -o inlined_files_bundle.js

const fs = require('fs')

module.exports = {
  // necessary files to include
  "purecss/grids-responsive-min.css": 
      fs.readFileSync("../site-resources/purecss/grids-responsive-min.css"),
  "purecss/pure-min.css": 
      fs.readFileSync("../site-resources/purecss/pure-min.css"),
  "rainbow/rainbow.js": 
      fs.readFileSync("../site-resources/rainbow/rainbow.js"),
  "rainbow/generic.js": 
      fs.readFileSync("../site-resources/rainbow/generic.js"),
  "rainbow/html.js": 
      fs.readFileSync("../site-resources/rainbow/html.js"),
  "rainbow/github.css": 
      fs.readFileSync("../site-resources/rainbow/github.css"),
  "betterhtml/bhtml.css": 
      fs.readFileSync("../site-resources/betterhtml/bhtml.css"),
  "betterhtml/bhtml.js": 
      fs.readFileSync("../site-resources/betterhtml/bhtml.js"),
  "filenames": [
    "purecss/grids-responsive-min.css",
    "purecss/pure-min.css",
    "rainbow/rainbow.js",
    "rainbow/generic.js",
    "rainbow/html.js",
    "rainbow/github.css",
    "betterhtml/bhtml.css",
    "betterhtml/bhtml.js",
  ],
  // some boilerplate files
  "index.yml": fs.readFileSync("../site-resources/boilerplate/index.yml"),
  "settings.yml": fs.readFileSync("../site-resources/boilerplate/settings.yml"),
  "parameters.yml": fs.readFileSync("../site-resources/boilerplate/parameters.yml"),
  "styles.yml": fs.readFileSync("../site-resources/boilerplate/styles.yml"),
  "templates.yml": fs.readFileSync("../site-resources/boilerplate/templates.yml"),
  "index-tutorial.yml": fs.readFileSync("../site-resources/boilerplate/index-tutorial.yml"),
  "templates-tutorial.yml": fs.readFileSync("../site-resources/boilerplate/templates-tutorial.yml"),
  // starter template descriptions
  templates: {
    empty: {
      normalInclude: []
    },
    basic: {
      normalInclude: ["index.yml", "settings.yml", "styles.yml", "parameters.yml", "templates.yml"]
    },
    tutorial: {
      normalInclude: ["settings.yml", "styles.yml", "parameters.yml"],
      specialInclude: {
        "index.yml": "index-tutorial.yml",
        "templates.yml": "templates-tutorial.yml"
      }
    },
    advanced: {
      normalInclude: []
    }
  }
}
