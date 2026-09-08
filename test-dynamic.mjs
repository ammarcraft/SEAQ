async function testDynamic() {
  // Test Mumbai to Rotterdam
  const res = await fetch("http://localhost:5174/api/searoutes/route/v2/sea/72.82,18.94;3.98,51.99?continuousCoordinates=true", {
    headers: { "x-api-key": "H8OkShCblA3eBl4QsKao22882uL168gG1L2s3xNa" }
  });
  console.log("Mumbai -> Rotterdam Status:", res.status);
  if (res.ok) {
    const d = await res.json();
    console.log("Distance NM:", Math.round((d.features[0].properties.distance / 1000) * 0.539957));
  }
}
testDynamic();
