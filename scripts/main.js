'use strict';

var map, infowindow, geocoder;

var curpos = {
  lat: 34.6896969,
  lng: 135.1889427
};

// Initializes AfterFiver.
function AfterFiver() {
  this.checkSetup();

  this.mapTab = document.getElementById('map-tab');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');
  this.goButton = document.getElementById('go');

  this.mapTab.addEventListener('click', refreshMap);
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.goButton.addEventListener('click', this.go.bind(this));

  this.initFirebase();
}

AfterFiver.prototype.initFirebase = function () {
  // TODO(DEVELOPER): Initialize Firebase.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};


// Go After Fiver.
AfterFiver.prototype.go = function () {
  if (document.getElementById('drawer').classList.contains('is-visible')) {
    document.querySelector('.mdl-layout').MaterialLayout.drawerToggleHandler_();
  }
  initMap();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: curpos,
    radius: 500,
    types: ['store']
  }, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  });









};

// Signs-in After Fiver.
AfterFiver.prototype.signIn = function (facebookUser) {
  // Sign in Firebase using popup auth and facebook as the identity provider.
  var provider = new firebase.auth.FacebookAuthProvider();
  provider.addScope('public_profile');
  provider.addScope('user_likes');
  this.auth.signInWithPopup(provider);
};

// Signs-out of After Fiver.
AfterFiver.prototype.signOut = function () {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
AfterFiver.prototype.onAuthStateChanged = function (user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Only change these two lines!
    var userName = user.displayName; // Only change these two lines!

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
AfterFiver.prototype.checkSignedInWithMessage = function () {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};









// Checks that the Firebase SDK has been correctly setup and configured.
AfterFiver.prototype.checkSetup = function () {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
      'actually a Firebase bug that occurs rarely. ' +
      'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
      'and make sure the storageBucket attribute is not empty. ' +
      'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
      'displayed there.');
  }
};

window.onload = function () {
  window.AfterFiver = new AfterFiver();
};

function initMap() {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map'), {
    center: curpos,
    //    scrollwheel: false,
    zoom: 16,
    language: 'en'
  });
  infowindow = new google.maps.InfoWindow();
  geocoder = new google.maps.Geocoder();

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      curpos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infowindow.setPosition(curpos);
      infowindow.setContent('here');
      infowindow.open(map);
      map.setCenter(curpos);

      geocoder.geocode({
        'location': curpos
      }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            var marker = new google.maps.Marker({
              position: curpos,
              map: map
            });
            infowindow.setContent(results[1].formatted_address);
            document.getElementById('location').value = results[1].formatted_address.split(',')[0];
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    }, function () {
      handleLocationError(true, infowindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infowindow, map.getCenter());
  }
}

function refreshMap() {
  setTimeout(function() {
  google.maps.event.trigger(map, 'resize');
  }, 100);
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function () {
    console.log(place.name);
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function handleLocationError(browserHasGeolocation, infowindow, pos) {
  infowindow.setPosition(pos);
  infowindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}