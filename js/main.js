var latitude,
    longitude,
    fedLegData,
    senator1 = 0,
    senator2 = 0,
    fedRep = 0,
    stateLegReps,
    apiKey = 'GET AN API KEY FROM THE SUNLIGHTFOUNDATION.COM';


var statesObj = {
    AL: "Alabama",
    AK: "Alaska",
    AS: "American Samoa",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "District Of Columbia",
    FM: "Federated States Of Micronesia",
    FL: "Florida",
    GA: "Georgia",
    GU: "Guam",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MH: "Marshall Islands",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    MP: "Northern Mariana Islands",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PW: "Palau",
    PA: "Pennsylvania",
    PR: "Puerto Rico",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VI: "Virgin Islands",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming"
}


/* enables method on string .capitalizeFirstLetter
======================================================================== */


String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/* Image Error
======================================================================== */

function imgError(image) {
    image.onerror = "";
    image.src = "/images/noimage.png";
    return true;
}


/* Get Location of user and init 
======================================================================== */

function getLocation() {
    if (navigator.geolocation) {
        $("#main-content").html("<img src='images/loading.gif' class='img-responsive center-block'>");
        navigator.geolocation.getCurrentPosition(positionSet);
    } else {
        console.log("fail");
        var errorMessage = "This application requires your location to work."
        $("#error").html(errorMessage);
    }
}

function positionSet(position) {

    $("#main-content").load("pages/start.html");

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    var requestURL = 'https://congress.api.sunlightfoundation.com/legislators/locate?callback=?';

    $.getJSON(requestURL, {
        'apikey': apiKey,
        'latitude': latitude,
        'longitude': longitude,
    }, function (data) {
        initStartScreen(data);
    });
}

/* Sets Senators and Fed Rep
======================================================================== */


function initStartScreen(data) {
    
    $('body').scrollTop(0);
    
    var fedLegData = data;

    for (var n = 0; n < fedLegData.results.length; n++) {
        if (fedLegData.results[n].chamber === "house") {
            fedRep = fedLegData.results[n];
        }
        if (fedLegData.results[n].chamber === "senate") {
            if (senator1 === 0 && fedLegData.results[n].state_rank === "senior") {
                senator1 = fedLegData.results[n];
            } else {
                senator2 = fedLegData.results[n];
            }
        }
    }

    startScreen();
}


function startScreen() {

    document.getElementById('main-left-button').innerHTML = '';
    
    document.getElementById('main-right-button').innerHTML = '';

    setLegislator(senator1, "senator1");

    setLegislator(senator2, "senator2");

    setLegislator(fedRep, "rep");


}

/* Resets Screen for Federal Legislators
======================================================================== */

function backToFedScreen() {
    $('body').scrollTop(0);
    $("#main-content").load("pages/start.html", startScreen);
}



/* Sets Text for Federal Legislators
======================================================================== */

function setLegislator(obj, name) {
    $("#" + name + "-name").html("" + obj.first_name + " " + obj.middle_name + " " + obj.last_name);

    $("#" + name + "-state").html("" + obj.state_name);

    var party;

    if (obj.party === "D") {
        party = "Democrat";
    } else if (obj.party === "R") {
        party = "Republican";
    } else {
        party = "Independent";
    }

    $("#" + name + "-party").html("" + party);

    var imageURL = "https://theunitedstates.io/images/congress/225x275/" + obj.bioguide_id + ".jpg";
    $("#" + name + "-image").attr("src", "" + imageURL);

    $("#" + name + "-term-started").html("" + findDateInString(obj.term_start));

    $("#" + name + "-term-ending").html("" + findDateInString(obj.term_end));

    $("#" + name + "-email").html("" + obj.oc_email);

    $("#" + name + "-email").attr("href", "mailto:" + obj.oc_email);

    $("#" + name + "-phone").html("" + obj.phone);

    $("#" + name + "-phone").attr("href", "tel:" + obj.phone);

    $("#" + name + "-website").html("" + obj.website);

    $("#" + name + "-website").attr("href", "" + obj.website);

    $("#" + name + "-contact-form").attr("href", "" + obj.contact_form);

    if (name === "senator1" || name === "senator2") {
        $("#" + name + "-rank").html("" + obj.state_rank.capitalizeFirstLetter());
    }

    if (name === "rep") {
        $("#" + name + "-district").html("" + obj.district);
    }
}

/* Gets date from string
======================================================================== */

function findDateInString(dateString) {

    var damnDay = "1" + dateString + "1";
    var day = damnDay.slice(9, -1);
    var yearNum = dateString.slice(0, -6);
    var monthNum = dateString.slice(5, -3) - 1;

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var stringOutput = "" + months[monthNum] + " " + parseInt(day) + " " + yearNum;

    return stringOutput;


}


/* Gets Local Rep Info 
======================================================================== */

function getStateLegislators() {

    var requestURL = 'https://openstates.org/api/v1/legislators/geo/?callback=?';

    $.getJSON(requestURL, {
        'apikey': apiKey,
        'lat': latitude,
        'long': longitude,
    }, function (data) {
        console.log(data);
        setStateLigislatorInfo(data);
    });


}

function setStateLigislatorInfo(data) {
    
    $('body').scrollTop(0);
    
    document.getElementById('main-content').innerHTML = '<div class="row text-center"><h2 class="p-a-10">Here are your state representitives</h2><hr></div>';
    stateLegReps = data;

    document.getElementById('main-left-button').innerHTML = '<button onclick="backToFedScreen()">Back</button>';


    for (var x = 0; x < stateLegReps.length; x++) {
        buildStateLegBio(stateLegReps[x]);
    }

}

/* Sets Text for State Legislators
======================================================================== */

function buildStateLegBio(repObj) {
    var contentString = '';
    contentString += '<div class="row bio-section">';
    contentString += '<div class="col-sm-6">';
    contentString += '<img src="' + repObj.photo_url + '" onerror="imgError(this);" class="img-responsive center-block">';
    contentString += '</div>';
    contentString += '<div class="col-sm-6">';
    contentString += '<div class="row text-center">';
    contentString += '<h2>' + repObj.full_name + '</h2>';
    contentString += '<h3>' + repObj.party + '</h3>';

    var capState = repObj.state.toUpperCase();
    contentString += '<h3>' + statesObj[repObj.state.toUpperCase()] + '</h3>';

    contentString += '<h4>District Number: ' + repObj.district + '</h4>';
    contentString += '<h4>Chamber: ' + repObj.chamber.capitalizeFirstLetter() + '</h4>';
    contentString += '</div>';
    contentString += '<div class="row text-center">';
    contentString += '<p><strong>Contact Information</strong></p>';
    contentString += '<p><strong>Email: </strong><a href="mailto:' + repObj.email + '">' + repObj.email + '</a></p>';
    contentString += '<p><strong>Website: </strong><a target="_blank" href="' + repObj.url + '">' + repObj.url + '</a></p>';
    contentString += '</div>';
    contentString += '</div>';
    contentString += '</div>';
    contentString += '<hr>';
 //   contentString += '';
    
    

    document.getElementById('main-content').innerHTML += contentString;
}