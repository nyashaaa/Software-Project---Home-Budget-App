// User data
let users = [];
let currentUser = null;
let expenses = [];
let budgets = { income: 0, startDate: "", endDate: "" };

// Navigation
document.getElementById("getStartedButton").addEventListener("click", () => {
  document.getElementById("greetingPage").classList.add("hidden");
  document.getElementById("authSection").classList.remove("hidden");
});

// Switch Forms
document.getElementById("goToRegister").addEventListener("click", () => {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
});

document.getElementById("goToLogin").addEventListener("click", () => {
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
});

// Register
document.getElementById("registerButton").addEventListener("click", () => {
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (username && email && password) {
    users.push({ username, email, password });
    alert("Registered successfully!");
    document.getElementById("goToLogin").click();
  } else {
    alert("All fields are required.");
  }
});

// Login
document.getElementById("loginButton").addEventListener("click", () => {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    showTab("dashboard");
  } else {
    alert("Invalid credentials.");
  }
});

// Tab Switching Logic
function showTab(tabName) {
  const sections = {
    dashboard: "dashboardSection",
    expenses: "manageExpensesSection",
    budgets: "manageBudgetsSection",
  };

  Object.keys(sections).forEach((key) => {
    const section = document.getElementById(sections[key]);
    section.classList.toggle("hidden", key !== tabName);
  });
}

document.getElementById("dashboardTab").addEventListener("click", () => {
  showTab("dashboard");
});

document.getElementById("manageExpensesTab").addEventListener("click", () => {
  showTab("expenses");
});

document.getElementById("manageBudgetsTab").addEventListener("click", () => {
  showTab("budgets");
});

// Expenses
document.getElementById("expenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;

  if (category && amount && date) {
    expenses.push({ category, amount, date });
    renderExpenses();
    updateDashboard();
  } else {
    alert("All fields are required.");
  }
});

function renderExpenses() {
  const tbody = document.getElementById("expenseTable").querySelector("tbody");
  tbody.innerHTML = expenses
    .map((exp, i) => `
      <tr>
        <td>${exp.date}</td>
        <td>${exp.category}</td>
        <td>$${exp.amount.toFixed(2)}</td>
        <td><button onclick="deleteExpense(${i})">Delete</button></td>
      </tr>`)
    .join("");
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
  updateDashboard();
}

// Budgets
document.getElementById("budgetForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const income = parseFloat(document.getElementById("monthlyIncome").value);
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (income && startDate && endDate) {
    budgets = { income, startDate, endDate };
    renderBudgets();
    updateDashboard();
  } else {
    alert("All fields are required.");
  }
});

function renderBudgets() {
  const tbody = document.getElementById("budgetTable").querySelector("tbody");
  tbody.innerHTML = `
    <tr>
      <td>$${budgets.income.toFixed(2)}</td>
      <td>${budgets.startDate}</td>
      <td>${budgets.endDate}</td>
    </tr>`;
}

// Dashboard & Chart
function updateDashboard() {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budgets.income - totalExpenses;
  const spent = budgets.income ? ((totalExpenses / budgets.income) * 100).toFixed(2) : 0;

  document.getElementById("currentBudget").textContent = budgets.income.toFixed(2);
  document.getElementById("remainingBudget").textContent = remaining.toFixed(2);
  document.getElementById("budgetSpent").textContent = spent;

  updateChart();
}

function updateChart() {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  const data = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  if (window.expenseChart) window.expenseChart.destroy();

  window.expenseChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: "Expenses",
        data: Object.values(data),
        backgroundColor: [
          "#f06292", "#64b5f6", "#aed581", "#ffb74d", "#90a4ae",
        ],
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
    },
  });
}
