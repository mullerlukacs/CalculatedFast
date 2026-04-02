function qs(id) { return document.getElementById(id); }

function initTheme() {
  const toggle = qs('themeToggle');
  const stored = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', stored);
  if (toggle) {
    toggle.textContent = stored === 'dark' ? '☀️ Light' : '🌙 Dark';
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', current);
      localStorage.setItem('theme', current);
      toggle.textContent = current === 'dark' ? '☀️ Light' : '🌙 Dark';
    });
  }
}

function initSearch() {
  const input = qs('calculatorSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    document.querySelectorAll('[data-search-item]').forEach(card => {
      card.classList.toggle('hidden', !card.dataset.searchItem.includes(term));
    });
  });
}

function showResult(id, text, ok = true) {
  const el = qs(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = ok ? 'var(--success)' : 'var(--danger)';
}

function copyResult(btn) {
  const target = btn.dataset.copyTarget;
  const text = qs(target)?.textContent?.trim();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const old = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = old, 1200);
  });
}

function bindCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => copyResult(btn));
  });
}

function num(id) { return parseFloat(qs(id).value); }

function initBMI() {
  const btn = qs('bmiCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const h = num('bmiHeight');
    const w = num('bmiWeight');
    if (!h || !w || h <= 0 || w <= 0) return showResult('bmiResult', 'Enter valid height and weight.', false);
    const bmi = w / ((h / 100) ** 2);
    let cat = 'Normal';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
    else if (bmi >= 30) cat = 'Obese';
    showResult('bmiResult', `BMI: ${bmi.toFixed(2)} (${cat})`);
  });
}

function initAge() {
  const btn = qs('ageCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const dob = new Date(qs('ageDob').value);
    if (Number.isNaN(dob.getTime())) return showResult('ageResult', 'Please pick a valid birth date.', false);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return showResult('ageResult', 'Birth date cannot be in the future.', false);
    showResult('ageResult', `Age: ${years} years, ${months} months, ${days} days`);
  });
}

function initLoan() {
  const btn = qs('loanCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const p = num('loanAmount');
    const r = num('loanRate') / 1200;
    const n = num('loanYears') * 12;
    if (!p || !n || p <= 0 || n <= 0 || r < 0) return showResult('loanResult', 'Enter valid principal, rate and years.', false);
    const emi = r === 0 ? p / n : p * r * ((1 + r) ** n) / (((1 + r) ** n) - 1);
    const total = emi * n;
    showResult('loanResult', `Monthly: $${emi.toFixed(2)} | Total: $${total.toFixed(2)} | Interest: $${(total - p).toFixed(2)}`);
  });
}

function initPercentage() {
  const btn = qs('percentageCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const part = num('percentPart');
    const whole = num('percentWhole');
    if (Number.isNaN(part) || Number.isNaN(whole) || whole === 0) return showResult('percentageResult', 'Whole value must not be zero.', false);
    showResult('percentageResult', `${((part / whole) * 100).toFixed(2)}%`);
  });
}

function initDiscount() {
  const btn = qs('discountCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const price = num('discountPrice');
    const pct = num('discountPercent');
    if (!price || Number.isNaN(pct) || price < 0 || pct < 0) return showResult('discountResult', 'Enter valid price and discount.', false);
    const save = price * (pct / 100);
    showResult('discountResult', `Final: $${(price - save).toFixed(2)} | You save: $${save.toFixed(2)}`);
  });
}

function initEMI() {
  const btn = qs('emiCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const p = num('emiAmount');
    const r = num('emiRate') / 1200;
    const n = num('emiMonths');
    if (!p || !n || p <= 0 || n <= 0 || r < 0) return showResult('emiResult', 'Enter valid amount, interest and months.', false);
    const emi = r === 0 ? p / n : p * r * ((1 + r) ** n) / (((1 + r) ** n) - 1);
    showResult('emiResult', `EMI: $${emi.toFixed(2)} | Total payable: $${(emi * n).toFixed(2)}`);
  });
}

function initGPA() {
  const btn = qs('gpaCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const grades = qs('gpaGrades').value.split(',').map(v => parseFloat(v.trim())).filter(v => !Number.isNaN(v));
    const credits = qs('gpaCredits').value.split(',').map(v => parseFloat(v.trim())).filter(v => !Number.isNaN(v));
    if (!grades.length || grades.length !== credits.length) return showResult('gpaResult', 'Enter equal number of grades and credits.', false);
    const weighted = grades.reduce((acc, grade, i) => acc + (grade * credits[i]), 0);
    const totalCredits = credits.reduce((a, b) => a + b, 0);
    if (totalCredits === 0) return showResult('gpaResult', 'Total credits must be greater than zero.', false);
    showResult('gpaResult', `GPA: ${(weighted / totalCredits).toFixed(2)} / 4.00`);
  });
}

function initBinary() {
  const btn = qs('binaryCalcBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const b1 = qs('binaryOne').value.trim();
    const b2 = qs('binaryTwo').value.trim();
    const op = qs('binaryOp').value;
    if (!/^[01]+$/.test(b1) || !/^[01]+$/.test(b2)) return showResult('binaryResult', 'Only binary digits 0 and 1 are allowed.', false);
    const n1 = parseInt(b1, 2);
    const n2 = parseInt(b2, 2);
    let out;
    if (op === '+') out = n1 + n2;
    else if (op === '-') out = n1 - n2;
    else out = n1 * n2;
    showResult('binaryResult', `Result: ${out.toString(2)} (decimal ${out})`, out >= 0);
  });
}

function evaluateExpression(expr, scientific = false) {
  let safe = expr.replace(/[^0-9+\-*/().%^ ]/g, '');
  safe = safe.replace(/\^/g, '**').replace(/%/g, '/100');
  if (scientific) {
    safe = safe
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/log\(/g, 'Math.log10(');
  }
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${safe})`)();
}

function initBasic() {
  const btn = qs('basicEvalBtn');
  const input = qs('basicExpression');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    try {
      const ans = evaluateExpression(input.value);
      if (!Number.isFinite(ans)) throw new Error();
      showResult('basicResult', `Result: ${ans}`);
    } catch {
      showResult('basicResult', 'Invalid expression.', false);
    }
  });
}

function initScientific() {
  const btn = qs('sciEvalBtn');
  const input = qs('sciExpression');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    try {
      const ans = evaluateExpression(input.value, true);
      if (!Number.isFinite(ans)) throw new Error();
      showResult('scientificResult', `Result: ${ans}`);
    } catch {
      showResult('scientificResult', 'Invalid scientific expression.', false);
    }
  });
  document.querySelectorAll('[data-insert]').forEach(btnEl => {
    btnEl.addEventListener('click', () => {
      input.value += btnEl.dataset.insert;
      input.focus();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSearch();
  bindCopyButtons();
  initBMI();
  initAge();
  initLoan();
  initPercentage();
  initDiscount();
  initEMI();
  initGPA();
  initBinary();
  initScientific();
  initBasic();
});
