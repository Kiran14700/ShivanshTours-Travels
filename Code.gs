const OWNER_EMAIL = "kirandhumal890@gmail.com";
const BOOKING_SHEET = "Bookings";
const FEEDBACK_SHEET = "Feedback";

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (payload.type === "feedback") {
      saveFeedback_(ss, payload);
      sendFeedbackEmail_(payload);
      return jsonOutput_({ success: true, message: "Feedback received for review." });
    }

    saveBooking_(ss, payload);
    sendBookingEmail_(payload);
    return jsonOutput_({ success: true, message: "Booking enquiry received." });
  } catch (error) {
    console.error(error);
    return jsonOutput_({ success: false, message: String(error) });
  }
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  if (action !== "approvedReviews") {
    return jsonOutput_({ success: true, message: "Shivansh Tour & Travels endpoint is running." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(ss, FEEDBACK_SHEET, [
    "Timestamp", "Customer Name", "Travel Date", "Route", "Car",
    "Driver Behaviour Rating", "Safe Driving Rating", "Punctuality Rating",
    "Cleanliness Rating", "Overall Rating", "Feedback", "Status"
  ]);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return jsonOutput_([]);

  const headers = values[0].map(String);
  const index = {};
  headers.forEach(function (header, i) { index[header] = i; });

  const reviews = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[index.Status] || "").trim().toLowerCase() !== "approved") continue;
    reviews.push({
      name: row[index["Customer Name"]] || "Customer",
      travelDate: row[index["Travel Date"]] || "",
      route: row[index.Route] || "",
      car: row[index.Car] || "",
      overallRating: row[index["Overall Rating"]] || "",
      feedback: row[index.Feedback] || ""
    });
  }
  reviews.reverse();
  return jsonOutput_(reviews);
}

function saveBooking_(ss, p) {
  const headers = [
    "Timestamp", "Booking ID", "Customer Name", "Phone Number", "Service",
    "Car Type", "Travel Date", "Passengers", "Pickup Location", "Destination", "Message"
  ];
  const sheet = getOrCreateSheet_(ss, BOOKING_SHEET, headers);
  const bookingId = "STT-" + new Date().getTime();
  sheet.appendRow([
    new Date(), bookingId, safe_(p.name), safe_(p.phone), safe_(p.service),
    safe_(p.car), safe_(p.travelDate), safe_(p.passengers), safe_(p.pickup),
    safe_(p.destination), safe_(p.message)
  ]);
}

function saveFeedback_(ss, p) {
  const headers = [
    "Timestamp", "Customer Name", "Travel Date", "Route", "Car",
    "Driver Behaviour Rating", "Safe Driving Rating", "Punctuality Rating",
    "Cleanliness Rating", "Overall Rating", "Feedback", "Status"
  ];
  const sheet = getOrCreateSheet_(ss, FEEDBACK_SHEET, headers);
  sheet.appendRow([
    new Date(), safe_(p.name), safe_(p.travelDate), safe_(p.route), safe_(p.car),
    rating_(p.driverRating), rating_(p.safetyRating), rating_(p.punctualityRating),
    rating_(p.cleanlinessRating), rating_(p.overallRating), safe_(p.feedback), "Pending"
  ]);
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sendBookingEmail_(p) {
  const subject = "New booking enquiry - " + safe_(p.name);
  const body = [
    "A new booking enquiry was submitted on the website.",
    "",
    "Name: " + safe_(p.name),
    "Phone: " + safe_(p.phone),
    "Service: " + safe_(p.service),
    "Car: " + safe_(p.car),
    "Travel date: " + safe_(p.travelDate),
    "Passengers: " + safe_(p.passengers),
    "Pickup: " + safe_(p.pickup),
    "Destination: " + safe_(p.destination),
    "Additional details: " + safe_(p.message)
  ].join("\n");
  MailApp.sendEmail(OWNER_EMAIL, subject, body);
}

function sendFeedbackEmail_(p) {
  const subject = "New customer feedback awaiting approval - " + safe_(p.name);
  const body = [
    "A customer submitted feedback. It is saved with Status = Pending.",
    "Review it in the Feedback sheet and change Status to Approved to display it on the website.",
    "",
    "Name: " + safe_(p.name),
    "Travel date: " + safe_(p.travelDate),
    "Route: " + safe_(p.route),
    "Car: " + safe_(p.car),
    "Driver behaviour: " + rating_(p.driverRating) + "/5",
    "Safe driving: " + rating_(p.safetyRating) + "/5",
    "Punctuality: " + rating_(p.punctualityRating) + "/5",
    "Cleanliness: " + rating_(p.cleanlinessRating) + "/5",
    "Overall: " + rating_(p.overallRating) + "/5",
    "",
    "Feedback:",
    safe_(p.feedback)
  ].join("\n");
  MailApp.sendEmail(OWNER_EMAIL, subject, body);
}

function rating_(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 5 ? number : "";
}

function safe_(value) {
  // Prevent empty/undefined values and reduce the risk of spreadsheet formula injection.
  const text = String(value == null ? "" : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonOutput_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
