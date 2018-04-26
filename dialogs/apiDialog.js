var builder = require('botbuilder');
var request = require('request');

exports.beginDialog = function (session) {
    session.beginDialog('apiDialog');
}

exports.create = function (bot) {
    bot.dialog('apiDialog', function (session) {

        // TODO - Obviously super POC code here
        var queryParam = encodeURIComponent(session.message.text);
        // queryParam does nothing
        // var url = "https://jsonplaceholder.typicode.com/users&q=" + queryParam;
        var url = "https://jsonplaceholder.typicode.com/users";
        request(url, { json: true, }, (err, res, body) => {
            if (err) {
                return console.log(err);
            } else {
                var message;
                if (res.body && res.body.length) {
                    message = JSON.stringify(res.body[0]);
                } else {
                    message = 'No results found';
                }
                session.send(message);
            }
        });
    });
}
