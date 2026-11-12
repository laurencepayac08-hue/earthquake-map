const test = require("node:test");
const assert = require("node:assert");
const U = require("../quake-utils.js");

const feed = {
  features: [
    { id: "a", properties: { mag: 4.6, place: "10 km N of Town", time: 1000, url: "https://earthquake.usgs.gov/a", felt: 12, alert: "green", tsunami: 1 }, geometry: { coordinates: [120.5, 14.2, 35] } },
    { id: "b", properties: { mag: null, place: "Unreviewed", time: 2000 }, geometry: { coordinates: [0, 0, 0] } },
    { id: "c", properties: { mag: 2.7, place: null, time: 3000 }, geometry: { coordinates: [-118, 34, 8] } },
  ],
};

test("parseFeed keeps valid quakes and drops quakes without a magnitude", () => {
  const quakes = U.parseFeed(feed);
  assert.strictEqual(quakes.length, 2);
  assert.deepStrictEqual([quakes[0].lat, quakes[0].lon, quakes[0].depth], [14.2, 120.5, 35]);
});

test("parseFeed gives a fallback name for a missing place", () => {
  assert.strictEqual(U.parseFeed(feed)[1].place, "Unknown location");
});

test("parseFeed rejects a feed in the wrong format", () => {
  assert.throws(() => U.parseFeed({}), /Unexpected feed format/);
  assert.throws(() => U.parseFeed(null), /Unexpected feed format/);
});

test("filterQuakes keeps quakes at or above the minimum", () => {
  const quakes = U.parseFeed(feed);
  assert.strictEqual(U.filterQuakes(quakes, 3).length, 1);
  assert.strictEqual(U.filterQuakes(quakes, 4.6).length, 1);
  assert.strictEqual(U.filterQuakes(quakes, 0).length, 2);
});

test("summarize finds the strongest quake", () => {
  const s = U.summarize(U.parseFeed(feed));
  assert.strictEqual(s.count, 2);
  assert.strictEqual(s.strongest.id, "a");
  assert.deepStrictEqual(U.summarize([]), { count: 0, strongest: null });
});

test("timeAgo describes minutes, hours, and days", () => {
  const now = 10 * 24 * 3600 * 1000;
  assert.strictEqual(U.timeAgo(now - 20 * 1000, now), "just now");
  assert.strictEqual(U.timeAgo(now - 5 * 60 * 1000, now), "5 min ago");
  assert.strictEqual(U.timeAgo(now - 3 * 3600 * 1000, now), "3 h ago");
  assert.strictEqual(U.timeAgo(now - 2 * 24 * 3600 * 1000, now), "2 d ago");
});

test("magnitudeColor changes at each whole magnitude step", () => {
  assert.strictEqual(U.magnitudeColor(2.5), "#fed976");
  assert.strictEqual(U.magnitudeColor(3), "#fd8d3c");
  assert.strictEqual(U.magnitudeColor(5.2), "#b10026");
  assert.strictEqual(U.magnitudeColor(7.8), "#5b0a2a");
});

test("magnitudeRadius grows with magnitude and stays inside its limits", () => {
  assert.ok(U.magnitudeRadius(5) > U.magnitudeRadius(3));
  assert.strictEqual(U.magnitudeRadius(-1), 3);
  assert.strictEqual(U.magnitudeRadius(9), 40);
});

test("safeUrl accepts USGS links only", () => {
  assert.strictEqual(U.safeUrl("https://earthquake.usgs.gov/earthquakes/eventpage/x"), "https://earthquake.usgs.gov/earthquakes/eventpage/x");
  assert.strictEqual(U.safeUrl("javascript:alert(1)"), "");
  assert.strictEqual(U.safeUrl("https://evil.example/"), "");
});

test("parseFeed reads felt reports, alert level, and the tsunami flag", () => {
  const [a, c] = U.parseFeed(feed);
  assert.deepStrictEqual([a.felt, a.alert, a.tsunami], [12, "green", true]);
  assert.deepStrictEqual([c.felt, c.alert, c.tsunami], [0, "", false]);
});

test("quakeTone gives bigger quakes a lower, longer, louder sound", () => {
  const small = U.quakeTone(3), big = U.quakeTone(6.5);
  assert.ok(big.freq < small.freq);
  assert.ok(big.duration > small.duration);
  assert.ok(big.gain > small.gain);
  assert.ok(U.quakeTone(9).gain <= 0.3 && U.quakeTone(9).duration <= 2.2);
});

test("vibrationPattern gets stronger with magnitude", () => {
  assert.deepStrictEqual(U.vibrationPattern(3), [30]);
  assert.strictEqual(U.vibrationPattern(5).length, 3);
  assert.strictEqual(U.vibrationPattern(7).length, 5);
});

test("depthClass sorts quakes into shallow, intermediate, and deep", () => {
  assert.strictEqual(U.depthClass(10), "shallow");
  assert.strictEqual(U.depthClass(70), "intermediate");
  assert.strictEqual(U.depthClass(500), "deep");
});
