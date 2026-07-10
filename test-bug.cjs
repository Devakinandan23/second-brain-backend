const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api/v1';

async function run() {
  try {
    // 1. Create User1
    const u1 = 'user1_' + Date.now();
    await axios.post(`${BASE_URL}/auth/signup`, { username: u1, password: 'password123' });
    const login1 = await axios.post(`${BASE_URL}/auth/signin`, { username: u1, password: 'password123' });
    const token1 = login1.data.token;
    
    // 2. Import a note to User1
    const importPayload = {
      version: "1.0",
      entries: [
        {
          sourceType: "YOUTUBE",
          link: "https://youtube.com/watch?v=123",
          title: "Test Video",
          content: null,
          description: null,
          thumbnail: null,
          authorName: null,
          tags: ["test"],
          isPublic: false,
          isFavorite: false
        }
      ]
    };
    
    await axios.post(`${BASE_URL}/content/import`, importPayload, { headers: { Authorization: `Bearer ${token1}` } });
    
    // Check User1 notes
    let notes1 = await axios.get(`${BASE_URL}/content`, { headers: { Authorization: `Bearer ${token1}` } });
    console.log(`User1 notes before: ${notes1.data.content.length}`);
    
    // 3. Create User2
    const u2 = 'user2_' + Date.now();
    await axios.post(`${BASE_URL}/auth/signup`, { username: u2, password: 'password123' });
    const login2 = await axios.post(`${BASE_URL}/auth/signin`, { username: u2, password: 'password123' });
    const token2 = login2.data.token;
    
    // Check User2 notes (should be 0)
    let notes2 = await axios.get(`${BASE_URL}/content`, { headers: { Authorization: `Bearer ${token2}` } });
    console.log(`User2 notes: ${notes2.data.content.length}`);
    
    // 4. Log back into User1 and check notes
    const login1_again = await axios.post(`${BASE_URL}/auth/signin`, { username: u1, password: 'password123' });
    const token1_again = login1_again.data.token;
    
    let notes1_after = await axios.get(`${BASE_URL}/content`, { headers: { Authorization: `Bearer ${token1_again}` } });
    console.log(`User1 notes after: ${notes1_after.data.content.length}`);
    
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
