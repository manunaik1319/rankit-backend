import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers
import { 
  getVisitorCount, 
  trackVisitor, 
  getVisitorLocations, 
  getVisitorAnalytics 
} from './api/visitors.js';
import { 
  sendTelegramMessage, 
  sendContactFormToTelegram,
  getCounsellingRequests
} from './api/telegram.js';

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RankIt Backend API',
    version: '1.0.0',
    endpoints: {
      visitors: '/api/visitors',
      visitorTrack: '/api/visitors/track',
      visitorLocations: '/api/visitors/locations',
      visitorAnalytics: '/api/visitors/analytics',
      telegramMessage: '/api/telegram/message',
      telegramContact: '/api/telegram/contact',
      counselling: '/api/telegram/counselling'
    }
  });
});

// Visitor tracking routes
app.get('/api/visitors', getVisitorCount);
app.post('/api/visitors/track', trackVisitor);
app.get('/api/visitors/locations', getVisitorLocations);
app.get('/api/visitors/analytics', getVisitorAnalytics);

// Telegram routes
app.post('/api/telegram/message', sendTelegramMessage);
app.post('/api/telegram/contact', sendContactFormToTelegram);
app.get('/api/telegram/counselling', getCounsellingRequests);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/`);
});
