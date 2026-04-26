// Built-in fetch used in Node 18+

const BASE_URL = 'http://127.0.0.1:3001/api/auth';
const TEST_USER = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    companyName: 'Test Corp'
};

async function verify() {
    console.log('1. Testing Registration...');
    try {
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(TEST_USER)
        });

        console.log(`Response Status: ${regRes.status}`);
        const text = await regRes.text();
        console.log(`Response Body: ${text.substring(0, 200)}`);

        if (regRes.status === 201) {
            console.log('✅ Registration Successful');
        } else {
            console.error('❌ Registration Failed');
            process.exit(1);
        }

        console.log('2. Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });

        console.log(`Login Status: ${loginRes.status}`);
        if (loginRes.status === 200) {
            const data = await loginRes.json();
            if (data.accessToken) {
                console.log('✅ Login Successful. Token received.');
            } else {
                console.error('❌ Login Failed. No token.');
                process.exit(1);
            }
        } else {
            console.error('❌ Login Failed');
            process.exit(1);
        }

    } catch (error) {
        console.error('Fetch error:', error);
        process.exit(1);
    }
}

verify();
