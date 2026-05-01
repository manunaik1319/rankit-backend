/**
 * GET /api/csab
 * CSAB cutoffs endpoint
 */
export async function csabHandler(req, res, { csabCutoffsData, collegesData }) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { college, branch, category, round } = req.query;

    let results = [...csabCutoffsData];

    // Apply filters
    if (college) {
      results = results.filter(c => 
        c.collegeId === college || 
        c.college_id === college ||
        c.college?.id === college
      );
    }

    if (branch) {
      results = results.filter(c => 
        c.branchCode === branch || 
        c.branch_code === branch ||
        c.branch?.code === branch
      );
    }

    if (category) {
      results = results.filter(c => 
        c.category === category || 
        c.seatType?.includes(category)
      );
    }

    if (round) {
      results = results.filter(c => c.round === round);
    }

    // Sort by closing rank
    results.sort((a, b) => {
      const rankA = parseInt(a.closingRank) || parseInt(a.closing_rank) || 0;
      const rankB = parseInt(b.closingRank) || parseInt(b.closing_rank) || 0;
      return rankA - rankB;
    });

    // Limit results
    const limit = parseInt(req.query.limit) || 100;
    results = results.slice(0, limit);

    return res.status(200).json({
      success: true,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('CSAB error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
