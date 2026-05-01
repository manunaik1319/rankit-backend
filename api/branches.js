/**
 * GET /api/branches
 * Get all branches
 */
export async function branchesHandler(req, res, { branchesData }) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return res.status(200).json({
      success: true,
      results: branchesData,
      count: branchesData.length
    });

  } catch (error) {
    console.error('Branches error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
