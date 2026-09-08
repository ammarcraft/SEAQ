async function test2() {
  console.log("--- TESTING REFINED REQUESTS ---");

  // 1. Climatiq with data_version
  try {
    const res = await fetch("https://api.climatiq.io/data/v1/estimate", {
      method: "POST",
      headers: { 
        "Authorization": "Bearer Z9QNM69DKN3F5ASR2P78SY4XDW",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        emission_factor: { 
          activity_id: "freight_vehicle-vehicle_type_cargo_ship-fuel_source_heavy_fuel_oil-engine_size_na-vehicle_age_na-vehicle_weight_na",
          data_version: "^37"
        },
        parameters: { weight: 20000, distance: 10000, weight_unit: "t", distance_unit: "km" }
      })
    });
    console.log("Climatiq (with data_version) Status:", res.status);
    const body = await res.text();
    console.log("Climatiq response:", body.slice(0, 300));
  } catch(e) { console.log("Climatiq Error:", e.message); }

  // 2. Searoutes with water coordinates (Yangshan deep water port to Rotterdam sea pilot)
  try {
    // Yangshan water: 122.06, 30.62; Rotterdam Maasvlakte water: 3.98, 51.99
    const res = await fetch("https://api.searoutes.com/route/v2/sea/122.06,30.62;3.98,51.99?continuousCoordinates=true", {
      headers: { "x-api-key": "H8OkShCblA3eBl4QsKao22882uL168gG1L2s3xNa" }
    });
    console.log("Searoutes (water coords) Status:", res.status);
    const body = await res.text();
    console.log("Searoutes response:", body.slice(0, 300));
  } catch(e) { console.log("Searoutes Error:", e.message); }
}

test2();
