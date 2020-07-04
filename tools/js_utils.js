module.exports = {
    // shorthand for ignore all errors
    doTry: (func)=> {
        try {
            return func()
        } catch (error) {
            
        }
    },
    get: (obj, keyList, failValue = null) => {
        // convert string values into lists
        if (typeof keyList == 'string') {
            keyList = keyList.split('.')
        }
        // iterate over nested values
        for (var each of keyList) {
            try { obj = obj[each] } catch (e) { return failValue }
        }
        // if null or undefined return failValue
        if (obj == null) {
            return failValue
        } else {
            return obj
        }
    }
}