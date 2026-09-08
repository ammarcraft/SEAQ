async function testProxy() {
  console.log("--- TESTING VITE PROXY ---");
  try {
    const res = await fetch("http://localhost:5174/api/eia/v2/petroleum/pri/spt/data/?api_key=mRSt6QOSvcbzObB7XIFSzeUbCbKMHGpqA3p2eV03&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1");
    console.log("Vite Proxy EIA Status:", res.status);
    const d = await res.json();
    console.log("Vite Proxy EIA price:", d.response?.data?.[0]?.value);
  } catch(e) {
    console.log("Vite Proxy EIA error:", e.message);
  }

  try {
    const res = await fetch("http://localhost:5174/api/searoutes/route/v2/sea/122.06,30.62;3.98,51.99?continuousCoordinates=true", {
      headers: { "x-api-key": "H8OkShCblA3eBl4QsKao22882uL168gG1L2s3xNa" }
    });
    console.log("Vite Proxy Searoutes Status:", res.status);
    const d = await res.json();
    console.log("Vite Proxy Searoutes distance:", d?.features?.[0]?.properties?.distance);
  } catch(e) {
    console.log("Vite Proxy Searoutes error:", e.message);
  }
}
testProxy();
