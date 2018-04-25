var restify = require('restify');
var azure = require('botbuilder-azure');
var builder = require('botbuilder');
var builder_cognitiveservices = require("botbuilder-cognitiveservices");

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

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: process.env.QnAKnowledgebaseId,
    subscriptionKey: process.env.QnASubscriptionKey
});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'Sorry, no match - try changing the query terms.',
    qnaThreshold: 0.3
});

bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);

bot.dialog('faqDialog', [
    function (session) {
        builder.Prompts.text(session, 'Enter any questions you may have.')
    },
    function (session, results) {
        session.conversationData.dialog = 'basicQnAMakerDialog';
        session.replaceDialog('basicQnAMakerDialog');
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
    switch (session.conversationData.dialog) {
        case 'basicQnAMakerDialog':
            session.beginDialog(session.conversationData.dialog);
            break;
        default:
            session.send("Goodbye.")
            session.endDialog();
            break;
    }
});
