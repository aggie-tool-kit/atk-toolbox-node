const { args } = require("../tools/console")
const { info } = require("../tools/project")
const { get  } = require("../tools/js_utils")
console.log(JSON.stringify(get(info, args, null)))