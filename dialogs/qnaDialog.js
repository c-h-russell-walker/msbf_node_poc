var builder_cognitiveservices = require("botbuilder-cognitiveservices");

exports.beginDialog = function (session) {
    session.beginDialog('basicQnAMakerDialog');
}

exports.create = function (bot) {
    var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
        knowledgeBaseId: process.env.QnAKnowledgebaseId,
        subscriptionKey: process.env.QnASubscriptionKey
    });

    var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
        recognizers: [recognizer],
        defaultMessage: 'Sorry, no match - try changing the query terms.',
        qnaThreshold: 0.3
    });

    bot.dialog('qnaDialog', basicQnAMakerDialog);
}
