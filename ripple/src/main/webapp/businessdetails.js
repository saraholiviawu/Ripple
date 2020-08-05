/* Add a review: Change color of the elements according to user input onmouseover or onclick 
   If event is onclick, set user choice in local storage.
   If onclick event is for a star rating, enable the button */
function addColorToRating(ratingType, rating, maxRating, elementIdPrefix, addClass, isOnClick=false) {
  if (isOnClick == true) {
    localStorage.setItem(ratingType, rating);
    console.log("addColorToRating local storage: " + localStorage.getItem(ratingType));
    // Enable post button if user has made a star rating
    if (ratingType == "starRating") {
      enableElement("bd-post-review-button");
    }
  }
  var elementId;
  // Color current and preceding elements
  var i;
  for (i = 1; i <= rating; i++) {
    elementId = elementIdPrefix + i.toString();
    $(elementId).addClass(addClass);
  }
  // Reset color of remaining elements to neutral
  var j;
  for (j = rating + 1; j <= maxRating; j++) {
    elementId = elementIdPrefix + j.toString();
    $(elementId).removeClass(addClass);
  }
}

/* Add a review: If no ratings have yet been made, all color will be removed from elements
   Otherwise, ratings will be restored to last clicked value based on local storage */
function removeColorFromRating(ratingType, rating, maxRating, elementIdPrefix, addClass) {
  // Reset all colors to neutral if no ratings have been set
  var currRating = localStorage.getItem(ratingType);
  if (currRating == null) {
    var j;
    for (j = 1; j <= maxRating; j++) {
      elementId = elementIdPrefix + j.toString();
      $(elementId).removeClass(addClass);
    }
  } else {
    addColorToRating(ratingType, parseInt(currRating), maxRating, elementIdPrefix, addClass);
  }
}

/* [SMRUTHI TODO] Serve blob images in a gallery */

/* [SMRUTHI TODO] Add business tags above restaurant header */

/* [SMRUTHI TODO] Add a review: Function will add new review to firestore, then refresh the page to see changes.
   Have already stored starRating (1-5) and priceRating (null, 1, 2, or 3) in local storage. Will need to add frontend as well */
function newReview() {
  location.reload();
  clearLocalStorage(["starRating", "priceRating"]);
}

