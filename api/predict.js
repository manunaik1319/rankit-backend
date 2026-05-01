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
      // Exam type filter with college type restrictions
      let examMatch = false;
      const collegeType = (cutoff.college_type || '').toUpperCase();
      
      if (exam === 'JEE Advanced') {
        // JEE Advanced: Only IITs
        examMatch = cutoff.exam === 'JEE Advanced' && collegeType.includes('IIT');
      } else if (exam === 'JEE Main') {
        // JEE Main: NIT, IIIT, GFTI (no IITs)
        examMatch = cutoff.exam === 'JEE Main' && 
                   (collegeType.includes('NIT') || 
                    collegeType.includes('IIIT') || 
                    collegeType.includes('GFTI'));
      } else if (exam === 'CSAB') {
        // CSAB: NIT, IIIT, GFTI (no IITs)
        examMatch = cutoff.exam === 'CSAB' && 
                   (collegeType.includes('NIT') || 
                    collegeType.includes('IIIT') || 
                    collegeType.includes('GFTI'));
      } else {
        // Fallback for other exams
        examMatch = cutoff.exam === exam;
      }
      
      if (!examMatch) return false;
      
      // College type filter
      if (collegeTypes) {
        const collegeType = (cutoff.college_type || cutoff.type || '').toUpperCase();
        const typeMatch = 
          (collegeTypes.iit && collegeType.includes('IIT')) ||
          (collegeTypes.nit && collegeType.includes('NIT')) ||
          (collegeTypes.iiit && collegeType.includes('IIIT')) ||
          (collegeTypes.gfti && collegeType.includes('GFTI'));
        
        if (!typeMatch) return false;
      }
      
      // Category filter
      const categoryMatch = 
        cutoff.seat_type === category ||
        cutoff.seat_type?.includes(category) ||
        cutoff.seat_type === 'OPEN' ||
        cutoff.category === 'OPEN' ||
        cutoff.category === 'General' ||
        (category === 'OPEN' && !cutoff.seat_type) ||
        !cutoff.seat_type;
      
      if (!categoryMatch) return false;
      
      // Gender filter
      const genderMatch = 
        !cutoff.gender ||
        cutoff.gender.includes('Neutral') ||
        cutoff.gender.includes(gender);
      
      if (!genderMatch) return false;
      
      // Round filter
      if (round && cutoff.round && parseInt(cutoff.round) !== parseInt(round)) {
        return false;
      }
      
      // Rank range filter
      const closingRank = parseInt(cutoff.closing_rank) || 0;
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
      const closingRank = parseInt(cutoff.closing_rank) || 0;
      const rankDiff = closingRank - rank;
      
      // Match Type Logic:
      // rankDiff < 0: Closing rank is BETTER than user rank (harder to get) = DREAM
      // rankDiff 0-2000: Closing rank is slightly worse than user rank = TARGET
      // rankDiff > 2000: Closing rank is much worse than user rank = SAFE
      
      let chance, matchType;
      
      if (rankDiff < 0) {
        // Closing rank is better (lower number) than user rank
        // This is challenging - DREAM
        chance = 'Low';
        matchType = 'Dream';
      } else if (rankDiff <= 2000) {
        // Closing rank is 0-2000 worse than user rank
        // Good chance - TARGET
        chance = 'Medium';
        matchType = 'Target';
      } else {
        // Closing rank is more than 2000 worse than user rank
        // Very safe - SAFE
        chance = 'High';
        matchType = 'Safe';
      }
      
      return {
        college: {
          id: cutoff.college_id,
          name: cutoff.college_name,
          type: cutoff.college_type,
          city: cutoff.city || '',
          state: cutoff.state || ''
        },
        branch: {
          name: cutoff.branch,
          code: cutoff.branch_code
        },
        cutoff: {
          closingRank: closingRank,
          openingRank: parseInt(cutoff.opening_rank) || 0,
          round: cutoff.round,
          quota: cutoff.quota,
          seatType: cutoff.seat_type,
          gender: cutoff.gender
        },
        matchType,
        chance,
        chancePercentage: Math.abs(Math.round((rankDiff / rank) * 100)),
        rankDifference: rankDiff,
        formattedRanks: {
          closing: closingRank.toLocaleString(),
          opening: (parseInt(cutoff.opening_rank) || 0).toLocaleString()
        }
      };
    });
    
    // Sort by rank difference
    results.sort((a, b) => Math.abs(a.rankDifference) - Math.abs(b.rankDifference));
    
    // Group by college - one card per college with all branches
    const collegeMap = new Map();
    
    results.forEach(result => {
      const collegeId = result.college.id;
      
      if (!collegeMap.has(collegeId)) {
        collegeMap.set(collegeId, {
          id: collegeId,
          college: result.college,
          branches: [],
          bestMatchType: result.matchType,
          bestRecommendationScore: result.chancePercentage
        });
      }
      
      const collegeData = collegeMap.get(collegeId);
      collegeData.branches.push({
        branch: result.branch,
        cutoff: result.cutoff,
        matchType: result.matchType,
        chance: result.chance,
        chancePercentage: result.chancePercentage,
        rankDifference: result.rankDifference,
        formattedRanks: result.formattedRanks
      });
      
      // Update best match type (Safe > Target > Dream)
      const matchPriority = { 'Safe': 3, 'Target': 2, 'Dream': 1 };
      if (matchPriority[result.matchType] > matchPriority[collegeData.bestMatchType]) {
        collegeData.bestMatchType = result.matchType;
        collegeData.bestRecommendationScore = result.chancePercentage;
      }
    });
    
    // Convert map to array and sort by best match
    const groupedResults = Array.from(collegeMap.values());
    groupedResults.sort((a, b) => {
      const matchPriority = { 'Safe': 3, 'Target': 2, 'Dream': 1 };
      const priorityDiff = matchPriority[b.bestMatchType] - matchPriority[a.bestMatchType];
      if (priorityDiff !== 0) return priorityDiff;
      return b.bestRecommendationScore - a.bestRecommendationScore;
    });
    
    // Limit results
    const limitedResults = groupedResults.slice(0, 100);
    
    // Group by chance for stats
    const statsByChance = {
      safe: limitedResults.filter(r => r.bestMatchType === 'Safe'),
      moderate: limitedResults.filter(r => r.bestMatchType === 'Target'),
      reach: limitedResults.filter(r => r.bestMatchType === 'Dream')
    };
    
    return res.status(200).json({
      success: true,
      results: limitedResults,
      groupedResults: statsByChance,
      stats: {
        total: limitedResults.length,
        totalBranches: limitedResults.reduce((sum, c) => sum + c.branches.length, 0),
        safe: statsByChance.safe.length,
        moderate: statsByChance.moderate.length,
        reach: statsByChance.reach.length
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
