const fs = require("fs")
const http = require("http")
const https = require("https")
const path = require("path")
const os = require("os")
const { doTry } = require("./js_utils")


const IS_WINDOWS = os.type() == 'Windows_NT'
const invalidWindowsFileCharacters = /[<>:"\|\?\*\\]/g

let windowsToUnixPath = (windowsPath) => windowsPath.replace(/^\\\\\?\\/,"").replace(/(?:^C:)?\\/g,'\/').replace(/\/\/+/g,'\/')
let ensureUnixPath = (aPath) => (IS_WINDOWS ? windowsToUnixPath(aPath) : aPath)
let unixToWindowsPath = (unixPath) => {
    // invalid windows file characters: https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file?redirectedfrom=MSDN
    // TODO: check for extra-long file names
    // TODO: check and warn against all the windows-banned file names
    // ensure validity first
    let beforeCharRemoval = unixPath
    let afterCharRemoval = unixPath.replace(invalidWindowsFileCharacters, "")
    // warn when characters were removed
    if (beforeCharRemoval.length != afterCharRemoval.length) {
        console.warn(`\nThe filepath: ${unixPath}\nIs being converted from POSIX (linux/mac) to Windows\nHowever, it contains some characters that are invalid on Windows\nThose characters will be deleted\nThe new path will be: ${afterCharRemoval}`)
    }
    // check for root, default to the C: drive
    if (afterCharRemoval.length > 0 && afterCharRemoval[0] == "/") {
        afterCharRemoval = "C:"+afterCharRemoval
    }
    // convert file separators
    return afterCharRemoval.replace(/\/+/, "\\")
}

module.exports = {
    windowsToUnixPath,
    unixToWindowsPath,
    join:              (...args)=>ensureUnixPath(path.join(...args)),
    dirname:           path.dirname,
    listParentFolders: (aPath)=> {
            let pieces = []
            if (path.isAbsolute(aPath)) {
                pieces.push("/")
            }
            // add all the parent folders
            return pieces.concat(path.dirname(module.exports.normalize(aPath)).split("/").filter(e=>e.length!=0))
        },
    basename:          path.basename, // TODO: change to POSIX bas
    extname:           path.extname,
    normalize:         (aPath) => ensureUnixPath(path.normalize(aPath)),
    pathPieces:        (aPath) => {
            let extension = path.extname(aPath)
            let basename = path.basename(aPath)
            let basenameNoExtension = basename.slice(0, basename.length - extension.length)
            return {
                parentFolders: module.exports.listParentFolders(aPath),
                coreName: basenameNoExtension,
                extension,
            }
        },
    isAbsolute:        (aPath) => doTry(_=>aPath[0]=="/"),
    exists:            (aPath) => fs.existsSync(aPath),
    isFolder:          (aPath) => doTry(_=>fs.statSync(aPath).isDirectory())||false,
    isFile:            (aPath) => doTry(_=>fs.existsSync(aPath)&&!fs.statSync(aPath).isDirectory())||false,
    cwd:               ()=>ensureUnixPath(process.cwd()),
    walkUp:            (aPath) => {
            let pathsFromWalkUp = [ aPath ]
            // until we hit root
            while (path.dirname(aPath) != aPath) {
                aPath = path.dirname(aPath)
                pathsFromWalkUp.push(aPath)
            }
            return pathsFromWalkUp
        },
    findFileInWalkUp:  (file) => {
            let possiblePaths = module.exports.walkUp(process.cwd()).map(each=>path.join(each, file))
            for (let each of possiblePaths) {
                // if the file exists return the path
                if (doTry(_=>fs.statSync(each).isFile())) {
                    return each
                }
            }
        },
    read:              (filepath) => doTry(_=>fs.readFileSync(filepath, "utf-8"))||null,
    ls:                (aPath=".") => fs.readdirSync(aPath),
    listFiles:         (aPath=".") => fs.readdirSync(aPath).filter(each=>module.exports.isFile(module.exports.join(aPath,each))),
    listFolders:       (aPath=".") => fs.readdirSync(aPath).filter(each=>module.exports.isFolder(module.exports.join(aPath,each))),
    downloadAsync: ({ url }) =>
        new Promise((resolve, reject) => {
            https
                .get(url, (resp) => {
                    let data = ""
                    // A chunk of data has been recieved.
                    resp.on("data", (chunk) => (data += chunk))
                    // The whole response has been received. Print out the result.
                    resp.on("end", (_) => resolve(data))
                })
                .on("error", (err) => {
                    reject(err)
                })
            // TODO: add a "to" option
        }),
}

// aliases
Object.assign(module.exports, {
    // isFolder
    isDirectory: module.exports.isFolder,
    isDir:       module.exports.isFolder,
})