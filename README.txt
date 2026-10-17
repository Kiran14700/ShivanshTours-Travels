# Shivansh Tour & Travels — website update

## Files
- `index.html` — website content, airport rates, route quote cards, booking and feedback forms.
- `style.css` — responsive styles.
- `script.js` — booking/feedback submission and approved-review loading.
- `Code.gs` — Google Apps Script backend for Sheets + email.

## Design update
The page now gives stronger visual priority to Mumbai Airport transfers and includes a dedicated Mumbai Darshan feature section with a sightseeing image and booking CTA.

## Rates included
Mumbai Airport transfer rates supplied by the owner:
- Sedan: ₹1,200
- Ertiga: ₹1,800
- Innova: ₹2,500
- Innova Crysta: ₹3,000

No rates are invented for Pune, Satara, Karad, Sangli, Kolhapur or Goa; these show “Get a quote”.

## IMPORTANT — deploy the Apps Script before publishing
1. Open the Google Sheet connected to the current Apps Script project.
2. Open **Extensions → Apps Script** (or open the existing `Shivansh Travel Booking` script).
3. Replace the contents of `Code.gs` with the provided `Code.gs` file.
4. Save.
5. In Apps Script, click **Deploy → Manage deployments**.
6. Edit the existing Web app deployment (pencil icon), select **New version**, and deploy. Keep the same Web App URL if editing the existing deployment.
7. If the URL changes, update `googleScriptURL` in `script.js`.
8. Ensure the web app executes as **Me** and access is set to **Anyone**, if that is the access setting you previously used. Google may ask for authorization.
9. Confirm that your Google Sheet has a `Bookings` tab. The script creates it if missing. It also creates a `Feedback` tab automatically.

## Approving customer reviews
New reviews are saved in the `Feedback` tab with Status `Pending`. Check the feedback and change that row's Status cell to exactly `Approved`. Approved reviews can then be loaded on the public website via the `approvedReviews` endpoint. Do not mark a review approved unless you have checked it.

## Update the website
1. Unzip this package.
2. Replace `index.html`, `style.css`, and `script.js` in your existing GitHub repository with these versions.
3. Keep all three files in the same folder.
4. Commit and push to the same GitHub Pages repository.
5. Test a booking and feedback submission. Check the `Bookings` and `Feedback` tabs and your owner email.

## Important technical note
The frontend uses `mode: "no-cors"` for POST because this is a static GitHub Pages site. The browser cannot read the response in this mode, so the on-page message means the request was sent, not that the server-side write was independently confirmed. Always verify the row appears in Google Sheets after the first test.

Images are illustrative stock photos, not a guarantee of the exact vehicle model available.
