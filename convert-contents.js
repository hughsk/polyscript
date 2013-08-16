module.exports = convertContents

function convertContents(str, options) {
  var options = options || {}
    , name = options.name || 'anonymous'
    , args = options.args || []
    , open = '<%'
    , close = '%>'

  var buf = [
      "var buf = [];"
    , "\nbuf.push('"
  ]

  for (var i = 0, len = str.length; i < len; i += 1) {
    if (str.slice(i, 2 + i) == open) {
      i += 2

      var prefix, postfix

      switch (str.substr(i, 1)) {
        case '=':
          prefix = "', ("
          postfix = "), '"
          i += 1
          break
        default:
          prefix = "');"
          postfix = "; buf.push('"
      }

      var end = str.indexOf(close, i)
        , js = str.substring(i, end)
        , start = i
        , n = 0

      while (~(n = js.indexOf("\n", n))) n++
      buf.push(prefix, js, postfix)
      i += end - start + close.length - 1

    } else if (str.substr(i, 1) == "\\") {
      buf.push("\\\\")
    } else if (str.substr(i, 1) == "'") {
      buf.push("\\'")
    } else if (str.substr(i, 1) == "\r") {
      buf.push(" ")
    } else if (str.substr(i, 1) == "\n") {
      buf.push("\\n")
    } else {
      buf.push(str.substr(i, 1))
    }
  }

  buf.push("');\n")
  buf.push("buf = buf.join('');")
  buf.push("buf = Function(")
  buf.push("'return function " + name + "(")
  buf.push(args.join(','))
  buf.push(") {")
  buf.push("' + buf + '")
  buf.push("}')();")
  buf.push("return buf")

  return buf.join('')
}
