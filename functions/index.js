const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.SignUp = functions.auth.user().onCreate((user) => {
    const data = {
        "name": user.email,
        "disabled": user.disabled,
        "role": "user",
        "creation": user.metadata.creationTime,
        "id": user.uid
    }
    return admin
        .firestore()
        .collection('users')
        .doc(user.uid)
        .set(JSON.parse(JSON.stringify(data)));
});

exports.SignUp = functions.auth.user().onDelete((user) => {
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
    var room = context.auth.uid+ new Date().getMinutes()
    var message = {
        notification: {
            title: 'בקשת תרגום',
            body: context.auth.token.email,
        },
        data: {uid: room},
        topic: topic
    };

    return(
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

exports.sendInterpreterToServer = functions.https.onCall((data) =>{
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

}
)

exports.sendUserToServer = functions.https.onCall((data) =>{
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

}
)