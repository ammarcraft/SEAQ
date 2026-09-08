async function testRoutes() {
  const routes = [
    { name: "Shanghai -> Rotterdam", src: "122.06,30.62", dst: "3.98,51.99" },
    { name: "Singapore -> Rotterdam", src: "103.85,1.25", dst: "3.98,51.99" },
    { name: "Dubai -> Rotterdam", src: "55.02,25.05", dst: "3.98,51.99" }
  ];

  for (const r of routes) {
    const res = await fetch(`http://localhost:5174/api/searoutes/route/v2/sea/${r.src};${r.dst}?continuousCoordinates=true`, {
      headers: { "x-api-key": "H8OkShCblA3eBl4QsKao22882uL168gG1L2s3xNa" }
    });
    console.log(r.name, "Status:", res.status);
    if (res.ok) {
      const d = await res.json();
      console.log("   Distance (km):", (d.features[0].properties.distance / 1000).toFixed(0));
    }
  }
}
testRoutes();
