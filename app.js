var restify = require('restify');
var azure = require('botbuilder-azure');
var builder = require('botbuilder');


var qnaDialog = require('./dialogs/qnaDialog');
var echoDialog = require('./dialogs/echoDialog');


// Setup DB Storage
var documentDbOptions = {
    host: process.env.DBHost,
    masterKey: process.env.DBKey,
    database: 'botdocs',
    collection: 'botdata'
};
var docDbClient = new azure.DocumentDbClient(documentDbOptions);
var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});


// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});


// Listen for messages from users
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(
    connector,
).set(
    'storage', cosmosStorage
);


// Register dialogs with bot
qnaDialog.create(bot);
echoDialog.create(bot);


bot.dialog('faqDialog', [
    function (session) {
        builder.Prompts.text(session, 'Enter any questions you may have.')
    },
    function (session, results) {
        session.conversationData.dialog = 'qnaDialog';
        session.replaceDialog('qnaDialog');
    }
]);


var buttonOptions = [
    'Get an Estimate',
    'Ask a Question',
];
bot.dialog('startBot', [
    function (session, args, next) {
        builder.Prompts.choice(
            session,
            "Welcome to Spray-Net, what can we help you with today?",
            buttonOptions.join('|'),
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
            default:
                session.endDialog();
                break;
        }
    }
]);


// We use this hook to check for start of conversation
bot.on('conversationUpdate', function (message) {
    // Start of conversation
    var membersAdded = message.membersAdded;

    if (
        membersAdded
        &&
        membersAdded.length > 0
        &&
        membersAdded[0].id === message.address.bot.id
    ) {
        bot.beginDialog(message.address, 'startBot');
    }
});


// Base entry point for bot interaction
bot.dialog('/', function (session) {
    console.log('IN SLASH ROUTER')
    switch (session.conversationData.dialog) {
        case 'qnaDialog':
            session.beginDialog(session.conversationData.dialog);
            break;
        default:
            session.beginDialog('echoDialog');
            break;
    }
});
