const calculatorCatalog = [
  { name: 'Scientific Calculator', url: '/calculators/scientific-calculator.html', category: 'math' },
  { name: 'Mortgage Calculator', url: '/calculators/mortgage-calculator.html', category: 'finance' },
  { name: 'BMI Calculator', url: '/calculators/bmi-calculator.html', category: 'health' },
  { name: 'Loan Calculator', url: '/calculators/loan-calculator.html', category: 'finance' },
  { name: 'Simple Interest Calculator', url: '/calculators/simple-interest-calculator.html', category: 'finance' },
  { name: 'Compound Interest Calculator', url: '/calculators/compound-interest-calculator.html', category: 'finance' },
  { name: 'Age Calculator', url: '/calculators/age-calculator.html', category: 'other' },
  { name: 'Percentage Calculator', url: '/calculators/percentage-calculator.html', category: 'math' },
  { name: 'GPA Calculator', url: '/calculators/gpa-calculator.html', category: 'math' },
  { name: 'Calorie Calculator', url: '/calculators/calorie-calculator.html', category: 'health' },
  { name: 'Unit Converter', url: '/calculators/unit-converter.html', category: 'other' },
  { name: 'Discount Calculator', url: '/calculators/discount-calculator.html', category: 'other' }
];

function renderCards(containerId, filterFn = () => true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = calculatorCatalog
    .filter(filterFn)
    .map(c => `<a class="calculator-card" href="${c.url}"><h3 class="h6">${c.name}</h3><p class="text-muted mb-0 text-capitalize">${c.category}</p></a>`)
    .join('');
}

function bindSearch(inputId, targetId) {
  const input = document.getElementById(inputId);
  const target = document.getElementById(targetId);
  if (!input || !target) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    target.querySelectorAll('.calculator-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
  });
}

function showResult(text, error = false) {
  const box = document.getElementById('resultBox');
  if (!box) return;
  box.textContent = text;
  box.classList.toggle('text-danger', error);
}

function copyResult() {
  const text = document.getElementById('resultBox')?.textContent || '';
  if (!text || text.includes('appear here')) return;
  navigator.clipboard.writeText(text);
}

function bindScientific(idPrefix = '') {
  const display = document.getElementById(`${idPrefix}display`);
  const keypad = document.getElementById(`${idPrefix}keypad`);
  if (!display || !keypad) return;
  const safeEval = (exp) => {
    const prepared = exp
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/√/g, 'Math.sqrt')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/\^/g, '**');
    return Function(`"use strict"; return (${prepared})`)();
  };

  keypad.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const val = e.target.dataset.value;
    if (val === 'C') display.value = '';
    else if (val === '=') {
      try { display.value = safeEval(display.value); }
      catch { display.value = 'Error'; }
    } else if (val === '⌫') display.value = display.value.slice(0, -1);
    else display.value += val;
  });
}

function compute() {
  const pageType = document.body.dataset.calculator;
  try {
    switch (pageType) {
      case 'mortgage': {
        const p = +val('loanAmount'), y = +val('loanYears'), r = +val('interestRate') / 100 / 12;
        const n = y * 12;
        if (p <= 0 || y <= 0 || r < 0) throw new Error('Please enter valid positive values.');
        const m = (p * r) / (1 - Math.pow(1 + r, -n));
        showResult(`Monthly Payment: $${m.toFixed(2)}`);
        break;
      }
      case 'bmi': {
        const w = +val('weight'), h = +val('height') / 100;
        if (w <= 0 || h <= 0) throw new Error('Enter valid weight and height.');
        const bmi = w / (h * h);
        const status = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
        showResult(`BMI: ${bmi.toFixed(1)} (${status})`);
        break;
      }
      case 'loan': {
        const principal = +val('principal'), rate = +val('apr') / 100 / 12, months = +val('months');
        if (principal <= 0 || months <= 0 || rate < 0) throw new Error('Enter valid inputs.');
        const payment = (principal * rate) / (1 - Math.pow(1 + rate, -months));
        showResult(`Estimated Monthly Payment: $${payment.toFixed(2)}`);
        break;
      }
      case 'simple-interest': {
        const p = +val('principal'), r = +val('rate') / 100, t = +val('time');
        if (p <= 0 || r < 0 || t <= 0) throw new Error('Enter valid values.');
        const i = p * r * t;
        showResult(`Interest: $${i.toFixed(2)} | Total: $${(p + i).toFixed(2)}`);
        break;
      }
      case 'compound-interest': {
        const p = +val('principal'), r = +val('rate') / 100, t = +val('time'), n = +val('frequency');
        if (p <= 0 || r < 0 || t <= 0 || n <= 0) throw new Error('Enter valid values.');
        const amount = p * Math.pow(1 + r / n, n * t);
        showResult(`Future Value: $${amount.toFixed(2)}`);
        break;
      }
      case 'age': {
        const dob = new Date(val('dob'));
        if (isNaN(dob)) throw new Error('Select a valid date of birth.');
        const diff = Date.now() - dob.getTime();
        const age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        showResult(`Age: ${age} years`);
        break;
      }
      case 'percentage': {
        const part = +val('part'), whole = +val('whole');
        if (whole === 0) throw new Error('Whole cannot be 0.');
        showResult(`Result: ${((part / whole) * 100).toFixed(2)}%`);
        break;
      }
      case 'gpa': {
        const grades = val('grades').split(',').map(Number).filter(n => !isNaN(n));
        if (!grades.length) throw new Error('Enter comma separated grade points.');
        const gpa = grades.reduce((a, b) => a + b, 0) / grades.length;
        showResult(`GPA: ${gpa.toFixed(2)}`);
        break;
      }
      case 'calorie': {
        const gender = val('gender'), age = +val('age'), weight = +val('weight'), height = +val('height'), activity = +val('activity');
        if (age <= 0 || weight <= 0 || height <= 0) throw new Error('Enter valid data.');
        const bmr = gender === 'male'
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161;
        showResult(`Daily Calories: ${(bmr * activity).toFixed(0)} kcal`);
        break;
      }
      case 'unit-converter': {
        const value = +val('value'), from = val('fromUnit'), to = val('toUnit');
        if (isNaN(value)) throw new Error('Enter a numeric value.');
        const map = { m: 1, cm: 0.01, km: 1000, ft: 0.3048 };
        showResult(`Converted: ${((value * map[from]) / map[to]).toFixed(4)} ${to}`);
        break;
      }
      case 'discount': {
        const price = +val('price'), discount = +val('discount');
        if (price <= 0 || discount < 0) throw new Error('Enter valid values.');
        const savings = price * discount / 100;
        showResult(`Final Price: $${(price - savings).toFixed(2)} (You save $${savings.toFixed(2)})`);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    showResult(e.message, true);
  }
}

function val(id) { return document.getElementById(id)?.value?.trim() || ''; }

document.addEventListener('DOMContentLoaded', () => {
  renderCards('featuredCalculators');
  renderCards('categoryFinance', c => c.category === 'finance');
  renderCards('categoryHealth', c => c.category === 'health');
  renderCards('categoryMath', c => c.category === 'math');
  renderCards('categoryOther', c => c.category === 'other');
  bindSearch('globalSearch', 'featuredCalculators');
  bindSearch('heroSearch', 'featuredCalculators');
  bindScientific('home-');
  bindScientific('');

  const calcBtn = document.getElementById('calculateBtn');
  if (calcBtn) calcBtn.addEventListener('click', compute);
  const copyBtn = document.getElementById('copyResultBtn');
  if (copyBtn) copyBtn.addEventListener('click', copyResult);
});
