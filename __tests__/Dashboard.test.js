// __tests__/Dashboard.test.js
const fs = require("fs");
const ejs = require("ejs");
const { JSDOM } = require("jsdom");
const path = require("path");
import "@testing-library/jest-dom"; // Import for toBeInTheDocument matcher

describe("Dashboard.ejs", () => {
  let dom;
  let document;
  let template;
  const mockMonth = "may";
  const mockYear = 2025;

  beforeEach(() => {
    const templatePath = path.join(__dirname, "../views/Dashboard.ejs"); // Updated path
    template = fs.readFileSync(templatePath, "utf-8");
  });

  const renderTemplate = (data) => {
    const html = ejs.render(template, {
      ...data,
      month: mockMonth,
      year: mockYear,
    });
    dom = new JSDOM(html);
    document = dom.window.document;
  };

  const mockExpenses = [
    {
      id: 1,
      category: "Food",
      amount: 50,
      reason: "Lunch",
      date: "2025-05-14",
    },
    {
      id: 2,
      category: "Transportation",
      amount: 20,
      reason: "Bus fare",
      date: "2025-05-13",
    },
  ];

  const mockBudgets = [{ id: 1, budget_amount: 300, year: 2025, month: "may" }];

  const mockSavings = [{ id: 1, savings_goal: 100, year: 2025, month: "may" }];

  test("renders the expenses table with data", () => {
    renderTemplate({ expenses: mockExpenses, budgets: [], savings: [] });
    const expenseTable = document.querySelector(
      ".dashboard-section:nth-child(2) table"
    );
    expect(expenseTable).toBeInTheDocument();

    const rows = expenseTable.querySelectorAll("tbody tr");
    expect(rows.length).toBe(mockExpenses.length);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td");
      expect(cells[0].textContent).toBe(mockExpenses[index].category);
      expect(cells[1].textContent).toBe(mockExpenses[index].amount.toString());
      expect(cells[2].textContent).toBe(mockExpenses[index].reason);
      expect(cells[3].textContent).toBe(mockExpenses[index].date);
      expect(cells[4].querySelector(".edit-link")).toBeInTheDocument();
      expect(cells[4].querySelector(".edit-link").getAttribute("href")).toBe(
        `/expenses/update/${mockExpenses[index].id}/${mockMonth}/${mockYear}`
      );
    });
  });

  test("renders the budgets table with data", () => {
    renderTemplate({ expenses: [], budgets: mockBudgets, savings: [] });
    const budgetTable = document.querySelector(
      ".dashboard-section:nth-child(3) table"
    );
    expect(budgetTable).toBeInTheDocument();

    const rows = budgetTable.querySelectorAll("tbody tr");
    expect(rows.length).toBe(mockBudgets.length);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td");
      expect(cells[0].textContent).toBe(
        mockBudgets[index].budget_amount.toString()
      );
      expect(cells[1].textContent).toBe(
        `${mockBudgets[index].year}-${mockBudgets[index].month}`
      );
      expect(cells[2].querySelector(".edit-link")).toBeInTheDocument();
      expect(cells[2].querySelector(".edit-link").getAttribute("href")).toBe(
        `/budgets/edit/${mockBudgets[index].id}/${mockMonth}/${mockYear}`
      );
    });

    expect(
      document.querySelector(".dashboard-section:nth-child(3) p a.add-link")
    ).toBeNull();
  });

  test("renders the savings table with data", () => {
    renderTemplate({ expenses: [], budgets: [], savings: mockSavings });
    const savingsTable = document.querySelector(
      ".dashboard-section:nth-child(4) table"
    );
    expect(savingsTable).toBeInTheDocument();

    const rows = savingsTable.querySelectorAll("tbody tr");
    expect(rows.length).toBe(mockSavings.length);

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td");
      expect(cells[0].textContent).toBe(
        mockSavings[index].savings_goal.toString()
      );
      expect(cells[1].textContent).toBe(mockSavings[index].year.toString());
      expect(cells[2].textContent).toBe(mockSavings[index].month);
      expect(cells[3].querySelector(".edit-link")).toBeInTheDocument();
      expect(cells[3].querySelector(".edit-link").getAttribute("href")).toBe(
        `/savings/edit/${mockSavings[index].id}/${mockMonth}/${mockYear}`
      );
    });

    // Expect the 'Add Savings Goal' link to NOT be present when there are savings
    expect(
      document.querySelector(".dashboard-section:nth-child(4) p a.add-link")
    ).toBeNull();
  });

  test('renders "No expenses recorded" if expenses array is empty', () => {
    renderTemplate({ expenses: [], budgets: [], savings: [] });
    const noExpensesMessage = document.querySelector(
      ".dashboard-section:nth-child(2) p"
    );
    expect(noExpensesMessage).toBeInTheDocument();
    expect(noExpensesMessage.textContent).toContain(
      "No expenses recorded yet."
    );
    expect(noExpensesMessage.querySelector("a.add-link")).toBeInTheDocument();
    expect(
      noExpensesMessage.querySelector("a.add-link").getAttribute("href")
    ).toBe(`/expenses/addExpense/${mockMonth}/${mockYear}`);
  });

  test('renders "No budgets set yet" if budgets array is empty', () => {
    renderTemplate({ expenses: [], budgets: [], savings: [] });
    const noBudgetsMessage = document.querySelector(
      ".dashboard-section:nth-child(3) p"
    );
    expect(noBudgetsMessage).toBeInTheDocument();
    expect(noBudgetsMessage.textContent).toContain("No budgets set yet.");
    expect(noBudgetsMessage.querySelector("a.add-link")).toBeInTheDocument();
    expect(
      noBudgetsMessage.querySelector("a.add-link").getAttribute("href")
    ).toBe(`/budgets/addBudget/${mockMonth}/${mockYear}`);
  });

  test('renders "No savings set yet" if savings array is empty', () => {
    renderTemplate({ expenses: [], budgets: [], savings: [] });
    const noSavingsMessage = document.querySelector(
      ".dashboard-section:nth-child(4) p"
    );
    expect(noSavingsMessage).toBeInTheDocument();
    expect(noSavingsMessage.textContent).toContain("No savings set yet.");
    expect(noSavingsMessage.querySelector("a.add-link")).toBeInTheDocument();
    expect(
      noSavingsMessage.querySelector("a.add-link").getAttribute("href")
    ).toBe(`/savings/addSaving/${mockMonth}/${mockYear}`);
  });

  test("renders the 'Go to Profile' link", () => {
    renderTemplate({ expenses: [], budgets: [], savings: [] });
    const profileLink = document.querySelector(
      ".text-center a[href='/profile']"
    );
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.textContent).toContain("Go to Profile");
  });

  test("renders the 'Logout' link", () => {
    renderTemplate({ expenses: [], budgets: [], savings: [] });
    const logoutLink = document.querySelector(
      ".text-center a[href='users/logout']"
    );
    expect(logoutLink).toBeInTheDocument();
    expect(logoutLink.textContent).toContain("Logout");
  });
});
