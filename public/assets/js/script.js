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
    userScreen();
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

function userScreen() {
  var IsRegistered = firebase.functions().httpsCallable("IsRegistered")
  IsRegistered().then(registered => {
    console.log(registered.data)
    if (registered.data == "inter")
      location.href = "https://signnow-app.web.app/vip"
    document.getElementsByClassName("form_container")[0].remove();
    document.getElementsByClassName("ph")[0].remove();
    document.getElementsByClassName("ph")[0].remove();
    document.getElementById("registration").remove();
    document.getElementsByClassName("overlay")[0].remove();
    document.getElementsByClassName("brand_logo")[0].remove()
    var logo = document.createElement('img')
    var menu = logo.cloneNode(true)
    var disconnect = logo.cloneNode(true)
    disconnect.classList = "disconnect"
    menu.src = "assets/img/menuButton.svg"
    disconnect.src = "assets/img/disconnect.svg"
    menu.classList = "menuButton"
    logo.classList = "brand_logo"
    logo.src = "logo/logo_blue.png";
    if (registered.data == "customer") {
      document.getElementsByClassName("user_card")[0].classList.add('registered_user')
      document.getElementsByClassName("user_card")[0].innerHTML += `
      <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        פרטי שיחה
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button> 
      </div>
    </div>
  </div>
</div>
<ul id="lang" class="list-group" style="padding: inherit">
<li class="list-group-item active">ישראלית</li>
<li class="list-group-item">ישראלית - ערבית</li>
<li class="list-group-item">ישראלית - רוסית</li>
</ul>
<div class="custom-control custom-checkbox">
  <input type="checkbox" class="custom-control-input" id="customCheck1">
  <label class="custom-control-label" for="customCheck1">מעוניין בתמלול</label>
</div>
<div class="phone" onclick="ask()"" type="button" data-toggle="modal" data-target="#exampleModal">
<img src="assets/img/green_phone.svg">
</div>`
      document.getElementById("lang").onclick = function (res) {
        this.getElementsByClassName("active")[0].classList.toggle("active");
        res.target.classList.toggle("active")
      }
    } else {
      document.getElementsByClassName("user_card")[0].classList.add('registration_form')
      document.getElementsByClassName("user_card")[0].innerHTML += `
      <h4> פרטים אישיים </h4>
      <ul class="list-group registration_fields">
      <li ><input placeholder="שם" id="name"></li>
      <li ><input placeholder="ת.ז" id="id"></li>
      <li ><input placeholder="מספר טלפון" type="tel" id="phone"></li>
      <li ><input placeholder="כתובת" id="address"></li>
      </ul>
      <div class="createCustomer" onclick="createCustomer()"">
      <h3> רישום </h3>
      </div>`
    }
    $('.header')[0].append(disconnect)
    $('.header')[0].append(logo)
    $('.header')[0].append(menu)
    $('.header').addClass("bottomLine")

    $('.disconnect')[0].addEventListener('click', function () {
      firebase.auth().signOut();
    })

    $('.menuButton')[0].addEventListener('click', function () {
      $('.content')[0].classList.toggle("move")
    })

  })
}

function createCustomer() {
  var data = {}
  $(".registration_fields li").each((i, el) => data[el.firstChild.id] = el.firstChild.value)
  var x = firebase.functions().httpsCallable("CreateCustomer")
  x(data)
}

function ask() {
  var askreq = firebase.functions().httpsCallable('InterpretationRequest');
  var listen = firebase.functions().httpsCallable('Listen');
  var requestID = firebase.auth().currentUser.uid + new Date().getTime();
  askreq({
    requestID: requestID
  }).then(() => {
    var time = 1;
    var interval = setInterval(() => {
      $(".modal-body").text("אנחנו מחפשות את המתורגמן.ית עם הדירוג הכי גבוה במערכת" + " " + time)
      time++
      if (time == 30) {
        $(".modal-body").text("סליחה, לא מצאנו")
        clearInterval(interval)
      }
    }, 1000);
    var maxTimes = 0;
    var interval2 = setInterval(() => {
      listen({
        requestID: requestID
      }).then((res) => {
        if (res.data) {
          clearInterval(interval2)
          clearInterval(interval)
          $(".user_card").html(`<iframe width="100%" height="100%" src="https://appr.tc/r/${requestID}" allow="microphone; camera"></iframe>`)
        }
      }).catch(err => {
        $(".modal-body").text("סליחה, לא מצאנו")
        clearInterval(interval2)
        clearInterval(interval)
      })
      if (maxTimes == 20) {
        clearInterval(interval2)
        clearInterval(interval)
      }
      maxTimes++
    }, 5000);
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
    if ($('#termsV').is(":checked")) {
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
    } else {
      log.innerText = "נא לאשר תנאי שימוש";
      log.classList.toggle("tryAgain");
    }
  }
)

var input = document.getElementById("passInput");
input.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("log").click();
  }
});

var activity = firebase.functions().httpsCallable("UserLastActivity")
document.body.addEventListener("click", () => activity())