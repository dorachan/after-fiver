'use strict';

var result_route = [
  {
    id: 1,
    name: "Kobe Haborland",
    address: "1 Higashi Kawasaki-cho, Chuo-ku, Kobe",
    description: "Romantic evening port with vivid coloured illuminations and sparkling cruise ships.",
    duration: "2 hours",
    stay_time: "20min",
    distance: "30km",
    fee: "0JPY",
    img: "http://www.feel-kobe.jp/kobe-yakei/area/sea_side/02/images/01.png",
    restauratn: "uni"
},
  {
    id: 2,
    name: "Rokko Garden Terrace",
    address: "1877-9 Gofuke yama Rokkosan-cho, Nada-ku, Kobe",
    description: "Romantic dinner with a beautiful panoramic view.",
    duration: "1 hour",
    stay_time: "20min",
    distance: "15km",
    fee: "0JPY",
    img: "http://www.feel-kobe.jp/kobe-yakei/area/mountain/06/images/01.png",
    restauratn: "beef"
},
  {
    id: 3,
    name: "Pearl Bridge (Akashi kaikyo Bridge)",
    //address: "Higashi Maiko-cho, Tarumi-ku, Kobe",
    address: "2051 Higashimaikocho, Tarumi Ward, 神戸市垂水区 Hyogo Prefecture 655-0047",
    description: "The longest suspension bridge in the world. Incredible reinbow coloured illuminations.",
    duration: "1 hour",
    stay_time: "20min",
    distance: "15km",
    fee: "1,000 JPY",
    img: "http://www.feel-kobe.jp/kobe-yakei/area/sea_side/01/images/01.png",
    restauratn: ""
}

];

var map, infowindow, geocoder, directions, directionsDisplay;
var ary = [];
var waypts = [];
var renderFLG = false;
var directionsDisplay;
var mode;
var oldDirections = [];
var currentDirections = null;
var defaultStartSpot = "新神戸駅";
var defaultEndSpot = "伊丹空港";
var curStartSpot, curEndSpot;
var stepDisplay;
var markerArray = [];
var _waypts = [];



var centerpos = {
  lat: 34.6896969,
  lng: 135.1889427
};

var curpos = {
  lat: 34.6896969,
  lng: 135.1889427
};

// Initializes AfterFiver.
function AfterFiver() {
  this.checkSetup();

  this.mapTab = document.getElementById('tab-2');
  this.videoTab = document.getElementById('tab-4');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');
  this.goButton = document.getElementById('go');
  this.switch1 = document.getElementById('switch-1');
  this.switch2 = document.getElementById('switch-2');

  this.mapTab.addEventListener('click', refreshMap);
  this.videoTab.addEventListener('click', showVideo);
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.goButton.addEventListener('click', this.go.bind(this));
  this.switch1.addEventListener('click', this.toggleswitch1.bind(this));
  this.switch2.addEventListener('click', this.toggleswitch2.bind(this));

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
  changeList();
  makeList(result_route);

  /*
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
  */
};

AfterFiver.prototype.toggleswitch1 = function () {
  var ss = document.getElementById('switch-1');
  if (ss.checked) {
    document.getElementById('switch-1-input').style.display = 'none';
  } else {
    document.getElementById('switch-1-input').style.display = 'block';
  }
};

