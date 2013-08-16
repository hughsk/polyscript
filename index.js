var cleanify = new (require('cleanify'))()

var convertContents = require('./convert-contents')
var getContents = require('./get-contents')

module.exports = compile

function compile(str) {
  str = '' + str

  var remaining = true
  while (remaining) str = update(str)
  return str

  function update(str) {
    var regex = /\@function\s*?([A-Za-z$_]*?)(?:\s*?\(([^\(]*)\))(?:\s*?\(([^\(]*)\))\s*?\{/
    var matches = str.match(regex)

    if (!matches) {
      remaining = false
      return str
    }

    var generatorName = matches[1] || 'anonymous'
    var generatorArgs = parseArgs(matches[2])
    var generatedArgs = parseArgs(matches[3])

    var generatorStart = matches.index
    var contentStart = matches.index + matches[0].length - 1
    var contentEnd = getContents(str, contentStart)
    var content = str.slice(contentStart + 1, contentEnd - 1)

    content = cleanify.strip(content)
    content = content.replace(/([^A-Z$_])\@([A-Z$_])/gi, function(whole, pref, match) {
      return pref + '<%=' + match + '%>'
    })

    var openTags = content.match(/<%/g).length
    var closeTags = content.match(/%>/g).length

    if (openTags > closeTags) throw new Error('Unclosed tag in generator "' + generatorName + '"')
    if (closeTags > openTags) throw new Error('Solitary closing tag in generator "' + generatorName + '"')

    var fnBody = convertContents(content, { name: generatorName, args: generatedArgs })
    var fn = 'function ' + generatorName + '(' + generatorArgs.join(', ') + ') {' + fnBody + '}'

    return str.slice(0, generatorStart) + fn + str.slice(contentEnd)
  }
}

function parseArgs(argstring) {
  return argstring.trim()
    .split(/\,/g)
    .map(function(str) {
      return str.trim()
    })
}

