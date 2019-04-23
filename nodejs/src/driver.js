const fs = require('fs');
const express = require('express');
const portfinder = require('portfinder')
const fullGenerate = require('./full_generate.js')
const chokidar = require('chokidar')
const inlinedFiles = require('./inlined_files_bundle.js')

let app = undefined
let router = undefined
let goodRouter = undefined
let errorRouter = undefined
let hadError = false
const errorMsg = `
  <h1>Generation Error</h1>
  <p>Check logs, fix the error, save the file, and refresh this page.</p>
`
let customErrorMsg = ""

module.exports = {
  init,
  generate,
  serve,
  watch
}

function init(dir, template) {
  if (!template) {
    template = "basic"
  }
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
      fs.mkdirSync(dir + "/source")
      fs.mkdirSync(dir + "/build")
      // include the default files for this template
      inlinedFiles.templates[template].normalInclude.forEach(f => {
        fs.writeFileSync(dir + "/source/" + f, inlinedFiles[f])
      })
      // include the special "renamed" files
      if (inlinedFiles.templates[template].specialInclude) {
        Object.keys(inlinedFiles.templates[template].specialInclude).forEach(f => {
          let thisFileName = inlinedFiles.templates[template].specialInclude[f]
          fs.writeFileSync(dir + "/source/" + f, inlinedFiles[thisFileName])
        })
      }
    }
    else {
      console.log("Directory " + dir + " already exists.")
    }
  }
  catch(e) {
    console.log("Failed to initialize project folder.")
    console.log(e)
  }
}

// expects path of project directory, that's the parent folder which
// contains "src" and "output"
function generate(dir) {
  try {
    fullGenerate(dir)
  }
  catch (e) {
    console.log("With error:", e)
  }
  finally {
    // print when done
    console.log("Done generating site.")
  }
}

function serve(dir, givenPort) {
  try {
    if (!givenPort) givenPort = 8080
    // search the next 20 ports
    portfinder.getPortPromise({port: givenPort, stopPort: givenPort + 20})
      .then((port) => {
        if (port != givenPort) {
          console.log("Port " + givenPort + " wasn't available, using " + port)
        }
        let fullDir = dir + "/build"
        app = express()
        goodRouter = express.Router()
        goodRouter.use('/', express.static(fullDir))
        router = goodRouter
        app.use((req, res, next) => {
          router(req, res, next)
        })
        app.listen(port, () => console.log("Visit http://localhost:" + port))
      })
      .catch((err) => {
        console.log("Unable to find usable port.")
        console.log(err)    
      })
  }
  catch (e) {
    console.log("Failed to serve directory:", dir)
    console.log(e)
  }
}

function watch(dir, port) {
  // serve the good router
  serve(dir, port)
  // create the error router
  errorRouter = express.Router()
  errorRouter.use("/*", (req, res) => res.send(errorMsg + customErrorMsg))
  // watch the directory for changes
  const sourceDir = dir + "/source/"
  chokidar.watch(sourceDir).on('change', (event, path) => {
    console.log("Detected file change. Regenerating. Event:", event)
    fullGenerate(dir, (err, files) => {
      if (err) {
        console.log("Generation error.")
        console.log(err)
        customErrorMsg = err
        router = errorRouter
      }
      else {
        console.log("Generation success.")
        router = goodRouter
      }
    })
  })
  console.log("Watching", sourceDir)
}
