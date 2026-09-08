async function testEstimate() {
  const res = await fetch("https://api.climatiq.io/data/v1/estimate", {
    method: "POST",
    headers: { 
      "Authorization": "Bearer Z9QNM69DKN3F5ASR2P78SY4XDW",
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      emission_factor: { 
        activity_id: "sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na",
        data_version: "^37"
      },
      parameters: { weight: 24000, distance: 19434, weight_unit: "t", distance_unit: "km" }
    })
  });
  console.log("Estimate Status:", res.status);
  const data = await res.json();
  console.log("Estimate Response:", data);
}
testEstimate();
