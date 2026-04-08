const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=---boundary',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (e) => console.error(e));

req.write('-----boundary\r\nContent-Disposition: form-data; name="entry.682122354"\r\n\r\nTEAM TEST\r\n-----boundary--\r\n');
req.end();
