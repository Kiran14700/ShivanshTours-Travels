
$(document).ready(function () {

  // Google Apps Script URL
  const googleScriptURL =
    "https://script.google.com/macros/s/AKfycbzsFYTTjdu1k1S0DOYpsGNs1yQkH1Tla3g7ajj3F2MY1802iFAL5OSHx5T0sIkW0u31MQ/exec";

  // Footer current year
  $("#year").text(new Date().getFullYear());

  // Disable past travel dates
  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];

  $("#travelDate").attr("min", localToday);

  // Car selection
  $(".choose-car").on("click", function () {
    $("#car").val($(this).data("car"));

    document.getElementById("booking").scrollIntoView({
      behavior: "smooth"
    });
  });

  // Service selection
  $("[data-service]").on("click", function () {
    $("#service").val($(this).data("service"));
  });

  // Submit booking
  $("#bookingForm").on("submit", function (event) {
    event.preventDefault();

    const form = this;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const booking = {
      name: $("#fullName").val().trim(),
      phone: $("#phone").val().trim(),
      service: $("#service").val(),
      car: $("#car").val() || "Any suitable car",
      travelDate: $("#travelDate").val(),
      passengers: $("#passengers").val(),
      pickup: $("#pickup").val().trim(),
      destination: $("#destination").val().trim() || "Not specified",
      message: $("#notes").val().trim() || "None"
    };

    const submitButton = $(form).find(
      'button[type="submit"], input[type="submit"]'
    );

    submitButton.prop("disabled", true);

    fetch(googleScriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(booking)
    })
    .then(function () {
      alert(
        "Thank you! Your booking enquiry has been submitted. " +
        "We will contact you soon."
      );

      form.reset();
      $("#travelDate").attr("min", localToday);
    })
    .catch(function (error) {
      console.error("Booking error:", error);

      alert(
        "Submission could not be confirmed. Please try again later."
      );
    })
    .finally(function () {
      submitButton.prop("disabled", false);
    });

  });

});
