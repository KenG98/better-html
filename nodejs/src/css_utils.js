const util = require('util')

const opts = {
  "bold": "font-weight:bold;",
  "italic": "font-style:italic;",
  "underline": "text-decoration:underline;",
  "center": "text-align:center;",
  "centered": "text-align:center;",
}

const optsKeys = Object.keys(opts)

function defaultProp(k) {
  var regString = util.format('%s:%s;', k)
  return (v) => util.format(regString, v)
}

const defaultPropList = [
  "background-color",
  "border-radius",
  "border-color",
  "border-style",
  "border-width",
  "margin",
  "margin-left",
  "margin-right",
  "padding",
  "padding-left",
  "padding-right",
  "font-size",
  "color",
  "text-shadow",
  "text-decoration",
  "display",
  "height",
  "float",
  "overflow",
]

const props = {
  "background-img": (v) => util.format('background-image:url(/assets/%s);background-size:cover;', v),
  "horizontal-padding": (v) => util.format('padding-left:%s;padding-right:%s;', v, v),
  "vertical-padding": (v) => util.format('padding-top:%s;padding-bottom:%s;', v, v),
  "align": (v) => util.format('text-align:%s;', v),
  "width-style": (v) => util.format('width:%s', v),
  // "": (v) => util.format('', v),
}

// if the user uses the prop "left-padding", rename it to the
// relevant CSS property "padding-left"
const propRename = {
  "left-padding": "padding-left",
  "right-padding": "padding-right"
}

defaultPropList.forEach(p => props[p] = defaultProp(p))

const propsKeys = Object.keys(props)
const propRenameKeys = Object.keys(propRename)

function getCssProp(k, v) {
  if (propsKeys.includes(k)) {
    return props[k](v)
  }
  else if (propRenameKeys.includes(k)) {
    return getCssProp(propRename[k], v)
  }
  else {
    return null
  }
}

function getCssOpt(opt) {
  if (optsKeys.includes(opt)) {
    // handle regular options (bold, italic, center, ...)
    return opts[opt]
  }
  // handle percentage sizes
  else if (opt.indexOf("%") == opt.length-1) {
    let size = Number(opt.slice(0, opt.length-1)) / 100 + "em"
    return props["font-size"](size)
  }
  // handle pixel sizes
  else if (opt.indexOf("px") == opt.length-2) {
    return props["font-size"](opt)
  }
  else {
    return null
  }
}

module.exports = {
  getCssProp,
  getCssOpt
}