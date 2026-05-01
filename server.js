import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load data files
let cutoffsData = null;
let collegesData = null;
let branchesData = null;
let csabCutoffsData = null;

async function loadData() {
  try {
    const dataPath = join(__dirname, 'data');
    
    const [cutoffs, colleges, branches, csabCutoffs] = await Promise.all([
      fs.readFile(join(dataPath, 'cutoffs.json'), 'utf-8'),
      fs.readFile(join(dataPath, 'colleges.json'), 'utf-8'),
      fs.readFile(join(dataPath, 'branches.json'), 'utf-8'),
      fs.readFile(join(dataPath, 'csab-cutoffs.json'), 'utf-8')
    ]);

    cutoffsData = JSON.parse(cutoffs);
    collegesData = JSON.parse(colleges);
    branchesData = JSON.parse(branches);
    csabCutoffsData = JSON.parse(csabCutoffs);

    console.log('✅ Data loaded successfully');
    console.log(`   - Cutoffs: ${cutoffsData.length} records`);
    console.log(`   - Colleges: ${collegesData.length} records`);
    console.log(`   - Branches: ${branchesData.length} records`);
    console.log(`   - CSAB Cutoffs: ${csabCutoffsData.length} records`);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    process.exit(1);
  }
}

// Import API handlers
import { predictHandler } from './api/predict.js';
import { csabHandler } from './api/csab.js';
import { cutoffsHandler } from './api/cutoffs.js';
import { branchesHandler } from './api/branches.js';
import { compareHandler } from './api/compare.js';

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RankIt Backend API',
    version: '1.0.0',
    endpoints: {
      predict: '/api/predict',
      csab: '/api/csab',
      cutoffs: '/api/cutoffs',
      branches: '/api/branches',
      compare: '/api/compare'
    }
  });
});

// API Routes
app.post('/api/predict', (req, res) => predictHandler(req, res, { cutoffsData, collegesData }));
app.get('/api/csab', (req, res) => csabHandler(req, res, { csabCutoffsData, collegesData }));
app.get('/api/cutoffs', (req, res) => cutoffsHandler(req, res, { cutoffsData }));
app.get('/api/branches', (req, res) => branchesHandler(req, res, { branchesData }));
app.post('/api/compare', (req, res) => compareHandler(req, res, { collegesData, cutoffsData }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function startServer() {
  await loadData();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
  });
}

startServer();
