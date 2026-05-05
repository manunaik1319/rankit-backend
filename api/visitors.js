import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory storage (will reset on server restart)
// For production, use a database like MongoDB or PostgreSQL
let visitorData = {
  totalCount: 50000, // Starting count
  visitors: [],
  locations: []
};

// Load visitor data from file if exists
async function loadVisitorData() {
  try {
    const dataPath = join(__dirname, '..', 'data', 'visitors.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    visitorData = JSON.parse(data);
    console.log('✅ Visitor data loaded:', visitorData.totalCount, 'total visitors');
  } catch (error) {
    console.log('ℹ️  No existing visitor data, starting fresh');
  }
}

// Save visitor data to file
async function saveVisitorData() {
  try {
    const dataPath = join(__dirname, '..', 'data', 'visitors.json');
    await fs.writeFile(dataPath, JSON.stringify(visitorData, null, 2));
  } catch (error) {
    console.error('Error saving visitor data:', error);
  }
}

// Initialize on module load
loadVisitorData();

// Get visitor count
export async function getVisitorCount(req, res) {
  try {
    res.json({
      success: true,
      data: {
        totalCount: visitorData.totalCount,
        recentVisitors: visitorData.visitors.slice(0, 20)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Track new visitor
export async function trackVisitor(req, res) {
  try {
    const { sessionId, location } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Check if this session already visited
    const existingVisitor = visitorData.visitors.find(v => v.sessionId === sessionId);

    if (existingVisitor) {
      // Returning visitor - update last visit
      existingVisitor.lastVisit = new Date().toISOString();
      existingVisitor.visitCount = (existingVisitor.visitCount || 1) + 1;

      await saveVisitorData();

      return res.json({
        success: true,
        data: {
          visitorNumber: existingVisitor.visitorNumber,
          totalCount: visitorData.totalCount,
          isNew: false
        }
      });
    }

    // New visitor
    visitorData.totalCount += 1;
    const newVisitor = {
      sessionId,
      visitorNumber: visitorData.totalCount,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitCount: 1,
      location: location || null
    };

    visitorData.visitors.unshift(newVisitor);

    // Keep only last 100 visitors in memory
    if (visitorData.visitors.length > 100) {
      visitorData.visitors = visitorData.visitors.slice(0, 100);
    }

    // Track location if provided
    if (location && location.city) {
      const existingLocation = visitorData.locations.find(
        l => l.city === location.city && l.country === location.country
      );

      if (existingLocation) {
        existingLocation.count += 1;
        existingLocation.lastVisit = new Date().toISOString();
      } else {
        visitorData.locations.push({
          city: location.city,
          region: location.region,
          country: location.country,
          count: 1,
          firstVisit: new Date().toISOString(),
          lastVisit: new Date().toISOString()
        });
      }
    }

    await saveVisitorData();

    res.json({
      success: true,
      data: {
        visitorNumber: newVisitor.visitorNumber,
        totalCount: visitorData.totalCount,
        isNew: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get visitor locations
export async function getVisitorLocations(req, res) {
  try {
    res.json({
      success: true,
      data: {
        locations: visitorData.locations.sort((a, b) => b.count - a.count)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Get visitor analytics
export async function getVisitorAnalytics(req, res) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const todayVisitors = visitorData.visitors.filter(
      v => new Date(v.firstVisit) > oneDayAgo
    ).length;

    const weeklyVisitors = visitorData.visitors.filter(
      v => new Date(v.firstVisit) > oneWeekAgo
    ).length;

    const monthlyVisitors = visitorData.visitors.filter(
      v => new Date(v.firstVisit) > oneMonthAgo
    ).length;

    res.json({
      success: true,
      data: {
        totalVisitors: visitorData.totalCount,
        todayVisitors,
        weeklyVisitors,
        monthlyVisitors,
        totalLocations: visitorData.locations.length,
        recentVisitors: visitorData.visitors.slice(0, 20)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
