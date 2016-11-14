'use strict'

const http = require(`http`)
const https = require(`https`)

http.globalAgent.maxSockets = 1024
https.globalAgent.maxSockets = 1024
