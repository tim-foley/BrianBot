const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const allowedChannels = ['GNTRBT3QA',  // bot squad
'GECRA8741', // it devs
'GED6NQTNX', // it
'C2TV7N10C', // QA
'GMQJ70QGG', // classic wow
'CECEET1H8', // photoshop
'CMVMYBD1S'  // mean team
] 

app.use(bodyParser());
app.post('/', function (req, res) {
    const body = req.body;
    if (!body) {
        res.status(200).send({});
        return;
    }
    if (body && body.type === 'url_verification') {
        res.status(200).send({ challenge: body.challenge });
        return;
    }
    const event = body ? body.event : null;
    console.log('BODY', body)
    
    if (allowedChannels.indexOf(event.channel) > -1){
        res.status(200).send();
    }
    else{
        maybeSendALol(body.token, event, () => {
            res.status(200).send()
        })
    }

    

})

function maybeSendALol(token, event, cb){
    const RARE_MESSAGES = ['Shut Up Spencer'];
    const LMAO_MESSAGES = ['haha', 'LOL'];
    const LOL_MESSAGES = ['lol', 'haha']
    let listToUse;
    if (determineRandomness(1, 10000000)){
        listToUse = RARE_MESSAGES
    }
    else if (determineRandomness(1, 1000)){
        listToUse = LMAO_MESSAGES;
    }
    else if (determineRandomness(1, 5)){
        listToUse = LOL_MESSAGES;
    }
    else{
        //noop
        cb();
        return;
    }
    let message = listToUse[Math.floor(Math.random() * listToUse.length)];
    return sendLol(token, event, message, cb);
}

function determineRandomness(expectedVal, outcomes){
    return Math.floor(Math.random() * outcomes) === expectedVal;
}

function sendLol(token, event, message, cb) {
    if (typeof event !== 'object') return cb();


    const body = JSON.stringify({
        channel: event.channel,
        text: `${message}`,
        thread_ts: event.thread_ts || undefined
    })

    request.post('https://slack.com/api/chat.postMessage', {
        body,
        headers: {
            'Authorization': `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json' }
    }, (err, result) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, result)
    })
}




app.listen(process.env.PORT || 4747, () => console.log('Server is live and good'));
