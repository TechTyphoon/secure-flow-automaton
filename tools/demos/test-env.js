// Quick test to verify environment variables are working
console.log('=== Environment Variables Test ===');
console.log('VITE_SONAR_TOKEN:', import.meta.env.VITE_SONAR_TOKEN ? 'SET' : 'NOT SET');
console.log('VITE_SNYK_TOKEN:', import.meta.env.VITE_SNYK_TOKEN ? 'SET' : 'NOT SET');
console.log('VITE_SLACK_WEBHOOK_URL:', import.meta.env.VITE_SLACK_WEBHOOK_URL ? 'SET' : 'NOT SET');
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('=== Test Complete ===');
