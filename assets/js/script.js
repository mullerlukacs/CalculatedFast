const calculatorCatalog = [
  { slug: 'scientific-calculator', name: 'Scientific Calculator', category: 'math' },
  { slug: 'mortgage-calculator', name: 'Mortgage Calculator', category: 'finance' },
  { slug: 'bmi-calculator', name: 'BMI Calculator', category: 'health' },
  { slug: 'loan-calculator', name: 'Loan Calculator', category: 'finance' },
  { slug: 'simple-interest-calculator', name: 'Simple Interest Calculator', category: 'finance' },
  { slug: 'compound-interest-calculator', name: 'Compound Interest Calculator', category: 'finance' },
  { slug: 'age-calculator', name: 'Age Calculator', category: 'other' },
  { slug: 'percentage-calculator', name: 'Percentage Calculator', category: 'math' },
  { slug: 'gpa-calculator', name: 'GPA Calculator', category: 'math' },
  { slug: 'calorie-calculator', name: 'Calorie Calculator', category: 'health' },
  { slug: 'unit-converter', name: 'Unit Converter', category: 'other' },
  { slug: 'discount-calculator', name: 'Discount Calculator', category: 'other' }
];

const siteRoot = document.body.dataset.root || '.';
const calcPath = `${siteRoot}/calculators`;
const catPath = `${siteRoot}/categories`;

function calcUrl(slug) { return `${calcPath}/${slug}.html`; }

function renderCards(containerId, filterFn = () => true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = calculatorCatalog
    .filter(filterFn)
    .map(c => `<a class="calculator-card" href="${calcUrl(c.slug)}"><h3 class="h6">${c.name}</h3><p class="text-muted mb-0 text-capitalize">${c.category}</p></a>`)
    .join('');
}

function bindSearch(inputId, targetId) {
  const input = document.getElementById(inputId);
  const target = document.getElementById(targetId);
  if (!input || !target) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    target.querySelectorAll('.calculator-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
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

function safeEvalScientific(exp) {
  const prepared = exp
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/√/g, 'Math.sqrt')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/log/g, 'Math.log10')
    .replace(/ln/g, 'Math.log')
    .replace(/\^/g, '**');
  return Function(`"use strict"; return (${prepared})`)();
}

function bindScientific(idPrefix = '') {
  const display = document.getElementById(`${idPrefix}display`);
  const keypad = document.getElementById(`${idPrefix}keypad`);
  if (!display || !keypad) return;

  keypad.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const val = e.target.dataset.value;
    if (val === 'C') display.value = '';
    else if (val === '=') {
      try { display.value = safeEvalScientific(display.value); }
      catch { display.value = 'Error'; }
    } else if (val === '⌫') display.value = display.value.slice(0, -1);
    else display.value += val;
  });
}

function val(id) { return document.getElementById(id)?.value?.trim() || ''; }

function compute() {
  const pageType = document.body.dataset.calculator;
  try {
    switch (pageType) {
      case 'mortgage': {
        const p = +val('loanAmount');
        const y = +val('loanYears');
        const annualRate = +val('interestRate') / 100;
        const n = y * 12;
        const r = annualRate / 12;
        if (p <= 0 || y <= 0 || annualRate < 0) throw new Error('Please enter valid positive values.');
        const m = r === 0 ? p / n : (p * r) / (1 - Math.pow(1 + r, -n));
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
        const payment = rate === 0 ? principal / months : (principal * rate) / (1 - Math.pow(1 + rate, -months));
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
        if (Number.isNaN(dob.getTime())) throw new Error('Select a valid date of birth.');
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        showResult(`Age: ${age} years`);
        break;
      }
      case 'percentage': {
        const part = +val('part'), whole = +val('whole');
        if (Number.isNaN(part) || Number.isNaN(whole) || whole === 0) throw new Error('Whole cannot be 0.');
        showResult(`Result: ${((part / whole) * 100).toFixed(2)}%`);
        break;
      }
      case 'gpa': {
        const grades = val('grades').split(',').map(v => Number(v.trim())).filter(n => !Number.isNaN(n));
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
        if (Number.isNaN(value)) throw new Error('Enter a numeric value.');
        const map = { m: 1, cm: 0.01, km: 1000, ft: 0.3048 };
        showResult(`Converted: ${((value * map[from]) / map[to]).toFixed(4)} ${to}`);
        break;
      }
      case 'discount': {
        const price = +val('price'), discount = +val('discount');
        if (price <= 0 || discount < 0 || discount > 100) throw new Error('Enter a valid price and discount (0-100).');
        const savings = price * discount / 100;
        showResult(`Final Price: $${(price - savings).toFixed(2)} (You save $${savings.toFixed(2)})`);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    showResult(error.message, true);
  }
}

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

  const yearNode = document.getElementById('currentYear');
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
});
