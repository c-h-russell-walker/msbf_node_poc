var builder = require('botbuilder');

exports.beginDialog = function (session) {
    session.beginDialog('startDialog');
}

exports.create = function (bot) {
    bot.dialog('startDialog', [
        function (session, args, next) {
            var title = "Welcome to GoTestBot!";
            var subtitle = "What can we help you with today?";
            var msg = new builder.Message(session);
            msg.attachments([
                new builder.HeroCard(session)
                    .title(title)
                    .subtitle(subtitle)
                    .buttons([
                        builder.CardAction.dialogAction(
                            session,
                            'faqDialog',
                            undefined,
                            'Ask a Question'
                        ),
                        builder.CardAction.dialogAction(
                            session,
                            'echoDialog',
                            undefined,
                            'Echo Me'
                        ),
                    ]),
            ]);
            session.send(msg);
            session.endDialog();
        }
    ]);
}
