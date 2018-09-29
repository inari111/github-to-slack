import * as functions from 'firebase-functions';

const config = require('../config.json')
const rp = require('request-promise');


// TODO: issueのコメントかPRのコメントかHeaderのイベントから取得する
// TODO: GitHub Secretをチェックして自分以外が叩けないようにする
export const githubWebHook = functions.https.onRequest((req, res) => {
    let mentions: string = ''
    mentions += mentionNameFrom(req.body.comment.body)

    if (mentions === '') {
        return res.status(200).send('end')
    }

    return postToSlack(mentions).then(() => {
        return res.status(200).send('ok')
    }).catch((error) => {
        console.log('err', error)
        return res.status(500).send('post to Slack error');
    })
});

function mentionNameFrom(body: string) : string {
    let name: string = ''
    const mentions = body.match(/@[a-zA-Z0-9_\-]+/g)
    if (mentions) {
        mentions.forEach(function (mention) {
            name += convertMentionName(mention) + "\n"
        })
    }
    return name
}

function convertMentionName(name: string) : string {
    return config.account_map[name] || name
}

function postToSlack(text: string) {
    return rp({
        method: 'POST',
        uri: functions.config().slack.webhook_url,
        body: {
            text: text + ' へのメンションがありました',
            link_names: 1,
        },
        json: true,
    })
}