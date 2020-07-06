var getParams = function (url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

firebase.signedIn = false
firebase.auth().onAuthStateChanged(res => {
  if (res) {
    if (res.displayName)
      window.name = res.displayName;
    else
      window.name = res.email.split("@")[0];
    window.uid = firebase.auth().currentUser.uid;
    document.getElementById("hello").innerText = name;
    if (res.photoURL) {
      $(".profilePIC")[0].src = res.photoURL + "?type=large";
    }
    interpreterScreen();
    firebase.signedIn = true;
    var loginSession = firebase.functions().httpsCallable("UpdateSessionWhenSignIn");
    loginSession();
  } else {
    if (firebase.signedIn == true) {
      firebase.signedIn = false;
      location.reload();
    }
    var provider = new firebase.auth.FacebookAuthProvider();
    $(".FB")[0].addEventListener('click', function () {

      if ($('#termsV').is(":checked")) {

        firebase.auth().signInWithPopup(provider).then(function (result) {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          // ...
        }).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      }
      log.innerText = "נא לאשר תנאי שימוש";
      log.classList.toggle("tryAgain");
    })
  }
  $(".splash").addClass("fade");
  setTimeout(function () {
    $(".splash").remove();
  }, 1000)
})

function interpreterScreen() {
  document.getElementsByClassName("form_container")[0].remove();
  document.getElementsByClassName("ph")[0].remove();
  document.getElementsByClassName("ph")[0].remove();
  document.getElementById("registration").remove();
  document.getElementsByClassName("overlay")[0].remove();
  document.getElementsByClassName("user_card")[0].style = "background: #004E98"
  document.getElementsByClassName("user_card")[0].innerHTML += `<h1 style="color: white">ממתין לשיחה</h1>`
  var menu = document.createElement('img')
  var disconnect = menu.cloneNode(true)
  disconnect.classList = "disconnect"
  menu.src = "assets/img/menuButtonWhite.svg"
  disconnect.src = "assets/img/exit.svg"
  menu.classList = "menuButton"
  $('.header')[0].prepend(disconnect)
  $('.header')[0].append(menu)
  $('.header').addClass("bottomLine")
  $('.disconnect')[0].addEventListener('click', function () {
    firebase.auth().signOut();
  })

  $('.menuButton')[0].addEventListener('click', function () {
    $('.content')[0].classList.toggle("move")
  })
}

function bold() {
  console.log("message not sent");
  const e = document.getElementsByClassName('form_container')[0];
  e.style = `transition: .5s;
                 transform: scale(1.2)`;
  setTimeout(function () {
    e.style = `transition: 1s;
                   transform: scale(1);`
  }, 1000)
}

const log = document.getElementById("log");
log.addEventListener("click",
  function () {
    firebase.auth().signInWithEmailAndPassword(document.getElementById("userInput").value, document
        .getElementById("passInput").value)
      .then(res => {
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          deferredPrompt = null;
        });
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage)
        log.innerText = "נסה שוב";
        log.classList.toggle("tryAgain");
      });
  }
)

var input = document.getElementById("passInput");
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("log").click();
  }
});


// [START get_messaging_object]
// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();
// [END get_messaging_object]
// [START set_public_vapid_key]
// Add the public key generated from the console here.
messaging.usePublicVapidKey(
  'BI03FTOaYp2gq8owAed2AVzoHRddX_X6EEr_vp-sjNvHyILgvvHACN-nwRaxeiENrABOacyw_aKa7CEaWGVteyc');
// [END set_public_vapid_key]

// [START refresh_token]
// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(() => {
  messaging.getToken().then((refreshedToken) => {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    setTokenSentToServer(false);
    // Send Instance ID token to app server.
    sendTokenToServer(refreshedToken);
    // [START_EXCLUDE]
    // Display new Instance ID token and clear UI of all previous messages.
    resetUI();
    // [END_EXCLUDE]
  }).catch((err) => {
    console.log('Unable to retrieve refreshed token ', err);
    showToken('Unable to retrieve refreshed token ', err);
  });
});
// [END refresh_token]

// [START receive_message]
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // [START_EXCLUDE]
  // Update the UI to include the received message.
  appendMessage(payload);
  // [END_EXCLUDE]
});

$(document).ready(function () {
  if (getParams(location.href).requestID) {
    var x = getParams(location.href).requestID
    message = {
      fcmOptions: {
        link: `vip?requestID=${x}`
      },
      notification: {
        title: "בקשת תרגום",
        body: "לחצו לתחילת שיחה"
      }
    }
    appendMessage(message);
  }
})
// [END receive_message]

function appendMessage(message) {
  document.getElementsByClassName("user_card")[0].innerHTML += '<a onclick="isAnswered(this)" data-id=' + message.fcmOptions.link +
    '><p class="list-group-item">' + message.notification.title + ' '
  message.notification.body + '</p></a>'
}

function resetUI() {
  messaging.getToken().then((currentToken) => {
    if (currentToken) {
      sendTokenToServer(currentToken);
    } else {
      // Show permission request.
      console.log('No Instance ID token available. Request permission to generate one.');
      // Show permission UI.
      requestPermission();
      setTokenSentToServer(false);
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    setTokenSentToServer(false);
  });
  // [END get_token]
}


// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    console.log('Sending token to server...');
    var sendToServer = firebase.functions().httpsCallable('SendInterToServer');
    sendToServer({
      "token": currentToken,
      "role": "interpreter"
    }).then(res => {
      if (res == true)
        setTokenSentToServer(true);
    })

  } else {
    console.log('Token already sent to server so won\'t send it again ' +
      'unless it changes');
  }

}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}


function requestPermission() {
  console.log('Requesting permission...');
  // [START request_permission]
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve an Instance ID token for use with FCM.
      // [START_EXCLUDE]
      // In many cases once an app has been granted notification permission,
      // it should update its UI reflecting this.
      resetUI();
      // [END_EXCLUDE]
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
  // [END request_permission]
}
requestPermission();
resetUI();


var activity = firebase.functions().httpsCallable("UserLastActivity")
document.body.addEventListener("click", () => activity())

function isAnswered(el) {
  var IsAnswered = firebase.functions().httpsCallable("interAnswer");
  IsAnswered({
    requestID: el.dataset.id
  }).then(res => {
    console.log(res)
    if (res.data == true) {
      $(".user_card").html(`<iframe width="100%" height="100%" src="https://appr.tc/r/${el.dataset.id}" allow="microphone; camera"></iframe>`)
    } else {
      el.text = `תודה על המענה, אך שיחה זאת נלקחה לפני ${(new Date().getTime() - res.data)/1000} שניות`
    }
  })
}