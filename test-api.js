import axios from 'axios';
const headers = { 'x-maker-key': 'mk_9ee1a64d3dbc40b08ef04e758e55b67d' };

async function test() {
  try {
    const res = await axios.post('https://learn.smktelkom-mlg.sch.id/coworking/api/diskon/check', { nama_diskon: 'LIBUR' }, { headers });
    console.log("Check Promo:", res.data);
  } catch (err) {
    console.log("Check Promo Error:", err.response ? err.response.data : err.message);
  }
}
test();
