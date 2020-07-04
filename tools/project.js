const fs = require("fs")
const yaml = require('js-yaml')
const FS = require("./file_system")
const { doTry } = require("./js_utils")

const INFO_FILE_NAME = "info.yaml"

module.exports.root = FS.dirname(FS.findFileInWalkUp(INFO_FILE_NAME))
module.exports.info = yaml.load(doTry(_=>fs.readFileSync(module.exports.root+"/"+INFO_FILE_NAME)||""))

// convert all the paths to be relative to the project dir
let infoPaths = {}
if (module.exports.root) {
    infoPaths = doTry(_=>module.exports.info["(project)"]["(paths)"])||{}
    for (let each in infoPaths) {
        infoPaths[each] = FS.join(module.exports.root, each)
    }
}
// NOTE: for custom yaml tags see https://stackoverflow.com/questions/40977113/js-yaml-issue-with-tags
module.exports.paths = infoPaths