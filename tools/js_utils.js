module.exports = {
    // shorthand for ignore all errors
    doTry: (func)=> {
        try {
            return func()
        } catch (error) {
            
        }
    }
}