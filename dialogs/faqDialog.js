var builder = require('botbuilder');

exports.beginDialog = function (session) {
    session.beginDialog('faqDialog');
}

exports.create = function (bot) {
    bot.dialog('faqDialog', [
        function (session) {
            builder.Prompts.text(session, 'Enter any questions you may have.')
        },
        function (session, results) {
            session.replaceDialog('echoDialog');
        }
    ]);
}