AfterFiver.prototype.toggleswitch2 = function () {
  var ss = document.getElementById('switch-2');
  if (ss.checked) {
    document.getElementById('switch-2-input').style.display = 'none';
  } else {
    document.getElementById('switch-2-input').style.display = 'block';
  }
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
    if (user.photoURL) {
      var pic = document.createElement('img');
      pic.src = user.photoURL;
      pic.className = 'user-pic';
      this.userPic.appendChild(pic);
    }

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
    center: centerpos,
    //    scrollwheel: false,
    zoom: 13,
    language: 'en'
  });
  infowindow = new google.maps.InfoWindow();
  geocoder = new google.maps.Geocoder();
  directions = new google.maps.DirectionsService();

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      curpos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //infowindow.setPosition(curpos);
      //infowindow.setContent('here');
      //infowindow.open(map);
      map.setCenter(centerpos);

      geocoder.geocode({
        'location': curpos
      }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            var marker = new google.maps.Marker({
              position: curpos,
              map: map
            });
            //infowindow.setContent(results[1].formatted_address);
            //document.getElementById('location').value = results[1].formatted_address.split(',')[0];
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

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      curpos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //infowindow.setPosition(curpos);
      //infowindow.setContent('here');
      //infowindow.open(map);
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
            //infowindow.setContent(results[1].formatted_address);
            // document.getElementById('location').value = results[1].formatted_address.split(',')[0];
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

function makeList(data) {
  var ListItem = React.createClass({
    render: function () {
      return (
        React.createElement('div', {
            className: 'demo-card-wide mdl-card mdl-shadow--2dp',
            key: this.props.key
          },
          React.createElement('div', {
              className: 'mdl-card__title',
              id: 'list_title_' + this.props.id
            },
            React.createElement('h2', {
              className: 'mdl-card__title-text'
            }, this.props.name)),
          React.createElement('div', {
            className: 'mdl-card__supporting-text'
          }, 'Duration: ' + this.props.duration + ' / StayTime: ' + this.props.stay_time + ' / Distance: ' + this.props.distance + ' / Fee: ' + this.props.fee),
          React.createElement('div', {
              className: 'mdl-card__actions mdl-card--border'
            },
            React.createElement('a', {
              className: 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect',
              "data-number": this.props.id,
              onClick: makeRoute
            }, 'View Route'),
            React.createElement('a', {
              className: 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect',
              "data-number": this.props.id,
              onClick: makeRoute
            }, 'Detail')
          )

        )
      );
    }
  });

  var ListList = React.createClass({
    render: function () {
      var ListNodes = this.props.data.map(function (route) {
        return (React.createElement(ListItem, {
          key: route.id,
          id: route.id,
          name: route.name,
          address: route.address,
          description: route.description,
          duration: route.duration,
          stay_time: route.stay_time,
          distance: route.distance,
          fee: route.fee,
          img: route.img
        }));
      });
      return (
        React.createElement('div', {
            className: 'mdl-cell mdl-cell--12-col',
            key: 'react-listing'
          },
          ListNodes
        )
      );
    }
  });



  var ListBox = React.createClass({
    componentDidUpdate: function () {},
    loadDataFromServer: function () {},
    getInitialState: function () {
      return {
        data: data
      };
    },
    componentDidMount: function () {
      this.setState({
        data: data
      });
    },
    render: function () {
      return (
        React.createElement(ListList, {
          data: this.state.data,
          key: 'react-lists'

        })
      );
    }

  });

  var elem = document.getElementById('react-list');
  ReactDOM.render(React.createElement(ListBox, {
    key: 'react-list'
  }), elem);
}


function makeRoute(e) {
  var num = e.currentTarget.getAttribute('data-number');
  changeMap();
  initMap();
  calcRoute(num);
  render();
  setTimeout(function () {
    google.maps.event.trigger(map, 'resize');
    map.setCenter(centerpos);
  }, 100);
}


function changeMap() {
  document.getElementById('tab-1').classList.remove('is-active');
  document.getElementById('tab-2').classList.remove('is-active');
  document.getElementById('tab-3').classList.remove('is-active');
  document.getElementById('tab-4').classList.remove('is-active');
  document.getElementById('tab-2').classList.add('is-active');
  document.getElementById('fixed-tab-1').classList.remove('is-active');
  document.getElementById('fixed-tab-2').classList.remove('is-active');
  document.getElementById('fixed-tab-3').classList.remove('is-active');
  document.getElementById('fixed-tab-4').classList.remove('is-active');
  document.getElementById('fixed-tab-2').classList.add('is-active');
}

function changeList() {
  document.getElementById('tab-1').classList.remove('is-active');
  document.getElementById('tab-2').classList.remove('is-active');
  document.getElementById('tab-3').classList.remove('is-active');
  document.getElementById('tab-4').classList.remove('is-active');
  document.getElementById('tab-3').classList.add('is-active');
  document.getElementById('fixed-tab-1').classList.remove('is-active');
  document.getElementById('fixed-tab-2').classList.remove('is-active');
  document.getElementById('fixed-tab-3').classList.remove('is-active');
  document.getElementById('fixed-tab-4').classList.remove('is-active');
  document.getElementById('fixed-tab-3').classList.add('is-active');
  document.getElementById('fixed-tab-3').scrollIntoView(true);
}







function refreshMap() {
  setTimeout(function () {
    google.maps.event.trigger(map, 'resize');
  }, 100);
  //getLocation();
  //initMap();
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function () {
    console.log(place.name);
    //infowindow.setContent(place.name);
    //infowindow.open(map, this);
  });
}

function handleLocationError(browserHasGeolocation, infowindow, pos) {
  infowindow.setPosition(pos);
  infowindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}

function showVideo() {
  setTimeout(function () {
    document.getElementById('video-container').style.display = 'block';
    document.getElementById('video-player').src = "https://www.nhk.or.jp/nhkworld/app/vod/?vid=JoZGwxeDoM5t2pK2Ls6npDn6w4fVRi1g";
  }, 100);

}






