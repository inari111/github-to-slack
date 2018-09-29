"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const config = require('../config.json');
const rp = require('request-promise');
exports.githubWebHook = functions.https.onRequest((req, res) => {
    console.log('body', req.body.comment.body);
    let mentions = '';
    // switch (req.headers["x-github-event"]) {
    //     case 'issue_comment':
    //     case 'pull_request_review_comment':
    //         console.log('ここにきているーーーーーーーーーーーーーーー')
    mentions += mentionNameFrom(req.body.comment.body);
    // break
    // }
    if (mentions === '') {
        return res.status(200).send('end');
    }
    return postToSlack(mentions).then(() => {
        return res.status(200).send('ok');
    }).catch((error) => {
        console.log('err', error);
        return res.status(500).send('Something went wrong while posting the message to Slack.');
    });
});
function mentionNameFrom(body) {
    let name = '';
    const mentions = body.match(/@[a-zA-Z0-9_\-]+/g);
    console.log('mentions from body', mentions);
    if (mentions) {
        mentions.forEach(function (mention) {
            name += convertMentionName(mention) + "\n";
        });
    }
    return name;
}
function convertMentionName(name) {
    return config.account_map[name] || name;
}
function postToSlack(text) {
    return rp({
        method: 'POST',
        uri: 'https://hooks.slack.com/services/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',
        body: {
            text: text + ' へのメンションがありました',
            link_names: 1,
        },
        json: true,
    });
}
//# sourceMappingURL=index.js.map