/* Load all business details on the body onload */
function bdOnload() {
  // TEMPORARY LOCAL STORAGE
  localStorage.setItem("businessId", "uxq1XtM4zIHqxmdnjnf0");
  
  // Read local storage values
  businessId = localStorage.getItem("businessId");

  // Access 'businessDetails' collection
  var lambda = (doc) => {
        if (doc.exists) {
          // Read and iterate over blobKeys, add the images to carousel.
          var i;
          for (i = 0; i < doc.data().galleryBlobKeys.length; i++) {
            console.log(doc.data().galleryBlobKeys[i]);
            createCarouselElement(doc.data().galleryBlobKeys[i], "imageGallery");
          }

          // Read business phone number and add to DOM 
          phoneNum = doc.data().phoneNum;
          addTextToDom(phoneNum, "bd-phone-number");

          // Read business website href and display string. Add to DOM 
          hrefBusinessWebsite = doc.data().businessWebsite[0];
          addHrefToDom(hrefBusinessWebsite, "business-website");
          displayBusinessWebsite = doc.data().businessWebsite[1];
          addTextToDom(displayBusinessWebsite, "business-website");

          // Prevent layout shift: display the business details page once a few elements load on the page
          document.getElementById("loading-mask").style.display = "none";

          // Read sumStarRatings & numStarRatings
          sumStarRatings = doc.data().sumStarRatings;
          numStarRatings = doc.data().numStarRatings;
          avgStarRatings = sumStarRatings / numStarRatings;
          calculateStars(avgStarRatings, numStarRatings);
          displayStarReviewSummary(avgStarRatings, numStarRatings);

          // Read sumPriceRatings & numPriceRatings
          sumPriceRatings = doc.data().sumPriceRatings;
          numPriceRatings = doc.data().numPriceRatings;
          avgPriceRatings = sumPriceRatings / numPriceRatings;
          calculatePrice(avgPriceRatings, numPriceRatings);

          // Read latestUpdatedTimestamp. Convert to a date. Add to DOM 
          lastUpdatedTimestamp = doc.data().lastUpdatedTimestamp;
          lastUpdatedDate = lastUpdatedTimestamp.toDate().toDateString();
          formattedUpdatedDate = parseDate(lastUpdatedDate);
          addTextToDom(formattedUpdatedDate, "bd-last-update-timestamp");

          // Read latest announcementTimestamp. Convert to a date. Add to DOM 
          announcementTimestamp = doc.data().announcementTimestamp;
          announcementDate = announcementTimestamp.toDate().toDateString();
          formattedAnnouncementDate = parseDate(announcementDate);
          addTextToDom(formattedAnnouncementDate, "bd-announcement-date");

          // Read latest announcements. Add to DOM
          announcementText = doc.data().announcementText;
          addTextToDom(announcementText, "bd-announcement-text");

          // Read business story. Add to DOM 
          businessStory = doc.data().businessStory;
          addTextToDom(businessStory, "bd-story-text");
          
          // Read team blob keys, names, positions and bio. Serve all blob keys to page
          // Display first team member's name, position, and bio. Pass all other team member's
          // information as parameters in an onclick function within their blob key image 
          teamBlobKeyList = doc.data().teamBlobKeyList;
          teamNameList = doc.data().teamNameList;
          teamPositionList = doc.data().teamPositionList;
          teamBioList = doc.data().teamBioList;
          iterateAndDisplayTeamInfo(teamBlobKeyList, teamNameList, teamPositionList, teamBioList);
 
          // Read safety info list. Display corresponding text image / text 
          safetyInfoList = doc.data().safetyInfo;
          displaySafetyInfoImages(safetyInfoList);

          // Read open hours. Iterate through each day and add to DOM. 
          // Update Quick Info section to display "Open" or "Closed" based on current user's time
          openHoursByDay = doc.data().openHours;
          displayAndHighlightOpenHours(openHoursByDay);
          
          // Read delivery links. Add as the href of a service image if link is not empty
          deliveryLinks = doc.data().deliveryLinks;
          iterateAndAddDeliveryLinkHrefs(deliveryLinks);

        } else {
          console.log("Error: business document does not exist");
        }
      }
  getDocByDocId("businessDetails", businessId, lambda);

  var lambda2 = (doc) => {
        if (doc.exists) {
          var j;
          for (j = 0; j < 4; j++) {
            console.log("tags: " + Object.keys(doc.data().tags).toString());
            //createCarouselElement(doc.data().galleryBlobKeys[i], "imageGallery");
          }
        }
  }
  getDocByDocId("businesses", businessId, lambda2);
}

/* Address (Quick Info section): Display street addres */
function iterateAndDisplayAddress(addressArray) {
  // Nothing
}

/* Display review summary: Determine number of full stars, half stars or empty stars to return */
function calculateStars(avgStarRatings, numStarRatings) {
  if (numStarRatings == 0) {
    displayStars(0, 0);
    // 0 for # reviews
  } else if ((1 <= avgStarRatings) && (avgStarRatings < 1.25)) {
    displayStars(1, 0);
  } else if ((1.25 <= avgStarRatings) && (avgStarRatings < 1.75)) {
    displayStars(1, 1);
  } else if ((1.75 <= avgStarRatings) && (avgStarRatings < 2.25)) {
    displayStars(2, 0);
  } else if ((2.25 <= avgStarRatings) && (avgStarRatings < 2.75)) {
    displayStars(2, 1);
  } else if ((2.75 <= avgStarRatings) && (avgStarRatings < 3.25)) {
    displayStars(3, 0);
  } else if ((3.25 <= avgStarRatings) && (avgStarRatings < 3.75)) {
    displayStars(3, 1);
  } else if ((3.75 <= avgStarRatings) && (avgStarRatings < 4.25)) {
    displayStars(4, 0);
  } else if ((4.25 <= avgStarRatings) && (avgStarRatings < 4.75)) {
    displayStars(4, 1);
  } else {
    displayStars(5, 0);
  }
}

