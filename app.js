// State for real Mutual Fund data fetched from backend
let mutualFunds = [];
let isLoadingFunds = true;

// User State (Mock Initial Data)
let userState = {
  totalValue: 500000, // ₹5,00,000
  equityValue: 300000,
  debtValue: 200000,
  riskAppetite: 'medium', // mock
  goals: ['short_term'] // array to support multiple goals
};

// DOM Elements
const views = {
  landing: document.getElementById('landing-view'),
  dashboard: document.getElementById('dashboard-view'),
  recommendations: document.getElementById('recommendations-view')
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  renderDashboard();
  
  // Fetch real funds data from backend in background
  try {
    const response = await fetch('http://127.0.0.1:8000/api/funds');
    const data = await response.json();
    mutualFunds = data;
    isLoadingFunds = false;
  } catch (error) {
    console.error("Failed to fetch mutual funds from backend:", error);
    alert("Warning: Could not connect to the backend server. Make sure the Python server is running.");
    isLoadingFunds = false;
  }
});

function setupEventListeners() {
  // Navigation
  document.getElementById('get-started-btn').addEventListener('click', () => {
    switchView('dashboard');
    document.getElementById('nav-top-funds-btn').classList.remove('hidden');
  });
  
  document.getElementById('nav-top-funds-btn').addEventListener('click', () => {
    if (isLoadingFunds) {
      alert("Still fetching live market data, please wait a moment...");
      return;
    }
    processRecommendations();
    switchView('recommendations');
  });

  document.getElementById('back-to-dash-btn').addEventListener('click', () => {
    switchView('dashboard');
  });

  document.getElementById('refresh-funds-btn').addEventListener('click', () => {
    processRecommendations();
  });

  // Goals setup
  const goalsContainer = document.getElementById('goals-container');
  const goalBtns = goalsContainer.querySelectorAll('.goal-pill');
  goalBtns.forEach(btn => {
    if (userState.goals.includes(btn.dataset.goal)) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }

    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
      const goal = btn.dataset.goal;
      if (btn.classList.contains('selected')) {
        if (!userState.goals.includes(goal)) userState.goals.push(goal);
      } else {
        userState.goals = userState.goals.filter(g => g !== goal);
      }
    });
  });
}

function switchView(viewName) {
  Object.values(views).forEach(v => {
    v.classList.remove('active');
    v.classList.add('hidden');
  });
  views[viewName].classList.remove('hidden');
  setTimeout(() => {
    views[viewName].classList.add('active');
  }, 10);
}

// --- Dashboard Logic ---

function renderDashboard() {
  // Total Value
  document.getElementById('dash-total-value').innerText = `₹${userState.totalValue.toLocaleString('en-IN')}`;
  
  // Risk Appetite
  const riskText = userState.riskAppetite.charAt(0).toUpperCase() + userState.riskAppetite.slice(1);
  document.getElementById('dash-risk').innerText = riskText;

  // Asset Allocation
  const equityPct = userState.totalValue === 0 ? 0 : Math.round((userState.equityValue / userState.totalValue) * 100);
  const debtPct = userState.totalValue === 0 ? 0 : 100 - equityPct;

  document.getElementById('alloc-equity').style.width = `${equityPct}%`;
  document.getElementById('text-equity').innerText = `${equityPct}%`;
  
  document.getElementById('alloc-debt').style.width = `${debtPct}%`;
  document.getElementById('text-debt').innerText = `${debtPct}%`;
}


// --- Recommendation Engine ---