function render() {
  //dbg("render:"+renderFLG);
  renderFLG = true;
  /* ルートをレンダリング */
  directionsDisplay = new google.maps.DirectionsRenderer({
    "map": map,
    "preserveViewport": true,
    "draggable": true
      //"suppressMarkers" : true
  });
  stepDisplay = new google.maps.InfoWindow();
  /* 右カラムにルート表示 */
  //directionsDisplay.setPanel(document.getElementById("directions_panel"));
  /* 出発地点・到着地点マーカーが移動された時 */
  google.maps.event.addListener(directionsDisplay, 'directions_changed', function () {
    currentDirections = directionsDisplay.getDirections();
    result_route.push(currentDirections);
    var route = currentDirections.routes[0];
    var distance = 0;
    var distance_temp = "";
    var duration_temp = 0;
    var duration = 0;
    var duration_h = 0;
    var duration_h_temp = "";
    var duration_m = 0;
    var duration_m_temp = "";
    var s = "";
    for (var i = 0; i < route.legs.length; i++) {
      var routeSegment = i + 1;
      s += route.legs[i].start_address + 'to';
      s += route.legs[i].end_address + '\n';
      s += route.legs[i].distance.text;
      s = "<li>" + route.legs[i].start_address + "=>" + route.legs[i].end_address + "(" + route.legs[i].distance.text + ":" + route.legs[i].duration.text + ")</li>";
      distance_temp = route.legs[i].distance.text;
      distance_temp = Number(distance_temp.split("km")[0]);
      distance += distance_temp;
      duration_temp = route.legs[i].duration.text;
      duration_h_temp = Number(duration_temp.split("時間")[0]);
      if (duration_temp.match("時間")) {
        duration_temp = duration_temp.split("時間")[1];

      }
      duration_m_temp = Number(duration_temp.split("分")[0]);
      duration_m_temp = duration_m_temp / 60;
      duration += duration_h_temp + duration_m_temp;
      // $("#roots").append(s);
    }
    s = defaultStartSpot + "------>" + ary[0] + "------>" + defaultEndSpot;
    duration = String(Math.floor(duration)) + "時間" + String(Math.floor((duration - Math.floor(duration)) * 60)) + "分";
    s += "=====" + duration;
    // $("#roots").append(s);

    console.log(distance + "km:" + duration);
    console.log(result_route);
  });
}

function calcRoute(num) {
  curStartSpot = defaultStartSpot;
  curEndSpot = defaultEndSpot;

  var ary = [];

  if (num) {
    ary[0] = result_route[num - 1].address;
  } else {
    ary = ["兵庫県神戸市中央区 東川崎町1丁目7番2号"];
  }
  waypts = [{
    location: ary[0],
    stopover: true
  }];

  mode = google.maps.DirectionsTravelMode.DRIVING;
  if (!renderFLG) render();
  if (curStartSpot == defaultStartSpot && curEndSpot == defaultEndSpot) {
    console.log("全ルート");
    //全ルート
    _waypts = waypts;
  } else {
    //一部ルート
    _waypts = [];
  }

  var s1 = document.getElementById('switch-1');
  var s2 = document.getElementById('switch-2');
  var i1 = document.getElementById('start-loc');
  var i2 = document.getElementById('dest-loc');
  if (s1.checked) {
    curStartSpot = curpos;
  } else {
    if (i1.value) {
      curStartSpot = i1.value;
    }
  }
  if (s2.checked) {
    curEndSpot = curpos;
  } else {
    if (i2.value) {
      curEndSpot = i2.value;
    }
  }

  var request = {
    waypoints: _waypts,
    optimizeWaypoints: true,
    origin: curStartSpot,
    /* 出発地点 */
    destination: curEndSpot,
    /* 到着地点 */
    travelMode: mode /* 交通手段 */
  };
  /* ルート描画 */
  console.log("request-----");
  console.log(request);
  directions.route(request, function (response, status) {
    console.log(response);

    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      //showSteps(response);
    } else {
      alert("その交通手段はリクエスト結果がありません\nstatus:" + status);
    }
  });
}

function showSteps(directionResult) {
  // For each step, place a marker, and add the text to the marker's
  // info window. Also attach the marker to an array so we
  // can keep track of it and remove it when calculating new
  // routes.
  var myRoute = directionResult.routes[0].legs;
  var marker;

  for (var i = 0; i < myRoute.length; i++) {
    var icon = "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + i + "|FF0000|000000";
    if (i === 0) {
      icon = "https://chart.googleapis.com/chart?chst=d_map_xpin_icon&chld=pin_star|car-dealer|00FFFF|FF0000";
    }
    marker = new google.maps.Marker({
      position: myRoute.start_location,
      map: map,
      icon: icon
    });
    attachInstructionText(marker, myRoute.start_address);
    markerArray.push(marker);
  }
  marker = new google.maps.Marker({
    position: myRoute.end_location,
    map: map,
    icon: "https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=flag|ADDE63"
  });
  markerArray.push(marker);

  google.maps.event.trigger(markerArray[0], "click");
}

function attachInstructionText(marker, text) {
  google.maps.event.addListener(marker, 'click', function () {
    // Open an info window when the marker is clicked on,
    // containing the text of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}