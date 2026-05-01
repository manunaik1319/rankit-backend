/**
 * POST /api/predict
 * Main prediction endpoint - matches user rank with college options
 */
export async function predictHandler(req, res, { cutoffsData, collegesData }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { exam, rank, category, gender, state, round, collegeTypes, rankType } = req.body;

    // Validate input
    if (!rank || rank < 1) {
      return res.status(400).json({ error: 'Valid rank is required' });
    }

    // Filter cutoffs based on criteria
    let results = cutoffsData.filter(cutoff => {
      // Exam type filter
      const examMatch = cutoff.exam === exam || 
                       (exam === 'JEE Main' && cutoff.exam !== 'JEE Advanced') ||
                       (exam === 'JEE Advanced');
      
      if (!examMatch) return false;
      
      // College type filter
      if (collegeTypes) {
        const collegeType = cutoff.instituteType?.toUpperCase() || cutoff.type?.toUpperCase() || '';
        const typeMatch = 
          (collegeTypes.iit && collegeType.includes('IIT')) ||
          (collegeTypes.nit && collegeType.includes('NIT')) ||
          (collegeTypes.iiit && collegeType.includes('IIIT')) ||
          (collegeTypes.gfti && collegeType.includes('GFTI'));
        
        if (!typeMatch) return false;
      }
      
      // Category filter
      const categoryMatch = 
        cutoff.category === category ||
        cutoff.seatType?.includes(category) ||
        cutoff.category === 'OPEN' ||
        cutoff.category === 'General' ||
        (category === 'OPEN' && !cutoff.category) ||
        !cutoff.category;
      
      if (!categoryMatch) return false;
      
      // Gender filter
      const genderMatch = 
        !cutoff.gender ||
        cutoff.gender.includes('Neutral') ||
        cutoff.gender.includes(gender);
      
      if (!genderMatch) return false;
      
      // Round filter
      if (round && cutoff.round && cutoff.round !== round) {
        return false;
      }
      
      // Rank range filter
      const closingRank = parseInt(cutoff.closingRank) || parseInt(cutoff.closing_rank) || 0;
      if (closingRank === 0) return false;
      
      let maxRank;
      if (rank < 1000) {
        maxRank = 50000;
      } else if (rank < 10000) {
        maxRank = rank * 5;
      } else if (rank < 50000) {
        maxRank = rank + 100000;
      } else {
        maxRank = rank + 150000;
      }
      
      if (closingRank > maxRank) {
        return false;
      }
      
      return true;
    });
    
    // Calculate chances and add metadata
    results = results.map(cutoff => {
      const closingRank = parseInt(cutoff.closingRank) || parseInt(cutoff.closing_rank) || 0;
      const rankDiff = closingRank - rank;
      const percentage = (rankDiff / closingRank) * 100;
      
      let chance = 'Very Low';
      let matchType = 'Reach';
      if (percentage > 20) { chance = 'High'; matchType = 'Safe'; }
      else if (percentage > 10) { chance = 'Medium'; matchType = 'Target'; }
      else if (percentage > 0) { chance = 'Low'; matchType = 'Dream'; }
      
      return {
        ...cutoff,
        closingRank,
        rankDifference: rankDiff,
        chance,
        matchType,
        chancePercentage: Math.round(percentage)
      };
    });
    
    // Sort by rank difference
    results.sort((a, b) => Math.abs(a.rankDifference) - Math.abs(b.rankDifference));
    
    // Limit results
    results = results.slice(0, 200);
    
    // Group by chance
    const groupedResults = {
      safe: results.filter(r => r.chance === 'High'),
      moderate: results.filter(r => r.chance === 'Medium'),
      reach: results.filter(r => r.chance === 'Low' || r.chance === 'Very Low')
    };
    
    return res.status(200).json({
      success: true,
      results,
      groupedResults,
      stats: {
        total: results.length,
        safe: groupedResults.safe.length,
        moderate: groupedResults.moderate.length,
        reach: groupedResults.reach.length
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
