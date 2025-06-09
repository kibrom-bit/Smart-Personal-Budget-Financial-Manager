const dashboardService = require("../services/dashboardService");

// Get Dashboard Controller
const getDashboard = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user.id;

  try {
    const dashboardData = await dashboardService.getDashboardData(userId);
    res.render("Dashboard", {
      expenses: dashboardData.expenses,
      budgets: dashboardData.budgets,
      savings: dashboardData.savings,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err); // More specific error message
    return res.status(500).send("Internal Server Error");
  }
};

// Export the function as a named export
module.exports = {
  getDashboard,
};
