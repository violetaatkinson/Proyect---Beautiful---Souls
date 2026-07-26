
const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;


function haversineDistanceKm([lng1, lat1], [lng2, lat2]) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

module.exports = { haversineDistanceKm };