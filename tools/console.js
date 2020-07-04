let args = [...process.argv]
let cwd = args.shift()
let currentExecutable = args.shift()
let OS = require("./os")
let FS = require("./file_system")

module.exports = {
    args,
    addToPath: (aPath) => {
        if (OS.isWindows) {
            process.env.Path = `${FS.unixToWindowsPath(aPath)};${process.env.Path}`
        } else {
            process.env.PATH = `${aPath}:${process.env.PATH}`
        }
    }
}