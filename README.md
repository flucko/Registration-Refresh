# Registration Refresh

A Chrome extension that reliably refreshes the currently active tab at a precisely specified time (down to the second).

## Use Cases

This extension is built for any situation where a registration window opens at a specific, known time and speed is everything:

- 🏕️ **Summer camp registration** — Popular camps sell out within seconds of opening. Schedule your refresh to fire the moment spots open.
- 🏊 **Swimming & sports leagues** — Municipal pools and rec leagues often release session registrations at a fixed time (e.g. 9:00 AM sharp).
- 🎓 **School & university course enrollment** — Get ahead of the queue when course registration opens for a new semester.
- 🎟️ **Concert & event tickets** — Pre-stage the ticketing page and let the extension reload it the instant sales go live.
- 👟 **Sneaker & limited product drops** — Refresh a product page exactly when a drop goes live to beat bots and crowds.
- 🏥 **Medical appointment booking** — Grab coveted appointment slots the moment a new availability window opens.
- 🏌️ **Golf & court tee times** — Many golf courses and tennis clubs release tee times exactly 7 days in advance at a set time.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** using the toggle in the top right corner.
4. Click **Load unpacked** and select the extension directory.
5. Pin the extension to your browser toolbar.

## Usage

1. Open the page you want to automatically refresh.
2. Click the **Registration Refresh** icon in your toolbar.
3. Enter the exact Hour, Minute, and Second you want the page to reload.
4. Click **Start**. The popup will show the countdown and a pulsating active indicator. The time inputs will be disabled while a schedule is active.
5. To abort before the refresh fires, click **Cancel**.
6. A **Test (+20s)** button is available to quickly verify the extension is working — it schedules a refresh 20 seconds from now.
