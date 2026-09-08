async function testEIA() {
  const res = await fetch("https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=mRSt6QOSvcbzObB7XIFSzeUbCbKMHGpqA3p2eV03&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=5");
  const data = await res.json();
  console.log("EIA rows:", data.response?.data);
}
testEIA();