/* Display review summary: If no reviews yet, change stars to a neutral color. 
Otherwise, display correct star types (full, half, empty) and colors */
function displayStars(numFullStars, numHalfStars) {
  var numTotalStars = 5;
  var elementId;
  // add the fa-star, fa-star-half-o, or fa-star-o class OR neutral-color for no reviews yet
  if ((numFullStars == 0) && (numHalfStars == 0)) {
    console.log("displayStars(): no reviews yet");
    return;
  }
  // Replace empty star with full star and add color
  var i;
  for (i = 1; i <= numFullStars; i++) {
    elementId = "#star-" + i; 
    $(elementId).removeClass("fa-star-o");
    $(elementId).addClass("fa-star");
    $(elementId).addClass("star-color");
  }
  // Replace empty star with half star and add color
  var j = numFullStars + 1;
  numHalfMax = numFullStars + numHalfStars;
  if (numHalfMax  > numTotalStars) {
    return false;
  }
  for (j; j <= numHalfMax; j++) {
    elementId = "#star-" + j; 
    $(elementId).removeClass("fa");
    $(elementId).removeClass("fa-star-o");
    $(elementId).addClass("fas");
    $(elementId).addClass("fa-star-half-alt");
    $(elementId).attr("aria-hidden","true"),
    $(elementId).addClass("star-color");
  }
  // Add color to remaining stars
  var m = numHalfMax + 1;
  while (m <= numTotalStars) { 
    elementId = "#star-" + m; 
    $(elementId).addClass("star-color");
    m = m + 1;
  }
  console.log("displayStars(" + numFullStars + ", " + numHalfStars + ")");
}

/* Display review summary: Display the average star ratings and number of users who left a review */ 
function displayStarReviewSummary(avgStarRatings, numStarRatings) {
  // If no reviews, keep default text "No reviews yet"
  if (numStarRatings == 0) {
      return;
  } else { // Otherwise, add star review summary to DOM, hide default text, display 
    // Add star review summary to DOM
    addTextToDom(RoundDecimals(avgStarRatings), "bd-average-rating");
    addTextToDom(numStarRatings, "bd-number-reviews");
    // If only 1 star review, change text from plural "reviews" to singular"review"
    if (numStarRatings == 1) {
      addTextToDom("review", "sing-plural-review");
    }
    // Hide default text
    hideElement("no-review-summary");
    // Display populated review summary
    $("#review-summary").removeClass("display-none");
  }
}

/* Display review summary: Given an float, function rounds decimals to the tenths place. Ex: 3.14 -> 3.1 */
function RoundDecimals(float) {
  var roundedFloat = Math.round(float * 10) / 10;
  return roundedFloat;
  console.log("roundedFloat: " + roundedFloat);
}

/* Display review summary: If no reviews yet, default price display is N/A. 
Otherwise, calculate correct price rating $, $$, or $$$ */
function calculatePrice(avgPriceRatings, numPriceRatings) {
  // Default display is N/A if no price reviews have been made
  if (numPriceRatings != 0) {
    if ((1 <= avgPriceRatings) && (avgPriceRatings < 1.5)) {
      displayPrice("$");
    } else if ((1.5 <= avgPriceRatings) && (avgPriceRatings < 2.5)) {
      displayPrice("$$");
    } else { // 2.5 <= avgPriceRatings <= 3
      displayPrice("$$$");
    }
  }
}

/* Display review summary: Display the number of dollar signs for price rating on the page */
function displayPrice(dollarString) {
  addTextToDom(dollarString, "bd-price");
}

/* Our team: Iterate through each teamBlobKey. Create an image element containing their avatar */
function iterateAndDisplayTeamInfo(teamBlobKeyList, teamNameList, teamPositionList, teamBioList) {
  var length = teamBlobKeyList.length;
  var teamMember;
  for (teamMember = 0; teamMember < length; teamMember++) {
    // Add avatar image blob key to the page
    createImageElement(teamMember, teamBlobKeyList[teamMember], teamNameList[teamMember],
       teamPositionList[teamMember], teamBioList[teamMember]);
  }
}

