let os = require("os")
// 
// Groups
// 
module.exports = {
    isWindows: os.type() == 'Windows_NT',
    isMac: os.type() == 'Darwin',
    isLinux: os.type() == "Linux",
}
