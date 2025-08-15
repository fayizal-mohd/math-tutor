const axios = require('axios');

const API_URL = 'http://localhost:3000/api/question';

async function runTest() {
    console.log('Running API test...');
    try {
        const response = await axios.post(API_URL, { year: 5 });
        const data = response.data;

        if (response.status === 200 && data.success) {
            if (data.question && typeof data.answer === 'number' && data.topic) {
                console.log('Test PASSED!');
                console.log('Question:', data.question);
                console.log('Answer:', data.answer);
                console.log('Topic:', data.topic);
                process.exit(0);
            } else {
                console.error('Test FAILED: API response has incorrect structure.');
                console.error('Response:', data);
                process.exit(1);
            }
        } else {
            console.error(`Test FAILED: API returned status ${response.status} and success=${data.success}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`Test FAILED: API request failed. ${error.message}`);
        process.exit(1);
    }
}

runTest();
