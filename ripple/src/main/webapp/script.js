
/**Carousel function that allows cards to move to the left or right by one.*/
$("#cardCarousel").on("slide.bs.carousel", function(e) {
  var $e = $(e.relatedTarget);
  var idx = $e.index();
  var itemsPerSlide = 3;
  var totalItems = $(".carousel-item").length;

  if (idx >= totalItems - (itemsPerSlide - 1)) {
    var it = itemsPerSlide - (totalItems - idx);
    for (var i = 0; i < it; i++) {
      // append slides to end
      if (e.direction == "left") {
        $(".carousel-item")
          .eq(i)
          .appendTo(".carousel-inner");
      } else {
        $(".carousel-item")
          .eq(0)
          .appendTo($(this).find(".carousel-inner"));
      }
    }
  }
});

// Display an alert containing the inputted address if user presses enter
function searchAddress(e){
  addressInput = document.getElementById("address-input").value;
  if (e.keyCode === 13) {
    alert("You are searching: " + addressInput);
  }
  return false;
}
