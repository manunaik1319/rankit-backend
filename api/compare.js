/**
 * POST /api/compare
 * Compare colleges endpoint
 */
export async function compareHandler(req, res, { collegesData, cutoffsData }) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { collegeIds } = req.body;

    if (!collegeIds || !Array.isArray(collegeIds)) {
      return res.status(400).json({ error: 'collegeIds array is required' });
    }

    const results = collegeIds.map(id => {
      const college = collegesData.find(c => c.id === id);
      const collegeCutoffs = cutoffsData.filter(c => 
        c.collegeId === id || c.college_id === id
      );
      
      return {
        ...college,
        cutoffs: collegeCutoffs,
        stats: {
          totalBranches: collegeCutoffs.length,
          avgClosingRank: collegeCutoffs.length > 0
            ? Math.round(collegeCutoffs.reduce((sum, c) => 
                sum + (parseInt(c.closingRank) || parseInt(c.closing_rank) || 0), 0
              ) / collegeCutoffs.length)
            : null
        }
      };
    }).filter(c => c.id);

    return res.status(200).json({
      success: true,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('Compare error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
