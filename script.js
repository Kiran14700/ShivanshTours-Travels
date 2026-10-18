
$(document).ready(function () {
  const googleScriptURL =
    "https://script.google.com/macros/s/AKfycbzsFYTTjdu1k1S0DOYpsGNs1yQkH1Tla3g7ajj3F2MY1802iFAL5OSHx5T0sIkW0u31MQ/exec";

  const carCapacity = {
    "Sedan": 4,
    "Ertiga": 6,
    "Innova": 6,
    "Innova Crysta": 8
  };

  const $car = $("#car");
  const $passengers = $("#passengers");
  const $bookingForm = $("#bookingForm");
  const $feedbackForm = $("#feedbackForm");
  const $bookingStatus = $("#bookingStatus");
  const $feedbackStatus = $("#feedbackStatus");
  const $reviewsList = $("#reviewsList");

  // Use the local date, avoiding UTC date shifts.
  function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  $("#currentYear").text(new Date().getFullYear());

  $("#travelDate").attr("min", getLocalDate());
  $("#reviewDate").attr("max", getLocalDate());

  // Passenger options depend on the selected car.
  function updatePassengerOptions(selectedValue) {
    const carName = $car.val();
    const capacity = carCapacity[carName];

    $passengers.empty();

    if (!capacity) {
      $passengers
        .append(new Option("Select car first", ""))
        .prop("disabled", true)
        .val("");
      return;
    }

    $passengers.append(new Option("Select passengers", ""));

    for (let i = 1; i <= capacity; i++) {
      $passengers.append(new Option(String(i), String(i)));
    }

    $passengers.prop("disabled", false);

    if (
      selectedValue &&
      Number(selectedValue) >= 1 &&
      Number(selectedValue) <= capacity
    ) {
      $passengers.val(String(selectedValue));
    } else {
      $passengers.val("");
    }
  }

  $car.on("change", function () {
    updatePassengerOptions("");
  });

  // Initialize passenger dropdown on page load.
  updatePassengerOptions("");

  // Clicking a service or car card scrolls to booking.
  $("[data-scroll-booking]").on("click", function () {
    const service = $(this).attr("data-service");
    const selectedCar = $(this).attr("data-car");

    if (service) {
      $("#service").val(service);
    }

    if (selectedCar && carCapacity[selectedCar]) {
      $car.val(selectedCar);
      updatePassengerOptions("");
    }

    $("#booking")[0].scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  // Booking form submission.
  $bookingForm.on("submit", async function (event) {
    event.preventDefault();

    const carName = $car.val();
    const passengerCount = Number($passengers.val());
    const capacity = carCapacity[carName];

    if (!capacity || passengerCount < 1 || passengerCount > capacity) {
      $bookingStatus
        .text("Please select a car and a valid passenger count.")
        .css("color", "#b42318");
      return;
    }

    const phone = $("#phone").val().trim();

    if (!/^[0-9]{10}$/.test(phone)) {
      $bookingStatus
        .text("Please enter a valid 10-digit mobile number.")
        .css("color", "#b42318");
      return;
    }

    const booking = {
      type: "booking",
      name: $("#fullName").val().trim(),
      phone: phone,
      service: $("#service").val(),
      car: carName,
      travelDate: $("#travelDate").val(),
      passengers: passengerCount,
      pickup: $("#pickup").val().trim(),
      destination: $("#destination").val().trim(),
      message: $("#notes").val().trim()
    };

    const $submitButton = $bookingForm.find('button[type="submit"]');
    $submitButton.prop("disabled", true).text("Submitting...");
    $bookingStatus
      .text("Submitting your booking request...")
      .css("color", "#536579");

    try {
      // no-cors prevents reading the server response.
      // A resolved fetch does not confirm that the sheet was updated.
      await fetch(googleScriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(booking)
      });

      $bookingStatus
        .text(
          "Your request has been sent.  "
        )
        .css("color", "#18794e");

      $bookingForm[0].reset();
      updatePassengerOptions("");
      $("#travelDate").attr("min", getLocalDate());
    } catch (error) {
      console.error("Booking submission error:", error);
      $bookingStatus
        .text("Unable to send the request. Please try again.")
        .css("color", "#b42318");
    } finally {
      $submitButton.prop("disabled", false).html(
        'Request a Booking <span>→</span>'
      );
    }
  });

  

  // Feedback submission.
  $feedbackForm.on("submit", async function (event) {
    event.preventDefault();

    const driverRating = Number($("#driverRating").val());
    const safetyRating = Number($("#safetyRating").val());
    const cleanlinessRating = Number($("#cleanlinessRating").val());

    // Validate all 3 available ratings.
    if (!driverRating || !safetyRating || !cleanlinessRating) {
      $feedbackStatus
        .text("Please select all 3 ratings.")
        .css("color", "#b42318");
      return;
    }

    // Calculate overall rating from the 3 ratings.
    const overallRating = Math.round(
      (driverRating + safetyRating + cleanlinessRating) / 3
    );

    const feedback = {
      type: "feedback",
      name: $("#reviewName").val().trim(),
      travelDate: $("#reviewDate").val(),
      route: $("#reviewRoute").val().trim(),
      car: $("#reviewCar").val(),
      driverRating: driverRating,
      safetyRating: safetyRating,
      cleanlinessRating: cleanlinessRating,
      overallRating: overallRating,
      feedback: $("#reviewText").val().trim()
    };

    const $submitButton = $feedbackForm.find('button[type="submit"]');

    $submitButton.prop("disabled", true).text("Submitting...");
    $feedbackStatus
      .text("Submitting your feedback...")
      .css("color", "#536579");

    try {
      await fetch(googleScriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(feedback)
      });

      $feedbackStatus
        .text("Thank you! Your feedback has been sent.")
        .css("color", "#18794e");

      $feedbackForm[0].reset();
      $("#reviewDate").attr("max", getLocalDate());

    } catch (error) {
      console.error("Feedback submission error:", error);

      $feedbackStatus
        .text("Unable to send feedback. Please try again.")
        .css("color", "#b42318");

    } finally {
      $submitButton
        .prop("disabled", false)
        .text("Submit Feedback ↗");
    }
  });

  // Safely display approved reviews as text.
  function renderReviews(reviews) {
    $reviewsList.empty();

    if (!Array.isArray(reviews)) {
      $reviewsList.html(
        '<div class="col-12"><div class="review-placeholder">Reviews are temporarily unavailable. Please try again later.</div></div>'
      );
      return;
    }

    const validReviews = reviews.filter(function (review) {
      return review && review.name && review.feedback;
    });

    if (validReviews.length === 0) {
      $reviewsList.html(
        '<div class="col-12"><div class="review-placeholder">No approved reviews yet. Be the first to share your experience!</div></div>'
      );
      return;
    }

    validReviews.forEach(function (review) {
      const rating = Math.max(
        0,
        Math.min(5, Number(review.overallRating) || 0)
      );

      const $column = $("<div>").addClass("col-md-6 col-lg-4");
      const $card = $("<article>").addClass("review-card");
      const $body = $("<div>").addClass("review-card-body");
      const $stars = $("<div>")
        .addClass("review-stars")
        .attr("aria-label", rating + " out of 5 stars")
        .text("★".repeat(rating) + "☆".repeat(5 - rating));

      const $feedback = $("<p>").addClass("review-feedback").text(
        String(review.feedback)
      );

      const $route = $("<p>").addClass("review-route").text(
        String(review.route || "")
      );

      const $name = $("<h3>").addClass("review-name").text(
        String(review.name)
      );

      const details = [review.car, review.travelDate]
        .filter(Boolean)
        .join(" · ");

      const $details = $("<p>").addClass("review-details").text(details);

      $body.append($stars, $feedback, $route, $name, $details);
      $card.append($body);
      $column.append($card);
      $reviewsList.append($column);
    });
  }

  // Fetch approved reviews from Apps Script.
  async function loadReviews() {
    const $refreshButton = $("#refreshReviews");

    $refreshButton.prop("disabled", true);

    $reviewsList.html(
      '<div class="col-12"><div class="review-placeholder">Loading approved reviews...</div></div>'
    );

    try {
      const response = await fetch(
        googleScriptURL + "?action=approvedReviews",
        { method: "GET", cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("HTTP error: " + response.status);
      }

      const result = await response.json();

      if (!Array.isArray(result)) {
        throw new Error(result.error || "Unexpected reviews response.");
      }

      renderReviews(result);
    } catch (error) {
      console.error("Loading reviews failed:", error);

      $reviewsList.html(
        '<div class="col-12"><div class="review-placeholder">Could not load reviews right now. Check the Apps Script deployment and try Refresh Reviews.</div></div>'
      );
    } finally {
      $refreshButton.prop("disabled", false);
    }
  }

  $("#refreshReviews").on("click", loadReviews);

  loadReviews();
});
