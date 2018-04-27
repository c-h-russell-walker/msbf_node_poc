var builder = require('botbuilder');

exports.beginDialog = function (session) {
    session.beginDialog('startDialog');
}

exports.create = function (bot) {
    bot.dialog('startDialog', [
        function (session, args, next) {
            var buttonOptions = [
                'Get an Estimate',
                'Ask a Question',
                'Call API',
                'Echo Me',
            ];
            builder.Prompts.choice(
                session,
                "Welcome to TestBot, what can we help you with today?",
                buttonOptions,
                {
                    listStyle: builder.ListStyle.button
                }
            );
        },
        function (session, results, next) {
            switch (results.response.index) {
                case 0: // 'Get an Estimate'
                    session.beginDialog('getAnEstimate');
                    break;
                case 1: // 'Ask a Question'
                    session.beginDialog('faqDialog');
                    break;
                case 2: // 'Call API'
                    session.beginDialog('apiDialog');
                    break;
                case 3: // 'Echo Me'
                    session.beginDialog('echoDialog');
                    break;
                default:
                    session.endDialog();
                    break;
            }
        }
    ]);
}
