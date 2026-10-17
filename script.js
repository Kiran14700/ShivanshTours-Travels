$(document).ready(function () {
  // Existing deployed Google Apps Script Web App URL.
  const googleScriptURL = "https://script.google.com/macros/s/AKfycbzsFYTTjdu1k1S0DOYpsGNs1yQkH1Tla3g7ajj3F2MY1802iFAL5OSHx5T0sIkW0u31MQ/exec";

  $("#year").text(new Date().getFullYear());

  function localDateString() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().split("T")[0];
  }
  const today = localDateString();
  $("#travelDate, #reviewDate").attr("min", today);

  function showStatus(selector, message, type) {
    $(selector).removeClass("success error").addClass(type).text(message);
  }

  $(".choose-car").on("click", function () {
    $("#car").val($(this).data("car"));
    $("#service").val("Airport Drop & Pickup");
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
  });

  $("[data-service]").on("click", function (event) {
    const service = $(this).data("service");
    if (service) $("#service").val(service);
  });

  $("[data-scroll-booking]").on("click", function () {
    $("#service").val($(this).data("service") || "Airport Drop & Pickup");
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
  });

  $("[data-route]").on("click", function () {
    $("#service").val("Outstation Trip");
    $("#destination").val($(this).data("route"));
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
  });

  $("#bookingForm").on("submit", function (event) {
    event.preventDefault();
    const form = this;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const booking = {
      type: "booking",
      name: $("#fullName").val().trim(),
      phone: $("#phone").val().trim(),
      service: $("#service").val(),
      car: $("#car").val() || "Any suitable car",
      travelDate: $("#travelDate").val(),
      passengers: $("#passengers").val(),
      pickup: $("#pickup").val().trim(),
      destination: $("#destination").val().trim(),
      message: $("#notes").val().trim() || "None"
    };

    const submitButton = $(form).find('button[type="submit"]');
    submitButton.prop("disabled", true).text("Submitting...");
    showStatus("#bookingStatus", "", "");

    fetch(googleScriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(booking)
    }).then(function () {
      // With no-cors, the browser cannot read the server response.
      // This confirms the request was sent, not that the sheet write was verified.
      showStatus("#bookingStatus", "Your enquiry was sent. The team will contact you to confirm the details.", "success");
      form.reset();
      $("#travelDate").attr("min", localDateString());
    }).catch(function (error) {
      console.error("Booking submission error:", error);
      showStatus("#bookingStatus", "Could not send the enquiry. Please check your connection and try again.", "error");
    }).finally(function () {
      submitButton.prop("disabled", false).html('Submit booking enquiry <span aria-hidden="true">→</span>');
    });
  });

  $("#feedbackForm").on("submit", function (event) {
    event.preventDefault();
    const form = this;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const feedback = {
      type: "feedback",
      name: $("#reviewName").val().trim(),
      travelDate: $("#reviewDate").val(),
      route: $("#reviewRoute").val().trim(),
      car: $("#reviewCar").val(),
      driverRating: $("#driverRating").val(),
      safetyRating: $("#safetyRating").val(),
      punctualityRating: $("#punctualityRating").val(),
      cleanlinessRating: $("#cleanlinessRating").val(),
      overallRating: $("#overallRating").val(),
      feedback: $("#reviewText").val().trim()
    };

    const submitButton = $(form).find('button[type="submit"]');
    submitButton.prop("disabled", true).text("Submitting...");
    showStatus("#feedbackStatus", "", "");

    fetch(googleScriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(feedback)
    }).then(function () {
      showStatus("#feedbackStatus", "Thank you! Your feedback was sent for review. It will appear publicly only after approval.", "success");
      form.reset();
      $("#reviewDate").attr("min", localDateString());
    }).catch(function (error) {
      console.error("Feedback submission error:", error);
      showStatus("#feedbackStatus", "Could not send feedback. Please check your connection and try again.", "error");
    }).finally(function () {
      submitButton.prop("disabled", false).text("Submit feedback");
    });
  });

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function renderReviews(reviews) {
    const container = $("#reviewsList");
    if (!Array.isArray(reviews) || reviews.length === 0) {
      container.html('<div class="empty-reviews"><span>✦</span><h4>No approved reviews yet</h4><p>When the owner approves genuine customer feedback, it will appear here.</p></div>');
      return;
    }

    container.empty();
    reviews.forEach(function (review) {
      const rating = Math.max(1, Math.min(5, Number(review.overallRating) || 0));
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      const dateText = review.travelDate ? escapeHtml(review.travelDate) : "";
      const meta = [escapeHtml(review.route || ""), escapeHtml(review.car || ""), dateText].filter(Boolean).join(" · ");
      container.append(
        '<article class="review-item">' +
          '<div class="review-item-top"><div><h4>' + escapeHtml(review.name || "Customer") + '</h4><div class="review-meta">' + meta + '</div></div>' +
          '<span class="review-stars" aria-label="' + rating + ' out of 5 stars">' + stars + '</span></div>' +
          '<p>' + escapeHtml(review.feedback || "") + '</p>' +
        '</article>'
      );
    });
  }

  function loadReviews() {
    $("#refreshReviews").prop("disabled", true).text("Loading...");
    fetch(googleScriptURL + "?action=approvedReviews", { method: "GET" })
      .then(function (response) {
        if (!response.ok) throw new Error("Review request failed");
        return response.json();
      })
      .then(renderReviews)
      .catch(function (error) {
        console.warn("Could not load approved reviews:", error);
        $("#reviewsList").html('<div class="empty-reviews"><span>✦</span><h4>Reviews are temporarily unavailable</h4><p>Please try refreshing later. You can still submit your feedback using the form.</p></div>');
      })
      .finally(function () {
        $("#refreshReviews").prop("disabled", false).text("Refresh reviews");
      });
  }

  $("#refreshReviews").on("click", loadReviews);
  loadReviews();
});
