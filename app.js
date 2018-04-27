var restify = require('restify');
var azure = require('botbuilder-azure');
var builder = require('botbuilder');


var startDialog = require('./dialogs/startDialog');
var faqDialog = require('./dialogs/faqDialog');
var qnaDialog = require('./dialogs/qnaDialog');
var apiDialog = require('./dialogs/apiDialog');
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
startDialog.create(bot);
faqDialog.create(bot);
qnaDialog.create(bot);
apiDialog.create(bot);
echoDialog.create(bot);


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
        bot.beginDialog(message.address, 'startDialog');
    }
});


// Base entry point for bot interaction
bot.dialog('/', function (session) {
    if (session.conversationData.dialog) {
        session.replaceDialog(session.conversationData.dialog);
    } else {
        session.routeToActiveDialog();
    }
});

// The dialog stack is cleared & faqDialog is invoked when the user enters 'faq'
bot.dialog('faqRoute', function (session, args, next) {
    session.beginDialog('faqDialog');
})
.triggerAction({
    matches: /^faq$/i,
});
