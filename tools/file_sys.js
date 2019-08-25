const fs = require("fs")
const http = require('http')
const https = require('https')
const request = require('sync-request')

module.exports = {
    downloadAsync: ({url}) => new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = ''
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => data+=chunk)
            // The whole response has been received. Print out the result.
            resp.on('end', _ => resolve(data))
        }).on("error", (err) => {
            reject(err)
        })
    }),
    download: ({url, to}) => {
        // if no destination given, than return it as a string
        if (to == null) {
            let res = request('GET', url)
            return res.body.toString('utf-8')
        // if a destination is given, write it to a file
        } else {
            let res = request('GET', url)
            let downloadAsString = res.body.toString('utf-8')
            fs.writeFileSync(
                to,
                downloadAsString
            )
        }
    }
}