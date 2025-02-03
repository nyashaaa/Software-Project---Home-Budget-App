let users = [];
let currentUser = null;
let expenses = [];
let income = [];

function saveData() {
  if (currentUser) {
    const userIndex = users.findIndex((u) => u.username === currentUser.username);
    if (userIndex > -1) {
      users[userIndex].expenses = expenses;
      users[userIndex].income = income;
    }
    localStorage.setItem("users", JSON.stringify(users));
  }
}

function loadData() {
  const savedUsers = localStorage.getItem("users");
  if (savedUsers) users = JSON.parse(savedUsers);

  if (currentUser) {
    const user = users.find((u) => u.username === currentUser.username);
    if (user) {
      expenses = user.expenses || [];
      income = user.income || [];
    } else {
      expenses = [];
      income = [];
    }
  }

  renderExpenses();
  renderIncomes();
  updateDashboard();
}

window.addEventListener("load", loadData);

document.getElementById("getStartedButton").addEventListener("click", () => {
  document.getElementById("greetingPage").classList.add("hidden");
  document.getElementById("authSection").classList.remove("hidden");
});

document.getElementById("goToRegister").addEventListener("click", () => {
  toggleForms("register");
});

document.getElementById("goToLogin").addEventListener("click", () => {
  toggleForms("login");
});

function toggleForms(formType) {
  const formIds = ["loginForm", "registerForm"];
  formIds.forEach((id) => {
    document.getElementById(id).classList.toggle("hidden", id !== formType + "Form");
  });
}

document.getElementById("registerButton").addEventListener("click", () => {
  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  if (username && email && password) {
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      alert("Username already exists. Please choose a different one.");
      return;
    }

    users.push({ username, email, password, expenses: [], income: [] });
    saveData();
    alert("Registered successfully!");
    toggleForms("login");
  } else {
    alert("All fields are required.");
  }
});

document.getElementById("loginButton").addEventListener("click", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    loadData();
    setWelcomeMessage();
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    showTab("dashboard");
  } else {
    alert("Invalid credentials.");
  }
});

document.getElementById("logout").addEventListener("click", function() {
  localStorage.removeItem("userToken"); 
  window.location.href = "index.html";
});


function showTab(tabName) {
  const sections = {
    dashboard: "dashboardSection",
    expenses: "manageExpensesSection",
    income: "manageIncomeSection",
  };

  Object.keys(sections).forEach((key) => {
    const section = document.getElementById(sections[key]);
    section.classList.toggle("hidden", key !== tabName);
  });
}

document.getElementById("dashboardTab").addEventListener("click", () => showTab("dashboard"));
document.getElementById("manageExpensesTab").addEventListener("click", () => showTab("expenses"));
document.getElementById("manageIncomeTab").addEventListener("click", () => showTab("income"));

document.getElementById("expenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const category = document.getElementById("expenseCategory").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;

  if (category && amount && date) {
    expenses.push({ category, amount, date });
    saveData();
    renderExpenses();
    updateDashboard();
  } else {
    alert("All fields are required.");
  }
});

function renderExpenses() {
  const tbody = document.getElementById("expenseTable").querySelector("tbody");
  tbody.innerHTML = expenses.map((exp, i) => `
    <tr>
      <td>${exp.date}</td>
      <td>${exp.category}</td>
      <td>$${exp.amount.toFixed(2)}</td>
      <td><button onclick="deleteExpense(${i})">Delete</button></td>
    </tr>`).join("");
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveData();
  renderExpenses();
  updateDashboard();
}

document.getElementById("incomeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const category = document.getElementById("incomeCategory").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const date = document.getElementById("incomeDate").value;

  if (category && amount && date) {
    income.push({ category, amount, date });
    saveData();
    renderIncomes();
    updateDashboard();
  } else {
    alert("All fields are required.");
  }
});

function renderIncomes() {
  const tbody = document.getElementById("incomeTable").querySelector("tbody");
  tbody.innerHTML = income.map((inc, i) => `
    <tr>
      <td>${inc.date}</td>
      <td>${inc.category}</td>
      <td>$${inc.amount.toFixed(2)}</td>
      <td><button onclick="deleteIncome(${i})">Delete</button></td>
    </tr>`).join("");
}

function deleteIncome(index) {
  income.splice(index, 1);
  saveData();
  renderIncomes();
  updateDashboard();
}

function updateExpenseChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  const categories = expenses.map(exp => exp.category);
  const amounts = expenses.map(exp => exp.amount);

  if (window.expenseChartInstance) window.expenseChartInstance.destroy();
  
  window.expenseChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: ['#d17abe', '#811f67', '#f3e1f0', '#9966FF', '#FFCE56'],
        borderColor: ['#811f67', '#d17abe', '#f3e1f0', '#9966FF', '#FFCE56'],
        borderWidth: 1
      }],
    },
  });
}

function updateDashboard() {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const remaining = totalIncome - totalExpenses;

  document.getElementById("currentBudget").textContent = totalIncome.toFixed(2);
  document.getElementById("remainingBudget").textContent = remaining.toFixed(2);
  document.getElementById("budgetSpent").textContent = totalIncome ? totalExpenses : 0;

  updateExpenseChart();

  const highestExpense = expenses.length ? expenses.reduce((prev, curr) => prev.amount > curr.amount ? prev : curr) : null;
  document.getElementById("highestExpense").textContent = highestExpense ? `Your highest expense is ${highestExpense.category} at $${highestExpense.amount.toFixed(2)}` : "No expenses recorded yet.";
}

function setWelcomeMessage() {
  if (currentUser) {
    document.getElementById("welcomeMessage").textContent = `Welcome, ${currentUser.username} to your Dashboard!`;
  }
}

document.getElementById("download-summary").addEventListener("click", function() {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const remaining = totalIncome - totalExpenses;

    let summaryText = `
    Expense & Income Summary
    -------------------------
    Total Income: $${totalIncome.toFixed(2)}
    Total Expenses: $${totalExpenses.toFixed(2)}
    Remaining Balance: $${remaining.toFixed(2)}
    `;


  let blob = new Blob([summaryText], { type: "text/plain" });


  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Expense_Summary.txt"; 

  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
