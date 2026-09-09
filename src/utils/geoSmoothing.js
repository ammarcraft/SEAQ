/**
 * NAUTICAL SPLINE & CATMULL-ROM CURVE INTERPOLATOR
 * Replaces sharp, jagged polygon waypoints with natural, sweeping oceanic nautical curves.
 * Respects coastal safety buffers and canal channel constraints.
 */

function catmullRom1D(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function smoothNauticalTrack(coords, isLandChecker = null) {
  if (!coords || !Array.isArray(coords) || coords.length < 3) return coords || [];
  
  const smoothed = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    smoothed.push(p1);

    const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    // Only interpolate broad oceanic legs (dist >= 1.2 deg)
    // Never distort tight canal locks or harbour approaches (dist < 1.2 deg)
    if (dist >= 1.2 && dist <= 20.0) {
      const numSamples = Math.min(4, Math.max(2, Math.floor(dist / 1.5)));
      const candidatePoints = [];
      let isClear = true;

      for (let s = 1; s < numSamples; s++) {
        const t = s / numSamples;
        const lon = Number(catmullRom1D(p0[0], p1[0], p2[0], p3[0], t).toFixed(4));
        const lat = Number(catmullRom1D(p0[1], p1[1], p2[1], p3[1], t).toFixed(4));

        if (isLandChecker && isLandChecker(lon, lat)) {
          isClear = false;
          break;
        }
        candidatePoints.push([lon, lat]);
      }

      if (isClear) {
        for (const pt of candidatePoints) {
          smoothed.push(pt);
        }
      }
    }
  }
  smoothed.push(coords[coords.length - 1]);
  return smoothed;
}
