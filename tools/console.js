let args = [...process.argv]
let cwd = args.shift()
let currentExecutable = args.shift()

module.exports = {
    args,
}