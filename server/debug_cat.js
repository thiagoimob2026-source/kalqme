// Native fetch in Node 20+

(async () => {
    try {
        const BASE_URL = 'http://localhost:3001/api';

        // 1. Register/Login a test user
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Creating user: ${email}`);
        let response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email,
                password,
                companyName: 'Test Corp',
                taxType: 'AUTONOMO'
            })
        });

        if (!response.ok) {
            console.error('Register failed:', await response.text());
        }

        console.log('Logging in...');
        response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await response.json(); // Might throw if not JSON
        if (!response.ok) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.accessToken;
        console.log('Got token:', token ? 'YES' : 'NO');
        // console.log('Token:', token);

        // 2. Try creating a category
        console.log('Creating category...');
        response = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Nova Categoria Teste',
                type: 'Despesa',
                isDeductible: true
            })
        });

        console.log('Create Category Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error("SCRIPT ERROR:", e);
    }

})();
