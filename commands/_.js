const fs = require("fs")
const Console = require("../tools/console")
const Project  = require("../tools/project")
const { get, doTry  } = require("../tools/js_utils")
const yaml = require('js-yaml')
const child_process = require('child_process')
const FS = require("../tools/file_system")
const OS = require("../tools/os") 

let info = Project.info
// version 1.1.1
if (get(info, ["(using_atk_version)"]) == "1.1.1") {
    const DEFAULT_COMMANDS_DIRECTORY = FS.join(Project.root, "commands")
    const COMMANDS_INFO_LOCATION = ["(project)", "(commands)"]
    const COMMANDS_ASSOCIATIONS = ["(project)", "(command_associations)"]
    
    let commandAssociations = {
        // some default associations that users can override
        ".sh": "sh",
        ".js": "node",
        ".rb": "ruby",
        ".py": "python",
        ...get(info, COMMANDS_ASSOCIATIONS, {})
    }
    
    let commands = {}
    // 
    // setup commands from commands folder
    // 
    if (FS.exists(DEFAULT_COMMANDS_DIRECTORY)) {
        let files = FS.ls(DEFAULT_COMMANDS_DIRECTORY)
        for (let each of FS.listFiles(DEFAULT_COMMANDS_DIRECTORY)) {
            // 
            // create commands for each file in the commands folder
            // 
            let commandPath = FS.join(DEFAULT_COMMANDS_DIRECTORY, each)
            let { parentFolders, coreName, extension } = FS.pathPieces(commandPath)
            let basenameNoExtension = coreName
            if (OS.isWindows && extension == ".exe") {
                // TODO: add error if command name already exists
                commands[basenameNoExtension] = [ commandPath ]
            } else if (!OS.isWindows && extension == "") {
                // make sure user can run the file
                let giveCurrentUserExecutePermission = fs.constants.S_IXUSR
                fs.chmodSync(commandPath, giveCurrentUserExecutePermission)
                // TODO: add error if command name already exists
                commands[basenameNoExtension] = [ commandPath ]
            } else {
                // lookup the corrisponding executable
                let exectuableName = commandAssociations[extension]
                // TODO: add error if command name already exists
                commands[basenameNoExtension] = [ exectuableName, commandPath ]
                commands[FS.basename(each)] = [ exectuableName, commandPath ]
            }
        }
    }
    
    // 
    // setup commands from the info file
    // 
    commands = {
        ...commands,
        ...get(info, COMMANDS_INFO_LOCATION, {})
    }

    Console.addToPath()
    
    // 
    // run the correct command (or show the avalible commands)
    // 
    let commandList = Object.keys(commands)
    if (Console.args.length == 0) {
        // TODO: improve me
        console.log(yaml.dump(commands,{flowLevel: -1, lineWidth: 120, indent: 4}))
    // command not found
    } else {
        let [ commandName, ...commandArgs ] = Console.args
        if (!commandList.includes(commandName)) {
            // TODO: improve me
            console.error(`Command not found: ${commandName}\nsimilar commands:\n${commandList.filter(each=>each.startsWith(doTry(_=>commandName[0])||"")).map(e=>`    ${e}`)}`)
        // commandName exists
        } else {
            let command = commands[commandName]
            // if its a script file
            if (command instanceof Array) {
                let execFileArgs = [...command, ...commandArgs]
                let commandName = execFileArgs.shift()
                child_process.execFileSync(
                    commandName,
                    execFileArgs,
                    {stdio: 'inherit'}
                )
            // if its just a command line code
            } else {
                // FIXME: don't use space-join, needs to be escaped
                child_process.execSync(`${command} ${commandArgs.join(" ")}`, {stdio: 'inherit'})
            }
        }
    } 
}

