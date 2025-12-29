const express = require('express');
const app = express();

const PORT = 5000;

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
