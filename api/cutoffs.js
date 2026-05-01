/**
 * GET /api/cutoffs
 * Search cutoffs endpoint
 */
export async function cutoffsHandler(req, res, { cutoffsData }) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { exam, category, college, branch, limit } = req.query;

    let results = [...cutoffsData];

    // Apply filters
    if (exam) {
      results = results.filter(c => c.exam === exam);
    }

    if (category) {
      results = results.filter(c => 
        c.category === category || 
        c.seatType?.includes(category)
      );
    }

    if (college) {
      results = results.filter(c => 
        c.collegeId === college ||
        c.college_id === college
      );
    }

    if (branch) {
      results = results.filter(c => 
        c.branchCode === branch ||
        c.branch_code === branch
      );
    }

    // Sort by closing rank
    results.sort((a, b) => {
      const rankA = parseInt(a.closingRank) || parseInt(a.closing_rank) || 0;
      const rankB = parseInt(b.closingRank) || parseInt(b.closing_rank) || 0;
      return rankA - rankB;
    });

    // Limit results
    const maxResults = parseInt(limit) || 100;
    results = results.slice(0, maxResults);

    return res.status(200).json({
      success: true,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('Cutoffs error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
