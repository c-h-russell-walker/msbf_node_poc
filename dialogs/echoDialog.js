
exports.beginDialog = function (session) {
    session.beginDialog('echoDialog');
}

exports.create = function (bot) {
    bot.dialog('echoDialog', function (session) {
        session.send("ECHO: You said: %s", session.message.text);
    });
}
