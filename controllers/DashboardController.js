// DashBoardCntroller.js
const dashboardService = require('../services/dashboardService');

exports.getDashboard = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;

  try {
    const dashboardData = await dashboardService.getDashboardData(userId);
    res.render('Dashboard', {
      expenses: dashboardData.expenses,
      budgets: dashboardData.budgets,
      savings: dashboardData.savings,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(500).send("Internal Server Error");
  }
};