/* Our team: Return an image element with an onclick function passing in team name,
   position, & bio parameters. Generate unique ids to access during onclick event */
function createImageElement(teamMember, teamBlobKey, teamName, teamPosition, teamBio) {
  // Create an img tag with an onclick function storing the team member's name, position, bio
  var formattedTeamName = escapeSpecialCharacters(teamName);
  var formattedTeamPosition = escapeSpecialCharacters(teamPosition);
  var formattedTeamBio = escapeSpecialCharacters(teamBio);
  var content = `
      <img id="bd-team-member-${teamMember}" class="inline-block-child bd-avatar" 
          src="/serve?blob-key=${teamBlobKey}" 
          onclick="highlightAndDisplayTeamMemberInfo(this.id, '${formattedTeamName}', 
          '${formattedTeamPosition}', '${formattedTeamBio}');">
      `;
  // Append img tag to the inner HTML of div containing all blob key image elements
  teamBlobKeysElement = document.getElementById("team-blob-keys");
  teamBlobKeysElement.innerHTML = teamBlobKeysElement.innerHTML + content;
  // After HTML has been loaded, add highlight the first time member
  if (teamMember == 0) {
    firstTeamMemberImageElement = document.getElementById("bd-team-member-0");
    firstTeamMemberImageElement.click();
  }
}

/* Our team: Onclick function unhighlights all team member avatars and highlight the 
   team member of interest. Swap the existing teamName, teamPosition, and teamBio */   
function highlightAndDisplayTeamMemberInfo(clicked_id, formattedTeamName, 
    formattedTeamPosition, formattedTeamBio) {
      console.log("called highlightAndDisplayTeamMemberInfo()");
      $(".bd-avatar").removeClass("bd-team-highlight");
      $("#" + clicked_id).addClass("bd-team-highlight");
      addTextToDom(formattedTeamName, "bd-team-name");
      addTextToDom(formattedTeamPosition, "bd-team-position");
      addTextToDom(formattedTeamBio, "bd-team-bio");
}

/* Safety info: Iterate through safety information and determine whether to display 
   service "offered" or "not offered" visuals for each list element */
function displaySafetyInfoImages(safetyInfoList) {

  // Determine maskBlobKey image and text to serve
  var isMask = safetyInfoList[0];
  var maskBlobKey;
  var maskText;
  var maskTextId = "bd-mask-text";
  if (isMask) { // Set to "offered" color and text 
    maskBlobKey = blob.MASK;
    maskText = "Mask required upon entry";
  } else {
    // Change visual and text to "not offered" color
    maskBlobKey = blob.NO_MASK;
    maskText = "No mask required";
    $("#" + maskTextId).addClass("neutral-lighter-text");
  }

  // Determine deliveryBlobKey image and text to serve
  var isDelivery = safetyInfoList[1];
  var deliveryBlobKey;
  var deliveryText;
  var deliveryTextId = "bd-delivery-text";
  if (isDelivery) { // Set to "offered" color and text 
    deliveryBlobKey = blob.DELIVERY;
    deliveryText =  "Delivery offered";
  } else {
    // Change visual and text to "not offered" color
    deliveryBlobKey = blob.NO_DELIVERY;
    deliveryText =  "No delivery";
    $("#" + deliveryTextId).addClass("neutral-lighter-text");
  }

  // Determine pickupBlobKey image and text to serve
  var isPickup = safetyInfoList[2];
  var pickupBlobKey;
  var pickupText;
  var pickupTextId = "bd-pickup-text";
  if (isPickup) { // Set to "offered" color and text 
    pickupBlobKey = blob.PICKUP;
    pickupText = "Pickup offered";
  } else {
    // Change visual and text to "not offered" color
    pickupBlobKey = blob.NO_PICKUP;
    pickupText = "No pickup";
    $("#" + pickupTextId).addClass("neutral-lighter-text");
  }

  // Determine outdoorBlobKey image and text to serve
  var isOutdoor = safetyInfoList[3];
  var outdoorBlobKey;
  var outdoorText;
  var outdoorTextId = "bd-outdoor-dining-text";
  if (isOutdoor) { // Set to "offered" color and text 
    outdoorBlobKey = blob.OUTDOOR;
    outdoorText = "Outdoor dining offered";
  } else {
    // Change visual and text to "not offered" color
    outdoorBlobKey = blob.NO_OUTDOOR;
    outdoorText = "No outdoor dining";
    $("#" + outdoorTextId).addClass("neutral-lighter-text");
  }

  // Serve all blob keys
  var blobKeyList = [maskBlobKey, deliveryBlobKey, pickupBlobKey, outdoorBlobKey];
  var blobKeyIdList = ["bd-mask-img-id", "bd-delivery-img-id", "bd-pickup-img-id", "bd-outdoor-dining-img-id"];
  var blobNum;
  for (blobNum = 0; blobNum < blobKeyList.length; blobNum++) {
    serveBlob(blobKeyList[blobNum], blobKeyIdList[blobNum]);
  }

  // Add all text to DOM 
  var serviceText = [maskText, deliveryText, pickupText, outdoorText]
  var serviceTextId = [maskTextId, deliveryTextId, pickupTextId, outdoorTextId]
  var textNum;
  for (textNum = 0; textNum < serviceText.length; textNum++) {
    addTextToDom(serviceText[textNum], serviceTextId[textNum]);
  }

  // Display max occupancy details
  var maxOcc = safetyInfoList[4];
  var maxOccId = "bd-max-occ-num";
  if (maxOcc == -1) { // If max occupany is not applicable to business
    // Set the visual and the text in the "not offered" color
    addTextToDom("n/a", maxOccId);
    $("#" + maxOccId).addClass("neutral-lighter-text");
    $("#" + "bd-max-occ-text").addClass("neutral-lighter-text");
  } else { // Otherwise, add max occ value to DOM
    addTextToDom(maxOcc.toString(), maxOccId);
  }
}

