/**
 * API Test Script
 * Run: node test-api.js
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting API Tests...\n');

    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    try {
        const health = await makeRequest('GET', '/api/health');
        console.log('✅ Health:', JSON.stringify(health.data, null, 2));
    } catch (e) {
        console.log('❌ Health check failed:', e.message);
        console.log('\n⚠️ Server not running. Start it with: node server.js');
        return;
    }

    // Use a consistent test email
    const testEmail = 'testuser@example.com';
    
    // Test 2: Signup
    console.log('\n2️⃣ Testing Signup...');
    try {
        const signup = await makeRequest('POST', '/api/auth/signup', {
            name: 'Test User',
            email: testEmail,
            password: '123456'
        });
        console.log('✅ Signup Response:', JSON.stringify(signup.data, null, 2));
    } catch (e) {
        console.log('❌ Signup failed:', e.message);
    }

    // Test 3: Login with same email
    console.log('\n3️⃣ Testing Login...');
    try {
        const login = await makeRequest('POST', '/api/auth/login', {
            email: testEmail,
            password: '123456'
        });
        console.log('✅ Login Response:', JSON.stringify(login.data, null, 2));
        
        if (login.data.data?.token) {
            console.log('\n🔑 JWT Token:', login.data.data.token.substring(0, 50) + '...');
        }
    } catch (e) {
        console.log('❌ Login failed:', e.message);
    }

    console.log('\n✅ API Tests Complete!');
}

runTests();
