import axios from 'axios';

const headers = { 'x-maker-key': 'mk_9ee1a64d3dbc40b08ef04e758e55b67d' };
const API_URL = 'https://learn.smktelkom-mlg.sch.id/coworking';

async function run() {
  try {
    // Register Member
    const email = 'member1234@coworking.com';
    const password = 'password123';
    await axios.post(`${API_URL}/api/auth/register/member`, {
      username: email,
      password: password,
      nama_member: 'Test Member',
      instansi: 'Test Instansi',
      alamat: 'Test Alamat',
      telp: '08123456789'
    }, { headers }).catch(e => console.log('Member reg err:', e.response?.data?.message));

    // Login Member
    const loginRes = await axios.post(`${API_URL}/api/auth/login`, { username: email, password }, { headers });
    const token = loginRes.data.data.access_token;
    const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

    // Get My Reservasi
    const myRes = await axios.get(`${API_URL}/api/reservasi/my`, { headers: authHeaders });
    console.log("=== GET /api/reservasi/my ===");
    console.log(JSON.stringify(myRes.data, null, 2));

    // We can't GET /api/reservasi/{id} until we have one. Let's just create one.
    // Wait, first we need a space ID. Let's get public spaces.
    const spacesRes = await axios.get(`${API_URL}/api/spaces`, { headers });
    const spaces = spacesRes.data.data.data || spacesRes.data.data;
    const firstSpaceId = Array.isArray(spaces) && spaces.length > 0 ? spaces[0].id : null;

    if (firstSpaceId) {
       console.log(`\n=== POST /api/reservasi (Space ID: ${firstSpaceId}) with discount ===`);
       const createRes = await axios.post(`${API_URL}/api/reservasi`, {
         id_space: firstSpaceId,
         tanggal_reservasi: '2026-10-11',
         jam_mulai: '10:00',
         durasi_jam: 2,
         kode_promo: 'LIBUR'
       }, { headers: authHeaders }).catch(e => {
         console.log("POST /api/reservasi Error:", e.response?.data);
         return null;
       });

       if (createRes) {
         console.log(JSON.stringify(createRes.data, null, 2));
         
         const createdId = createRes.data.data?.id; // Assuming it returns data with id
         if (createdId) {
            console.log(`\n=== GET /api/reservasi/${createdId} ===`);
            const detailRes = await axios.get(`${API_URL}/api/reservasi/${createdId}`, { headers: authHeaders });
            console.log(JSON.stringify(detailRes.data, null, 2));
         } else {
            console.log("Cannot determine created ID from POST response.");
         }
       }
    } else {
       console.log("No spaces available to book.");
    }

    // Now let's login as admin to test GET /api/admin/reservasi
    console.log("\n=== GET /api/admin/reservasi ===");
    const adminEmail = 'admin1234@coworking.com';
    const adminLoginRes = await axios.post(`${API_URL}/api/auth/login`, { username: adminEmail, password }, { headers });
    const adminToken = adminLoginRes.data.data.access_token;
    const adminHeaders = { ...headers, Authorization: `Bearer ${adminToken}` };
    const adminRes = await axios.get(`${API_URL}/api/admin/reservasi`, { headers: adminHeaders });
    console.log(JSON.stringify(adminRes.data, null, 2));

  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}
run();
