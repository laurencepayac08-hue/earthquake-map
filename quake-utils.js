/* Helper functions for the earthquake map. They work in the browser and in Node. */
(function () {
  "use strict";

  // Yellow-to-red scale for magnitude.
  const COLORS = [[3, "#fed976"], [4, "#fd8d3c"], [5, "#e31a1c"], [6, "#b10026"], [Infinity, "#5b0a2a"]];

  function magnitudeColor(mag) {
    for (const [limit, color] of COLORS) if (mag < limit) return color;
  }

  function magnitudeRadius(mag) {
    return Math.max(3, Math.min(40, 2.2 * Math.pow(1.55, mag)));
  }

  function timeAgo(time, now = Date.now()) {
    const seconds = Math.max(0, Math.floor((now - time) / 1000));
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    return `${Math.floor(hours / 24)} d ago`;
  }

  // Turns the USGS GeoJSON feed into a plain list of quakes.
  function parseFeed(geojson) {
    if (!geojson || !Array.isArray(geojson.features)) throw new Error("Unexpected feed format");
    return geojson.features
      .filter((f) => f.properties && typeof f.properties.mag === "number"
        && f.geometry && Array.isArray(f.geometry.coordinates))
      .map((f) => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place || "Unknown location",
        time: f.properties.time,
        url: f.properties.url || "",
        lon: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        depth: f.geometry.coordinates[2],
        felt: f.properties.felt || 0,
        alert: f.properties.alert || "",
        tsunami: f.properties.tsunami === 1,
      }));
  }

  function filterQuakes(quakes, minMag) {
    return quakes.filter((q) => q.mag >= minMag);
  }

  function summarize(quakes) {
    if (quakes.length === 0) return { count: 0, strongest: null };
    return { count: quakes.length, strongest: quakes.reduce((a, b) => (b.mag > a.mag ? b : a)) };
  }

  // Bigger quakes sound lower, longer, and louder.
  function quakeTone(mag) {
    return {
      freq: Math.round(660 * Math.pow(2, -(mag - 2) * 0.72)),
      duration: Math.min(2.2, 0.25 + mag * 0.12),
      gain: Math.min(0.3, 0.04 + mag * 0.025),
    };
  }

  // Vibration pattern in milliseconds for phones that support it.
  function vibrationPattern(mag) {
    if (mag < 4.5) return [30];
    if (mag < 6) return [120, 60, 120];
    return [300, 100, 300, 100, 300];
  }

  function depthClass(depthKm) {
    if (depthKm < 70) return "shallow";
    if (depthKm <= 300) return "intermediate";
    return "deep";
  }

  // Only links to the USGS site are allowed in popups.
  function safeUrl(url) {
    return /^https:\/\/earthquake\.usgs\.gov\//.test(url) ? url : "";
  }

  const api = { magnitudeColor, magnitudeRadius, timeAgo, parseFeed, filterQuakes, summarize, safeUrl, quakeTone, vibrationPattern, depthClass };
  globalThis.QuakeUtils = api;
  if (typeof module !== "undefined") module.exports = api;
})();