/* Open Hours: Iterate through each day of the weeks' open hours and add to DOM. 
   Check current day and highlight that day's hours on the page.
   Add "Open" or "Closed" closed status to Quick Info section */
function displayAndHighlightOpenHours(openHoursByDay) {
  // Initialize a list of ids to get the elements for displaying each day
  var dayIdList = ["bd-sun-hrs", "bd-mon-hrs", "bd-tues-hrs", 
      "bd-wed-hrs", "bd-thur-hrs", "bd-fri-hrs", "bd-sat-hrs"];
  // Display hours for each week and add to DOM
  var dayOfWeek; 
  for (dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    addTextToDom(openHoursByDay[dayOfWeek], dayIdList[dayOfWeek]);
  }
  // Check what current day is. Highlight today's hours in primary dark color
  var today = new Date();
  var currDay = today.getDay();
  $("#" + dayIdList[currDay]).addClass("bd-hrs-highlight");
  $("#" + dayIdList[currDay]).addClass("boldest-text");
  // If current hour and minute are within business open hours range, 
  // display "Open". Otherwise, display "Closed"
  if (openHoursByDay[currDay] == "Closed") {
    addTextToDom(openHoursByDay[currDay], "bd-open-closed");
  } else {
    var openOrClosedStatus = openOrClosed(today, openHoursByDay[currDay]);
    addTextToDom(openOrClosedStatus, "bd-open-closed");
  }
}

/* Open or Closed: Returns "Open" or "Closed" in the Quick Info section depending 
   on whether current hour and minute is within the business open hours range */
