# Tremor Map

A live map of earthquakes around the world. It runs in the browser and needs no server.

## Features

- Live data from the free USGS Earthquake Hazards Program feed, refreshed every 5 minutes
- A seismogram timeline with one spike per quake. Drag across it, or use the arrow keys, to travel through time
- A replay that plays the past hour, day, week, or month as ripples on the map
- Sound: each quake plays a tone, and bigger quakes sound lower, longer, and louder. Phones also vibrate when the device supports it
- Official USGS details in each popup: depth class, felt reports, impact alert, and the ocean event flag
- Minimum magnitude filter, region shortcuts, and a layout for phones
- A light, print-style design set in Times New Roman, with a yellow-to-red scale for magnitude. Recent quakes pulse in live mode
- Respects the reduced motion setting of the device

## Run it

Open `index.html` in a browser. The page needs an internet connection for the Leaflet library and the live earthquake feed. The world map is drawn from bundled outlines, so it needs no map tile server.

## Tests

The data logic lives in `quake-utils.js` and has automated tests. You need Node.js 20 or newer.

```
node --test
```

## Publish with GitHub Pages

Open the repository settings, choose Pages, select Deploy from a branch, pick the main branch and the root folder, and save.

## Data and credits

- Earthquake data: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/)
- Map library: [Leaflet](https://leafletjs.com/)
- Land outlines: [Natural Earth](https://www.naturalearthdata.com/) (public domain), bundled in `land.js`

## Project structure

```
index.html        page, styles, and map code
land.js           world land outlines
quake-utils.js    parsing, filtering, colors, and time helpers
test/             automated tests
```
