const functions = require('firebase-functions');
var najax = $ = require('najax')
const admin = require('firebase-admin');
admin.initializeApp();


exports.SignUp = functions.auth.user().onCreate((user) => {
    const data = {
        "name": user.email,
        "disabled": user.disabled,
        "role": "user",
        "creation": user.metadata.creationTime,
        "id": user.uid,
        "authorized": {
            "terms": false,
            "email": false,
            "forms": false
        }
    }
    return admin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set(JSON.parse(JSON.stringify(data)));
});

exports.Delete = functions.auth.user().onDelete((user) => {
    const data = {
        "name": user.email,
        "disabled": true,
        "id": user.uid
    }
    return admin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set(JSON.parse(JSON.stringify(data)));
});

exports.ask = functions.https.onCall((data, context) => {
    if (context.auth === undefined)
        return false;
    var topic = 'interpreter';
    var room = context.auth.uid + new Date().getMinutes()
    var name = context.auth.token.email;
    if (context.auth.token.name)
        name = context.auth.token.name;
    var message = {
        notification: {
            title: 'בקשת תרגום',
            body: name,
        },
        data: {
            uid: room
        },
        topic: topic
    };

    return (
        admin.messaging().send(message)
        .then((response) => {
            return (room);
        })
        .catch((error) => {
            console.log(error)
            return (false)
        })
    )
})

exports.sendInterpreterToServer = functions.https.onCall((data) => {
    admin.messaging().subscribeToTopic(data.token, data.role)
        .then(function (response) {
            console.log('Successfully subscribed to topic:', response);
            return (true)
        })
        .catch(function (error) {
            console.log('Error subscribing to topic:', error);
            return (false)
        })

    admin.messaging().unsubscribeToTopic(data.token, "users")
        .then(function (response) {
            console.log('Successfully subscribed to topic:', response);
            return (true)
        })
        .catch(function (error) {
            console.log('Error subscribing to topic:', error);
            return (false)
        })

})

exports.sendUserToServer = functions.https.onCall((data) => {
    admin.messaging().subscribeToTopic(data.token, data.role)
        .then(function (response) {
            console.log('Successfully subscribed to topic:', response);
            return (true)
        })
        .catch(function (error) {
            console.log('Error subscribing to topic:', error);
            return (false)
        })

    admin.messaging().unsubscribeToTopic(data.token, "interpreter")
        .then(function (response) {
            console.log('Successfully subscribed to topic:', response);
            return (true)
        })
        .catch(function (error) {
            console.log('Error subscribing to topic:', error);
            return (false)
        })

})


exports.InterpretationRequest = functions.https.onCall((data, context) => {
    requestID = data.requestID
    async function getInters() {
        await admin.firestore().collection("video-metadata").doc(requestID).set({
            customerID: context.auth.uid,
            isAnswered: false,
            requsetTime: new Date().getTime(),
            requestID: requestID
        })
        const snapshot = await admin.firestore().collection('inters-users').get()
        return snapshot.docs.map(doc => doc.data());
    }
    return getInters().then(list => {
        if (list.length === 0)
            return "No-Availability"
        // list.sort()
        list = list.map(inter => inter.token)
        list = list.filter(function (el) {
            return el != null;
        });
        return _send(list, context)
    })

function _send(list, context) {
    var i = 0;
    var message = {
        notification: {
            title: "בקשת תרגום",
            body: context.auth.uid
        },
        webpush: {
            fcm_options: {
                link: `vip?requestID=${requestID}`
            }
        }
    };

    function go() {
        message.tokens = [list[i]]
        if (i + 1 >= list.length) {
            return (
                admin.firestore().collection("video-metadata").doc(requestID).get().then(res => {
                    if (res.data().isAnswered == false) {
                        return admin.messaging().sendMulticast(message)
                            .then(res => {
                                return requestID
                            })
                            .catch(err => {
                                return false
                            })
                    } else
                        return requestID
                })
            )
        } else {
            admin.firestore().collection("video-metadata").doc(requestID).get().then(res => {
                if (res.data().isAnswered == false) {
                    return admin.messaging().sendMulticast(message)
                        .then(res => {
                            return requestID
                        })
                        .catch(err => {
                            return false
                        })
                } else
                    return requestID
            })
            i++;
            setTimeout(go, 1)
        }
    }
    return go()
}

})

exports.listen = functions.https.onCall((data, context) => {

})