function processRecommendations() {
  if (mutualFunds.length === 0) {
    document.getElementById('funds-container').innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No funds available. Please check the backend connection.</p>';
    return;
  }

  // 1. Calculate ideal allocation based on risk & goals
  let idealEquityPct = 50; // baseline
  
  if (userState.riskAppetite === 'high') idealEquityPct = 70;
  if (userState.riskAppetite === 'low') idealEquityPct = 20;

  // Adjust for goals
  if (userState.goals.includes('wealth_creation') || userState.goals.includes('retirement')) {
    idealEquityPct = Math.min(100, idealEquityPct + 15);
  }
  if (userState.goals.includes('short_term')) {
    idealEquityPct = Math.max(0, idealEquityPct - 20);
  }

  // 2. See what the user needs to balance their portfolio
  const currentEquityPct = (userState.equityValue / userState.totalValue) * 100;
  let needsMoreEquity = currentEquityPct < idealEquityPct;

  // 3. Score funds
  let scoredFunds = mutualFunds.map(fund => {
    let score = 0;
    
    // Match Risk
    if (fund.risk === userState.riskAppetite) score += 5;
    
    // Balance Portfolio
    if (needsMoreEquity && (fund.category === 'Equity' || fund.category === 'Hybrid')) score += 3;
    if (!needsMoreEquity && (fund.category === 'Debt' || fund.category === 'Hybrid')) score += 3;
    
    // Check Goals vs Category
    if (userState.goals.includes('short_term') && fund.category === 'Debt') score += 2;
    if (userState.goals.includes('retirement') && fund.category === 'Equity') score += 2;

    return { ...fund, score };
  });

  // Sort by score descending
  scoredFunds.sort((a, b) => b.score - a.score);
  
  // Take top 3
  const top3 = scoredFunds.slice(0, 3);
  renderFunds(top3, idealEquityPct, currentEquityPct);
}

function renderFunds(funds, idealEq, currentEq) {
  const container = document.getElementById('funds-container');
  container.innerHTML = '';
  
  // Optional global amount
  const globalInput = document.getElementById('overall-invest-amount').value;
  const globalAmount = globalInput ? parseInt(globalInput, 10) : null;
  const suggestedAmount = globalAmount ? Math.round(globalAmount / 3) : '';

  funds.forEach(fund => {
    let rationale = `Matches your ${userState.riskAppetite} risk profile.`;
    if (fund.category === 'Equity' && idealEq > currentEq) {
      rationale = `Helps increase your Equity exposure towards your ideal ${idealEq}% target.`;
    } else if (fund.category === 'Debt' && idealEq < currentEq) {
      rationale = `Helps balance your portfolio by adding safe Debt instruments.`;
    }

    const card = document.createElement('div');
    card.className = 'fund-card';
    card.innerHTML = `
      <span class="fund-category">${fund.category} Fund</span>
      <h3 class="fund-name">${fund.name}</h3>
      <div class="fund-metrics">
        <div class="metric">
          <h4>Live NAV</h4>
          <p>${fund.returns3Y}</p>
        </div>
      </div>
      <p class="fund-rationale">${rationale}</p>
      
      <div class="invest-block">
        <div class="invest-input-wrapper">
          <span class="currency">₹</span>
          <input type="number" class="fund-invest-input" placeholder="Amount" value="${suggestedAmount}">
        </div>
        <button class="btn invest-btn" data-category="${fund.category}" data-nav="${fund.nav}">Invest</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach Invest Listeners
  const investBtns = container.querySelectorAll('.invest-btn');
  investBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.fund-card');
      const input = card.querySelector('.fund-invest-input');
      const amount = parseInt(input.value, 10);
      const navStr = btn.dataset.nav;
      const nav = parseFloat(navStr);
      
      if (!amount || amount <= 0) {
        alert("Please enter a valid investment amount.");
        return;
      }
      
      let unitsBought = "N/A";
      if (!isNaN(nav) && nav > 0) {
        unitsBought = (amount / nav).toFixed(3);
      }

      handleInvestment(amount, btn.dataset.category, card.querySelector('.fund-name').innerText, unitsBought, navStr);
    });
  });
}

function handleInvestment(amount, category, fundName, units, nav) {
  // Update State
  userState.totalValue += amount;
  if (category === 'Equity') {
    userState.equityValue += amount;
  } else if (category === 'Debt') {
    userState.debtValue += amount;
  } else {
    // Hybrid: split 65/35 rough estimate
    userState.equityValue += Math.round(amount * 0.65);
    userState.debtValue += Math.round(amount * 0.35);
  }

  // Feedback to user
  if (units !== "N/A") {
    alert(`Successfully invested ₹${amount.toLocaleString('en-IN')} in ${fundName}!\n\nYou acquired ${units} units at a Live NAV of ₹${nav}.`);
  } else {
    alert(`Successfully invested ₹${amount.toLocaleString('en-IN')} in ${fundName}!`);
  }
  
  // Re-render dashboard and navigate back
  renderDashboard();
  switchView('dashboard');
}
