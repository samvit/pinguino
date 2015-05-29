var http = require('http');
var fs = require('fs');

var DATEFILE = "./db/last_date";

// ------------------ TWILIO
var accountSid = 'TWILIO ACCOUNT SID';
var authToken = 'TWILIO ACCOUNT AUTH TOKEN';

var client = require('twilio')(accountSid, authToken);

function sendSMS (msg, number) {
    client.messages.create({
        to: number,
        from: "TWILIO PHONE NUMBER",
        body: msg
    }, function(err, message) {
        console.log(message.sid);
    });
}

function sendNotifications () {
    var numberOne = process.argv[2]
    var numberTwo = process.argv[3]
    sendSMS("Awake", numberOne)
    sendSMS("Awake", numberTwo)
}

// ------------------ FILES
function writeDate(callback) {
    var date = new Date();
    writeFile(DATEFILE, date, callback)
}

function readDate (callback) {
    readFile(DATEFILE, function (data) {
        old_date = new Date(data)
        callback(old_date)
    })
}

function writeFile (path, contents, callback) {
    fs.writeFile(path, contents, function (err) {
        if (err) return console.log(err);
        if (callback) { callback() }
    });
}

function readFile (path, callback) {
    fs.readFile(path, function (err, data) {
        if (err) throw err;
        callback(data)
    });
}

// ------------------ SERVER
function writeResponse(response) {
    response.writeHead(200);
    response.end();
}

function startServer() {
    http.createServer(function (request, response) {
        readDate(function (old_date) {
            writeDate(function () {
                current_date = new Date();
                time_diff_ms = current_date - old_date
                console.log("current_time = ", current_date);
                console.log("time_diff_ms = ", time_diff_ms + "\n");
                if (time_diff_ms > (1000 * 60 * 30)) { // thirty mins
                    sendNotifications()
                }
                writeResponse(response)
            })
        })
    }).listen(80);
}

startServer();
