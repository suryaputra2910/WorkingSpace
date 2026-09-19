import axios from 'axios';
const headers = { 'x-maker-key': 'mk_9ee1a64d3dbc40b08ef04e758e55b67d' };

async function test() {
  try {
    // 1. Register an admin
    const email = 'admin1234@coworking.com';
    const password = 'password123';
    await axios.post('https://learn.smktelkom-mlg.sch.id/coworking/api/auth/register/admin-space', { 
        username: email, 
        password, 
        nama_coworking: 'Coworking Test',
        nama_pemilik: 'Admin Test',
        telp: '08123456789'
    }, { headers }).catch(e => console.log('Register error:', e.response?.data));

    // 2. Login
    const loginRes = await axios.post('https://learn.smktelkom-mlg.sch.id/coworking/api/auth/login', { username: email, password }, { headers });
    console.log("Login Res:", JSON.stringify(loginRes.data, null, 2));
    const token = loginRes.data.data.access_token;
    console.log("Token:", token);
    
    // 3. Fetch Reports
    const monthlyRes = await axios.get('https://learn.smktelkom-mlg.sch.id/coworking/api/admin/reports/monthly', { 
        headers: { ...headers, Authorization: `Bearer ${token}` } 
    });
    console.log("Monthly Report:", JSON.stringify(monthlyRes.data, null, 2));

    const incomeRes = await axios.get('https://learn.smktelkom-mlg.sch.id/coworking/api/admin/reports/income', { 
        headers: { ...headers, Authorization: `Bearer ${token}` } 
    });
    console.log("Income Report:", JSON.stringify(incomeRes.data, null, 2));

  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}
test();
