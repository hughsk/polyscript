var BRACKET_OPEN  = '{'.charCodeAt(0)
var BRACKET_CLOSE = '}'.charCodeAt(0)
var STRING_SINGLE = "'".charCodeAt(0)
var STRING_DOUBLE = '"'.charCodeAt(0)
var SLASH         = '/'.charCodeAt(0)
var STAR          = '*'.charCodeAt(0)
var NEWLINE       = '\n'.charCodeAt(0)

module.exports = getContents

function getContents(str, start) {
  var l = str.length
  var n = start
  var lastComment = 0
  var longComment = false
  var inComment = false
  var inString = false
  var lastString = 0
  var depth = 0
  var c

  do {
    c = str.charCodeAt(n)

    if (c === NEWLINE && !longComment) {
      inComment = false
    }

    if (c === SLASH) {
      if (!inComment) {
        if (str.charCodeAt(n+1) === SLASH) {
          longComment = false
          inComment = true
        }
        if (str.charCodeAt(n+1) === STAR) {
          lastComment = n
          longComment = true
          inComment = true
        }
      } else
      if (longComment && lastComment+2 !== n) {
        if (str.charCodeAt(n-1) === STAR) {
          inComment = false
        }
      }
    }

    if (c === STRING_SINGLE || c === STRING_DOUBLE && !inComment) {
      if (inString) {
        if (lastString === c) {
          inString = false
        }
      } else {
        lastString = c
        inString = true
      }
    } else
    if (c === BRACKET_OPEN && !inString && !inComment) {
      depth += 1
    } else
    if (c === BRACKET_CLOSE && !inString && !inComment) {
      depth -= 1
    }
  } while (n++ < l && depth)

  return n
}