function openOrClosed(today, openHoursToday) {
  // Set return values
  var closed = "Closed";
  var open = "Open";
  // Get current hour between 0-23
  currHour = today.getHours();
  console.log("currHour: " + currHour);

  // If business is has no open hours today, display "Closed" in Quick Info section
  if (openHoursToday == closed) {
    addTextToDom(openHoursToday, "bd-open-closed");

  } else { // Otherwise, continue checking if business is currently open
    console.log("openHoursToday: " + openHoursToday + " ");
    var openHoursArray = openHoursToday.split(" ");
    startTime = openHoursArray[0];
    endTime = openHoursArray[2];
    // Get military hour of startTime or endTime given ex: "11:00am"
    var startColonIndex = startTime.indexOf(":");
    var startTimePeriod = startTime.slice(-2);
    var startOpenHour = convertHourToMilitaryTime(startTimePeriod, startTime.substr(0, startColonIndex));
    console.log("firstTimePeriod: " + startTimePeriod);
    console.log("firstOpenHour: " + startOpenHour);
    var endColonIndex = endTime.indexOf(":");
    var endTimePeriod = endTime.slice(-2);
    var endOpenHour = convertHourToMilitaryTime(endTimePeriod, endTime.substr(0, endColonIndex));
    console.log("endTimePeriod: " + endTimePeriod);
    console.log("endOpenHour: " + endOpenHour);
    currMinute = today.getMinutes();
    console.log("currMinute: " + currMinute);
    var startOpenMinute = removePrecedingZero(startTime.substr(startColonIndex + 1, 2));
    console.log("startOpenMinute: " + startOpenMinute);
    var endOpenMinute = removePrecedingZero(endTime.substr(startColonIndex + 1, 2));
    console.log("endOpenMinute: " + endOpenMinute);
    // If currHour is equal to startOpenHour and endOpenHour, check if currMinute is 
    // between the minutes of the start open minutes (inclusive) & end open minutes (exclusive)
    if (currHour == startOpenHour && currHour == endOpenHour) {
      console.log("currHour == startOpenHour && currHour == endOpenHour");
      if (isWithinRange(parseInt(currMinute), parseInt(startOpenMinute), parseInt(endOpenMinute), true)) {
        return open;
      } else {
        return closed;
      }
    }
    // If currHour is equal to startOpenHour, check if currMinute is equal to or after minute business has opened
    if (currHour == startOpenHour) {
      console.log("currHour == startOpenHour");
      console.log("is startOpenMinute < currMinute: " + startOpenMinute + " < " + currMinute);
      if (parseInt(startOpenMinute) <= parseInt(currMinute)) {
        return open;
      } else {
        return closed;
      }
    }
    // If currHour is equal to endOpenHour, check if currMinute is earlier than the minute the business closes
    if (currHour == endOpenHour) {
      console.log("currHour == endOpenHour");
      console.log("is currMinute < endOpenMinute: " + currMinute + " < " + endOpenMinute);
      if (parseInt(currMinute) < parseInt(endOpenMinute)) {
        return open;
      } else {
        return closed;
      }
    }
    // If currHour is not within startOpenHour (exclusive) and endOpenHour, return "closed" immediately
    if (isWithinRange(parseInt(currHour), parseInt(startOpenHour), parseInt(endOpenHour)) == false) {
      return closed;
    } else { // Check if currMinute is within startOpenMinute and endOpenMinute
      return open;
    }
  }
}

/* Open or Closed: For pm hours, add 12 hours to convert to military time. 
   For am hours, set 12 am to 0 am */
function convertHourToMilitaryTime(timePeriod, hour) {
  if (timePeriod == "am") {
    if (hour == "12") {
      return "0";
    }
    return hour;
  } else { // timePeriod == "pm"
    var intHour = parseInt(hour) + 12;
    return intHour.toString();
  }
}

/* Open or Closed: If minutes contain a preceding 0 (ex: "01" returns "1") 
   Otherwise return minutes. */
function removePrecedingZero(minutes) {
  if (minutes.charAt(0) == "0") {
    return minutes.charAt(1);
  } else {
    return minutes;
  }
}

/* Order delivery: Iterate through each delivery link and add as an href 
   for each delivery type. If the link is an empty string, hide the element */
function iterateAndAddDeliveryLinkHrefs(deliveryLinks) {
  var deliveryLinkIdList = ["uber-eats", "postmates", "grubhub"];
  var maxLen = deliveryLinkIdList.length;
  console.log("delivery link length: " + length);
  var service;
  var link;
  for (service = 0; service < maxLen; service++) {
    link = deliveryLinks[service];
    linkId = deliveryLinkIdList[service];
    if (link) { // Link is provided. Add href.
      addHrefToDom(deliveryLinks[service], linkId);
    } else { // Link is empty str. Hide image of service.
      hideElement(linkId);
    }
  }
}