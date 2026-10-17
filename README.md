# Shivansh Tour and Travels

A static website built with HTML, CSS, JavaScript, jQuery, and Bootstrap. It can be hosted on GitHub Pages.

## Files
- `index.html` — page content and booking form
- `style.css` — responsive styling
- `script.js` — validation, rate selection, and WhatsApp message generation

## Before publishing
1. Check the prices in `index.html` and `script.js`.
2. The airport Innova Crysta rate is currently shown as “Ask for rate” because no amount was supplied.
3. Mumbai Darshan Crysta is set to ₹6,000 as a likely correction of “60000”; confirm this before publishing.
4. WhatsApp destination is configured as `918779084860` in `script.js`.

## Run locally
Open `index.html` in a browser, or use VS Code Live Server. Internet is required for Bootstrap, jQuery, and Google Fonts CDN links.

## Publish on GitHub Pages
1. Create a GitHub repository (for example, `shivansh-tour-travels`).
2. Upload `index.html`, `style.css`, and `script.js` to the repository root.
3. Open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Wait for GitHub Pages to publish and open the URL it provides.

## WhatsApp behavior
The form prepares a message using `https://wa.me/` and opens WhatsApp. The customer must review and press **Send**. This static website does not store enquiries in a database and does not automatically send messages without customer action.

## Privacy
Do not collect payment card details, passwords, Aadhaar numbers, or other sensitive data through this form. Form submissions are not stored by this website.
