
const FEEDBACK_SPREADSHEET_ID = "1rgXs_-n3EzlRnR00-GDuejuvO_oJqve3NHW5hIY7oI0";
const OWNER_EMAIL = "Shivanshtoursandtravels5675@gmail.com";

const FEEDBACK_HEADERS = [
  "Feedback ID",
  "Feedback Date",
  "Customer Name",
  "Travel Date",
  "Route",
  "Car Type",
  "Driver Rating",
  "Safety Rating",
  "Punctuality Rating",
  "Cleanliness Rating",
  "Overall Rating",
  "Feedback",
  "Approved"
];

const BOOKING_HEADERS = [
  "Booking ID",
  "Booking Date",
  "Customer Name",
  "Phone Number",
  "Service",
  "Car Type",
  "Travel Date",
  "Passengers",
  "Pickup Location",
  "Destination",
  "Message"
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Request data is missing.");
    }

    const data = JSON.parse(e.postData.contents);
    const type = String(data.type || "").trim().toLowerCase();

    if (type === "feedback") {
      return saveFeedback(data);
    }

    if (type === "booking") {
      return saveBooking(data);
    }

    throw new Error("Invalid request type.");
  } catch (error) {
    return jsonResponse({
      success: false,
      error: String(error.message || error)
    });
  }
}

function saveFeedback(data) {
  const ss = SpreadsheetApp.openById(FEEDBACK_SPREADSHEET_ID);
  const sheet = ss.getSheets()[0];

  ensureHeaders(sheet, FEEDBACK_HEADERS);

  const feedbackId = "FDB-" + Date.now();

  const rowData = {
    "Feedback ID": feedbackId,
    "Feedback Date": new Date(),
    "Customer Name": data.name || "",
    "Travel Date": data.travelDate || "",
    "Route": data.route || "",
    "Car Type": data.car || "",
    "Driver Rating": data.driverRating || "",
    "Safety Rating": data.safetyRating || "",
    "Punctuality Rating": data.punctualityRating || "",
    "Cleanliness Rating": data.cleanlinessRating || "",
    "Overall Rating": data.overallRating || "",
    "Feedback": data.feedback || "",
    "Approved": "No"
  };

  appendByHeaders(sheet, rowData);

  return jsonResponse({
    success: true,
    type: "feedback",
    feedbackId: feedbackId,
    message: "Feedback submitted for approval."
  });
}

function saveBooking(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      "Booking spreadsheet not found. Check which spreadsheet this script is attached to."
    );
  }

  const sheet = ss.getSheets()[0];
  ensureHeaders(sheet, BOOKING_HEADERS);

  const bookingId = "STT-" + Date.now();
  const bookingDate = new Date();

  const rowData = {
    "Booking ID": bookingId,
    "Booking Date": bookingDate,
    "Customer Name": data.name || "",
    "Phone Number": String(data.phone || ""),
    "Service": data.service || "",
    "Car Type": data.car || "",
    "Travel Date": data.travelDate || "",
    "Passengers": data.passengers || "",
    "Pickup Location": data.pickup || "",
    "Destination": data.destination || "",
    "Message": data.message || ""
  };

  appendByHeaders(sheet, rowData);

  try {
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: "New Tour & Travels Booking - " + bookingId,
      body:
        "New booking received!\n\n" +
        "Booking ID: " + bookingId + "\n" +
        "Name: " + (data.name || "") + "\n" +
        "Phone: " + (data.phone || "") + "\n" +
        "Service: " + (data.service || "") + "\n" +
        "Car: " + (data.car || "") + "\n" +
        "Travel Date: " + (data.travelDate || "") + "\n" +
        "Passengers: " + (data.passengers || "") + "\n" +
        "Pickup: " + (data.pickup || "") + "\n" +
        "Destination: " + (data.destination || "") + "\n" +
        "Message: " + (data.message || "")
    });
  } catch (emailError) {
    console.error("Booking saved, but email failed: " + emailError.message);
  }

  return jsonResponse({
    success: true,
    type: "booking",
    bookingId: bookingId,
    message: "Booking saved."
  });
}

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "";

    if (action !== "approvedReviews") {
      return jsonResponse({
        success: true,
        message: "Shivansh Tour & Travels API is running."
      });
    }

    const ss = SpreadsheetApp.openById(FEEDBACK_SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const values = sheet.getDataRange().getValues();

    if (values.length < 2) {
      return jsonResponse([]);
    }

    const headers = values[0].map(function (value) {
      return String(value).trim();
    });

    const col = {};
    headers.forEach(function (header, index) {
      col[header] = index;
    });

    const required = [
      "Customer Name",
      "Travel Date",
      "Route",
      "Car Type",
      "Overall Rating",
      "Feedback",
      "Approved"
    ];

    required.forEach(function (header) {
      if (col[header] === undefined) {
        throw new Error("Missing column header: " + header);
      }
    });

    const reviews = values.slice(1)
      .filter(function (row) {
        return String(row[col["Approved"]]).trim().toLowerCase() === "yes";
      })
      .map(function (row) {
        return {
          name: String(row[col["Customer Name"]] || ""),
          travelDate: formatDate(row[col["Travel Date"]]),
          route: String(row[col["Route"]] || ""),
          car: String(row[col["Car Type"]] || ""),
          overallRating: Number(row[col["Overall Rating"]]) || 0,
          feedback: String(row[col["Feedback"]] || "")
        };
      })
      .filter(function (review) {
        return review.name && review.feedback;
      });

    return jsonResponse(reviews);
  } catch (error) {
    console.error(error);
    return jsonResponse({
      success: false,
      error: String(error.message || error)
    });
  }
}

function ensureHeaders(sheet, expectedHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, expectedHeaders.length)
      .setValues([expectedHeaders]);
    sheet.setFrozenRows(1);
    return;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map(function (value) {
      return String(value).trim();
    });

  const missing = expectedHeaders.filter(function (header) {
    return existingHeaders.indexOf(header) === -1;
  });

  if (missing.length > 0) {
    throw new Error(
      "Spreadsheet is missing these column headers: " + missing.join(", ")
    );
  }
}

function appendByHeaders(sheet, rowData) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0]
    .map(function (value) {
      return String(value).trim();
    });

  const row = headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(rowData, header)
      ? rowData[header]
      : "";
  });

  sheet.appendRow(row);
}


function formatDate(value) {
  if (!value) return "";

  // Handle actual Google Sheets Date values.
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(
      value,
      "Asia/Kolkata",
      "dd MMM yyyy"
    );
  }

  const text = String(value).trim();

  // Handle date strings such as:
  // Thu Oct 08 2026 00:00:00 GMT+0530 (India Standard Time)
  const longDateMatch = text.match(
    /^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})/
  );

  if (longDateMatch) {
    const day = longDateMatch[2].padStart(2, "0");
    const month = longDateMatch[1];
    const year = longDateMatch[3];

    return day + " " + month + " " + year;
  }

  // Handle dd/MM/yyyy.
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (match) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const month = Number(match[2]);

    if (month >= 1 && month <= 12) {
      return match[1].padStart(2, "0") +
        " " + months[month - 1] + " " + match[3];
    }
  }

  return text;
}



function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
