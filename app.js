/*
   ResearchFin — app.js
   Project : Strategies for Overcoming Financial Constraints
   College  : Manipal University Jaipur 
   Author  : Bhoomi Gupta(23FE10CAI00515)
*/

/* 
   STATE VARIABLES
 */
var user        = { name: '', id: '', dept: '', role: 0 };
var roleIcons   = ['🎓', '👨‍🏫', '🏛'];
var roleLabels  = ['B.Tech Student', 'Faculty Guide', 'HOD / Admin'];
var budgetItems = [];
var casesOpened = {};
var quizDone    = false;
var currentQ    = 0;
var answers     = [];

var activeFundFilter = 'all';
var activeToolFilter = 'all';

/* 
   LOGIN
*/
function pickRole(n) {
  for (var i = 0; i < 3; i++) {
    document.getElementById('role' + i).className = 'roleBtn' + (i === n ? ' sel' : '');
  }
  user.role = n;
}

function fillDemo() {
  document.getElementById('inName').value = 'Bhoomi Gupta';
  document.getElementById('inId').value   = '23FE10CAI00515';
  document.getElementById('inDept').value = 'Artificial Intelligence and Machine Learning';
}

function doLogin() {
  var name = document.getElementById('inName').value.trim();
  var id   = document.getElementById('inId').value.trim();
  var dept = document.getElementById('inDept').value.trim();
  var err  = document.getElementById('errMsg');

  if (!name || !id || !dept) { err.style.display = 'block'; return; }
  err.style.display = 'none';

  user.name = name;
  user.id   = id;
  user.dept = dept;

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display         = 'block';

  // Set topbar user info
  document.getElementById('topAv').textContent   = roleIcons[user.role];
  document.getElementById('topName').textContent = name.split(' ')[0];

  // Set greeting
  var hr  = new Date().getHours();
  var greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dashGreet').textContent = greet + ', ' + name.split(' ')[0] + ' 👋';

  // Set profile info
  document.getElementById('profAv').textContent   = roleIcons[user.role];
  document.getElementById('profName').textContent = name;
  document.getElementById('profSub').textContent  = id + ' · ' + dept + ' · ' + roleLabels[user.role];

  initAll();
}

function doLogout() {
  document.getElementById('app').style.display         = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

/* 
   NAVIGATION */
function showPage(id, btn) {
  // Hide all pages
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');

  // Deactivate all tabs
  var tabs = document.querySelectorAll('.navTab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');

  // Show selected page
  var pageId = 'page' + id.charAt(0).toUpperCase() + id.slice(1);
  document.getElementById(pageId).classList.add('active');

  // Activate selected tab
  if (btn) btn.classList.add('active');

  updateProfile();
}

/* 
   BUDGET PLANNER
*/
var altSavings = { yes: 0.85, partial: 0.40, no: 0 };

var catPills = {
  'Materials / Components':       'pAmber',
  'Software / Licensing':         'pBlue',
  'Travel / Field Work':          'pTeal',
  'Documentation / Printing':     'pRed',
  'Equipment Access':             'pGreen',
  'Publication / Dissemination':  'pRed',
  'Contingency':                  'pAmber',
  'Other':                        'pGray'
};

function addBudget() {
  var cat  = document.getElementById('bCat').value;
  var desc = document.getElementById('bDesc').value.trim();
  var cost = parseFloat(document.getElementById('bCost').value) || 0;
  var alt  = document.getElementById('bAlt').value;

  if (!desc || cost <= 0) {
    alert('Please enter a description and a valid cost amount.');
    return;
  }

  budgetItems.push({ cat: cat, desc: desc, cost: cost, alt: alt });
  document.getElementById('bDesc').value = '';
  document.getElementById('bCost').value = '';
  renderBudget();
}

function removeBudget(i) {
  budgetItems.splice(i, 1);
  renderBudget();
}

function renderBudget() {
  var tbody = document.getElementById('budgetBody');

  if (budgetItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="emptyCell">No items added yet. Add your first expense above.</td></tr>';
    updateTotals(0, 0);
    return;
  }

  var tEst = 0, tOpt = 0, rows = '';

  for (var i = 0; i < budgetItems.length; i++) {
    var it   = budgetItems[i];
    var sav  = it.cost * altSavings[it.alt];
    var opt  = it.cost - sav;
    tEst += it.cost;
    tOpt += opt;

    var altLabel = it.alt === 'yes' ? '✅ Free Alt' : it.alt === 'partial' ? '🟡 Partial' : '❌ Must Pay';
    var altPill  = it.alt === 'yes' ? 'pGreen'     : it.alt === 'partial' ? 'pAmber'    : 'pRed';

    rows += '<tr>'
      + '<td><span class="pill ' + (catPills[it.cat] || 'pGray') + '">' + it.cat + '</span></td>'
      + '<td>' + it.desc + '</td>'
      + '<td style="font-weight:600">₹' + it.cost.toLocaleString() + '</td>'
      + '<td><span class="pill ' + altPill + '">' + altLabel + '</span></td>'
      + '<td style="font-weight:700;color:#059669">₹' + Math.round(opt).toLocaleString() + '</td>'
      + '<td><button class="btn btnDanger btnSm" onclick="removeBudget(' + i + ')">✕</button></td>'
      + '</tr>';
  }

  tbody.innerHTML = rows;
  updateTotals(tEst, tOpt);
}

function updateTotals(est, opt) {
  var sv  = est - opt;
  var pct = est > 0 ? Math.round(sv / est * 100) : 0;

  document.getElementById('totEst').textContent   = '₹' + Math.round(est).toLocaleString();
  document.getElementById('totOpt').textContent   = '₹' + Math.round(opt).toLocaleString();
  document.getElementById('totSave').textContent  = '₹' + Math.round(sv).toLocaleString();
  document.getElementById('savBar').style.width   = pct + '%';
  document.getElementById('savPct').textContent   = pct + '% savings through free alternatives';
  document.getElementById('dBudget').textContent  = '₹' + Math.round(est).toLocaleString();
  document.getElementById('dSavings').textContent = '₹' + Math.round(sv).toLocaleString();

  var adv = document.getElementById('budgetAdvice');
  if (budgetItems.length > 0) {
    var html = '';
    if (est > 15000) {
      html = '<div class="alert aAmber">⚠️ Budget of ₹' + Math.round(est).toLocaleString() + ' is high. Consider applying for AICTE/DST grants or departmental micro-grants.</div>';
    } else if (est > 5000) {
      html = '<div class="alert aInfo">📋 Moderate budget. Try peer collaboration and institutional mini-grants to reduce costs.</div>';
    } else {
      html = '<div class="alert aGreen">✅ Budget is lean and manageable!</div>';
    }
    if (pct >= 60) {
      html += '<div class="alert aGreen">🎉 Great! ' + pct + '% savings — on par with Case Study 1 (65% savings). Recommended final budget with 10% contingency: <b>₹' + Math.round(opt * 1.1).toLocaleString() + '</b></div>';
    }
    adv.innerHTML = html;
  } else {
    adv.innerHTML = '';
  }

  updateProfile();
}

/* 
   FUNDING FINDER
 */
var fundData = [
  { type: 'institutional', icon: '🏫', bg: '#eff6ff', name: 'Departmental Micro-Grant',              org: 'Your University / Department',              range: '₹3,000–₹15,000',      support: 'Cash or Material',     how: 'Submit a short proposal with project title, objectives, budget breakup, and faculty mentor endorsement to your HoD.' },
  { type: 'institutional', icon: '💡', bg: '#fffbeb', name: 'Innovation & Entrepreneurship Cell',     org: 'University I&E / Innovation Centre',        range: '₹5,000–₹25,000',      support: 'Seed Funding',         how: 'Participate in internal hackathons and pitch events. A prototype or MVP concept is preferred.' },
  { type: 'institutional', icon: '📋', bg: '#f0fdf4', name: "Dean's Fund / Research Seed Grant",      org: 'School / Faculty Office',                   range: '₹2,000–₹10,000',      support: 'Cash',                 how: "Apply through your faculty mentor's recommendation. Submit a one-page project summary to the Dean's office." },
  { type: 'institutional', icon: '🔗', bg: '#ecfeff', name: 'Research Centre Collaboration',          org: 'Campus Research Labs',                      range: 'Lab & Equipment Access', support: 'In-kind',            how: 'Approach faculty running active research projects to join as a student collaborator and share lab resources at no cost.' },
  { type: 'government',   icon: '🏛', bg: '#eff6ff', name: 'AICTE Student Innovation Fund',          org: 'All India Council for Technical Education', range: '₹10,000–₹1,00,000',   support: 'Cash / Equipment',     how: 'Apply via AICTE portal (aicte-india.org). Requires faculty endorsement, project report, and official college letter.' },
  { type: 'government',   icon: '🔬', bg: '#f0fdf4', name: 'DST – Student Project Grants',           org: 'Dept. of Science & Technology, GoI',        range: '₹15,000–₹75,000',     support: 'Cash',                 how: 'Submit through DST-INSPIRE or SERB portal with affiliation letter and a structured research proposal.' },
  { type: 'government',   icon: '📚', bg: '#fffbeb', name: 'UGC Minor Research Projects',            org: 'University Grants Commission',              range: '₹10,000–₹50,000',     support: 'Cash',                 how: 'Apply through the UGC portal under the undergraduate research scheme. A faculty co-PI is recommended.' },
  { type: 'government',   icon: '🏅', bg: '#fef2f2', name: 'NIF – IGNITE Awards',                   org: 'National Innovation Foundation',            range: '₹5,000–₹50,000',      support: 'Cash + Mentorship',    how: 'Submit innovative ideas with social or commercial impact to the NIF IGNITE competition at nif.org.in.' },
  { type: 'government',   icon: '🎓', bg: '#ecfeff', name: 'National Scholarship Portal (NSP)',      org: 'Ministry of Education, Govt. of India',     range: '₹5,000–₹50,000',      support: 'Cash',                 how: 'Register at scholarships.gov.in. Multiple project-based aid schemes are available for B.Tech students.' },
  { type: 'ngo',          icon: '🤝', bg: '#f0fdf4', name: 'Infosys Foundation Grants',             org: 'Infosys CSR Wing',                          range: '₹5,000–₹25,000',      support: 'In-kind / Reimburse',  how: 'Submit a project proposal via the Infosys Foundation website. Social-impact projects are preferred.' },
  { type: 'ngo',          icon: '🌍', bg: '#eff6ff', name: 'Rotary Club Student Grants',            org: 'Rotary International / Local Chapter',      range: '₹3,000–₹15,000',      support: 'In-kind',              how: 'Contact your nearest Rotary Club with a social-impact research proposal and a faculty support letter.' },
  { type: 'ngo',          icon: '💚', bg: '#f0fdf4', name: 'CII Foundation – Young Indians',        org: 'Confederation of Indian Industry',          range: '₹5,000–₹30,000',      support: 'Cash / Mentorship',    how: 'Apply through the CII Young Indians (Yi) chapter. Engineering and sustainability projects are preferred.' },
  { type: 'industry',     icon: '🏭', bg: '#fffbeb', name: 'Vendor / Supplier Partnerships',        org: 'Local Hardware & Software Vendors',         range: 'Variable – Donations', support: 'Material / Discounts', how: "Email vendors explaining your project. Mention 'student research project' — many donate components or give educational discounts." },
  { type: 'industry',     icon: '👨‍🎓', bg: '#ecfeff', name: 'Alumni Network Sponsorships',          org: 'University Alumni Association',             range: '₹2,000–₹10,000',      support: 'Cash / Mentorship',    how: 'Reach out via LinkedIn or your Alumni Association portal. Share a clear one-pager with project impact and deliverables.' },
  { type: 'industry',     icon: '💼', bg: '#fef2f2', name: 'Corporate Internship + Project Fund',   org: 'Tech Companies / Startups',                 range: 'Stipend + Materials',  support: 'Cash + Access',        how: 'Apply for research internships on Internshala or LinkedIn. Some companies fund student projects aligned with their R&D goals.' },
  { type: 'competition',  icon: '🇮🇳', bg: '#fffbeb', name: 'Smart India Hackathon (SIH)',           org: 'Ministry of Education, Govt. of India',     range: '₹1,00,000+',           support: 'Prize + Incubation',   how: 'Form a team of 6 students, register on sih.gov.in, and solve problem statements from government departments.' },
  { type: 'competition',  icon: '💻', bg: '#eff6ff', name: 'Hackathons – Devfolio / HackerEarth',   org: 'Various Online Platforms',                  range: '₹5,000–₹1,00,000',    support: 'Prize Money',          how: 'Register on devfolio.co or hackerearth.com. Many hackathons also reimburse project material costs.' },
  { type: 'competition',  icon: '📡', bg: '#ecfeff', name: 'IEEE Student Paper Awards',             org: 'IEEE Student Branches / Conferences',       range: '₹3,000–₹20,000',      support: 'Cash + Publication',   how: 'Submit your research paper to an IEEE conference student track. Many reimburse registration and travel costs.' },
  { type: 'competition',  icon: '🏆', bg: '#f0fdf4', name: 'Toycathon / Yukti Innovation Challenge', org: 'AICTE / Ministry of Education',             range: '₹10,000–₹5,00,000',   support: 'Prize + Support',      how: 'Register on yukti.aicte-india.org. Submit innovative project ideas for evaluation and potential funding.' },
  { type: 'competition',  icon: '🌱', bg: '#fffbeb', name: 'IIT / NIT Techfest Competitions',       org: 'IIT Bombay, IIT Delhi, NIT Trichy etc.',    range: '₹5,000–₹50,000',      support: 'Prize Money',          how: 'Register online for project competitions at major techfests. Many also offer free lab and equipment access.' }
];

function filterFund(type, btn) {
  activeFundFilter = type;
  var btns = document.querySelectorAll('#fundFilters .filterBtn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  renderFunding();
}

function renderFunding() {
  var list     = document.getElementById('fundList');
  var filtered = activeFundFilter === 'all'
    ? fundData
    : fundData.filter(function(f) { return f.type === activeFundFilter; });

  var typePill = { institutional: 'pBlue', government: 'pTeal', ngo: 'pGreen', industry: 'pAmber', competition: 'pRed' };
  var html = '';

  for (var i = 0; i < filtered.length; i++) {
    var f = filtered[i];
    html += '<div class="fundCard">'
      + '<div class="fundHead">'
      + '<div class="fundIcon" style="background:' + f.bg + '">' + f.icon + '</div>'
      + '<div style="flex:1">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">'
      + '<div class="fundName">' + f.name + '</div>'
      + '<span class="pill ' + typePill[f.type] + '">' + f.type + '</span>'
      + '</div>'
      + '<div class="fundOrg">' + f.org + '</div>'
      + '</div></div>'
      + '<div class="fundRow">'
      + '<span>💰 Range: <b>' + f.range + '</b></span>'
      + '<span>📦 Support: <b>' + f.support + '</b></span>'
      + '</div>'
      + '<div class="fundHow"><b>How to apply:</b> ' + f.how + '</div>'
      + '</div>';
  }

  list.innerHTML = html;
}

/* 
   FREE TOOLS
 */
var toolsData = [
  { cat: 'compute',  icon: '🐍', name: 'Python',               replaces: 'MATLAB (₹8,000+)',          desc: 'Full scientific computing, data analysis, AI/ML. Unlimited free libraries via pip.',            save: '90%'  },
  { cat: 'compute',  icon: '📈', name: 'R Language',           replaces: 'SPSS / SAS',                desc: 'Statistical analysis and data visualization. Ideal for surveys and social research.',           save: '85%'  },
  { cat: 'compute',  icon: '🔢', name: 'GNU Octave',           replaces: 'MATLAB',                    desc: 'Open-source MATLAB-compatible environment for numerical computing.',                            save: '90%'  },
  { cat: 'compute',  icon: '☁️', name: 'Google Colab',         replaces: 'Cloud GPU (₹5,000+/mo)',    desc: 'Free GPU/TPU compute for AI/ML. No installation needed. Used in Case Study 2.',               save: '100%' },
  { cat: 'design',   icon: '⚙️', name: 'FreeCAD',              replaces: 'SolidWorks (₹15,000+)',     desc: '3D parametric CAD modeler for mechanical and structural design. Used in Case Study 4.',        save: '90%'  },
  { cat: 'design',   icon: '🔌', name: 'KiCad',                replaces: 'Altium Designer',           desc: 'Professional PCB design and circuit schematic tool — completely free.',                        save: '85%'  },
  { cat: 'design',   icon: '🔩', name: 'CalculiX',             replaces: 'ANSYS (₹12,000+)',          desc: 'FEM simulation and structural analysis. Saved ₹6,000 in Case Study 4.',                       save: '90%'  },
  { cat: 'design',   icon: '🗺', name: 'QGIS',                 replaces: 'ArcGIS (₹10,000+)',         desc: 'Full-featured GIS and spatial analysis for geography-based research.',                         save: '90%'  },
  { cat: 'data',     icon: '📱', name: 'KoBoToolbox',          replaces: 'SurveyCTO / Paid tools',    desc: 'Mobile field data collection. Used in Case Study 3 — 200 households surveyed at ₹0.',        save: '100%' },
  { cat: 'data',     icon: '📂', name: 'Kaggle Datasets',      replaces: 'Paid data subscriptions',   desc: 'Thousands of free datasets for AI/ML, health, finance, social research.',                      save: '100%' },
  { cat: 'data',     icon: '🇮🇳', name: 'data.gov.in',          replaces: 'Proprietary Indian DBs',    desc: 'Open Indian government data across agriculture, health, economy, and education.',              save: '100%' },
  { cat: 'data',     icon: '🌍', name: 'WHO / World Bank Data', replaces: 'Commercial global DBs',    desc: 'Global health, economics, and development data — freely downloadable.',                        save: '100%' },
  { cat: 'ml',       icon: '🤗', name: 'Hugging Face',         replaces: 'Paid AI APIs',              desc: 'Pre-trained NLP/CV models, free datasets, and deployment tools. Used in Case Study 2.',       save: '90%'  },
  { cat: 'ml',       icon: '🧠', name: 'TensorFlow / PyTorch', replaces: 'Proprietary ML frameworks', desc: 'Industry-standard deep learning frameworks — completely free and open-source.',                save: '100%' },
  { cat: 'ml',       icon: '🔬', name: 'Scikit-learn',         replaces: 'MATLAB ML Toolboxes',       desc: 'Classical ML algorithms for classification, regression, and clustering in Python.',             save: '90%'  },
  { cat: 'write',    icon: '📝', name: 'LaTeX / Overleaf',     replaces: 'MS Word + formatting tools', desc: 'Professional research paper typesetting. Overleaf free tier supports collaboration.',          save: '80%'  },
  { cat: 'write',    icon: '📚', name: 'Zotero',               replaces: 'EndNote (₹5,000+)',         desc: 'Free reference manager and citation tool with a browser extension.',                           save: '85%'  },
  { cat: 'write',    icon: '🌐', name: 'arXiv Preprint',       replaces: 'Paid journal fees',         desc: 'Free instant publication for CS, Physics, Maths, and EE research papers.',                    save: '100%' },
  { cat: 'hardware', icon: '🤖', name: 'Arduino / ESP32',      replaces: 'Proprietary MCUs',          desc: 'Low-cost open-source microcontrollers for IoT and embedded projects. Used in Case Study 1.',  save: '70%'  },
  { cat: 'hardware', icon: '🍓', name: 'Raspberry Pi',         replaces: 'Commercial SBCs',           desc: 'Single-board computer for edge AI, computer vision, and advanced prototyping.',               save: '60%'  },
  { cat: 'hardware', icon: '🔭', name: 'OpenFlexure Microscope', replaces: 'Lab microscopes',         desc: '3D-printable laboratory-grade microscope for biology and materials science research.',          save: '80%'  }
];

function filterTools(type, btn) {
  activeToolFilter = type;
  var btns = document.querySelectorAll('#toolFilters .filterBtn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  renderTools();
}

function renderTools() {
  var list     = document.getElementById('toolList');
  var filtered = activeToolFilter === 'all'
    ? toolsData
    : toolsData.filter(function(t) { return t.cat === activeToolFilter; });

  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var t = filtered[i];
    html += '<div class="toolCard">'
      + '<div class="toolIcon">' + t.icon + '</div>'
      + '<div style="flex:1">'
      + '<div class="toolName">' + t.name + '</div>'
      + '<div class="toolDesc">' + t.desc + '</div>'
      + '<div class="toolSave">💰 Saves ~' + t.save + ' vs <span class="toolReplaces">' + t.replaces + '</span></div>'
      + '</div></div>';
  }
  list.innerHTML = html;
}

/* 
   SELF-ASSESSMENT QUIZ
*/
var questions = [
  { q: 'What is your estimated project budget?',                             opts: ['Under ₹3,000', '₹3,000–₹8,000', '₹8,000–₹15,000', 'Over ₹15,000'],                                              sc: [0, 1, 2, 3] },
  { q: 'Do you have access to departmental or institutional funding?',       opts: ['Yes, well-supported', 'Partial support available', 'Aware but not applied', 'No support available'],              sc: [0, 1, 2, 3] },
  { q: 'How many tools in your project need paid licenses?',                 opts: ['None — using free tools only', '1–2 paid tools', '3–4 paid tools', '5 or more paid tools'],                      sc: [0, 1, 2, 3] },
  { q: 'Have you explored government funding (AICTE, DST, UGC)?',           opts: ['Applied and received funds', 'Aware and planning to apply', 'Aware but not yet applied', 'Not aware of schemes'], sc: [0, 1, 2, 3] },
  { q: 'How would you rate your financial planning?',                        opts: ['Detailed budget with contingency', 'Basic budget prepared', 'Rough estimate only', 'No plan yet'],                sc: [0, 1, 2, 3] },
  { q: 'Are you working collaboratively or alone?',                          opts: ['Team of 4+ students', 'Team of 2–3 students', 'Working with 1 partner', 'Working completely alone'],              sc: [0, 1, 2, 3] },
  { q: 'Do you use open-source data sources for your research?',             opts: ['Yes, primarily open-source', 'Mix of free and paid', 'Mostly paid or licensed data', 'Not using external data'], sc: [0, 1, 2, 0] },
  { q: 'Have you considered hackathons or alumni sponsorships?',             opts: ['Yes, actively pursuing', 'Considering it seriously', 'Not yet thought about it', 'Never considered this'],       sc: [0, 1, 2, 3] }
];

function renderQ() {
  var q = questions[currentQ];

  document.getElementById('qNum').textContent    = currentQ + 1;
  document.getElementById('qBar').style.width    = ((currentQ + 1) / questions.length * 100) + '%';
  document.getElementById('qBack').style.display = currentQ > 0 ? 'inline-block' : 'none';
  document.getElementById('qNext').textContent   = currentQ === questions.length - 1 ? 'See My Results 🎯' : 'Next →';

  var opts = '';
  for (var i = 0; i < q.opts.length; i++) {
    opts += '<button class="quizOpt' + (answers[currentQ] === i ? ' sel' : '') + '" onclick="pickOpt(' + i + ')">' + q.opts[i] + '</button>';
  }

  document.getElementById('quizBody').innerHTML =
    '<div class="quizQ">' + (currentQ + 1) + '. ' + q.q + '</div>'
    + '<div class="quizOpts">' + opts + '</div>';
}

function pickOpt(i) {
  answers[currentQ] = i;
  renderQ();
}

function qNext() {
  if (answers[currentQ] === undefined) { alert('Please select an answer to continue.'); return; }
  if (currentQ < questions.length - 1) { currentQ++; renderQ(); }
  else showQuizResult();
}

function qPrev() {
  if (currentQ > 0) { currentQ--; renderQ(); }
}

function showQuizResult() {
  var score = 0;
  for (var i = 0; i < answers.length; i++) score += questions[i].sc[answers[i]];
  var pct = Math.round(score / 24 * 100);

  var lvl, col, adv, recs;

  if (pct <= 30) {
    lvl = 'Low Risk 🟢';  col = '#059669';
    adv  = 'Excellent planning! You are using free tools, aware of funding sources, and thinking collaboratively.';
    recs = ['Apply for a mini-grant to build a financial buffer', 'Document your frugal process — it is publishable!', 'Share your approach with peers as a best practice model'];
  } else if (pct <= 55) {
    lvl = 'Moderate Risk 🟡'; col = '#d97706';
    adv  = 'Some gaps exist. Target the areas where you scored higher to reduce financial stress.';
    recs = ['Apply for at least one funding source this week', 'Replace 1–2 paid tools with free alternatives today', 'Schedule a budget review session with your faculty guide'];
  } else if (pct <= 75) {
    lvl = 'High Risk 🟠'; col = '#dc2626';
    adv  = 'Financial constraints could significantly impact your project quality. Act on multiple fronts now.';
    recs = ['Immediately apply for the departmental micro-grant', 'Switch to Python, FreeCAD, and Google Colab today', 'Form a cross-departmental team to share resources', 'Enter at least one hackathon for potential prize funding'];
  } else {
    lvl = 'Critical Risk 🔴'; col = '#7f1d1d';
    adv  = 'Serious barriers identified. Implement the integrated framework from Section 3 urgently.';
    recs = ['Meet your faculty guide within 48 hours about funding', 'Apply to AICTE and department fund simultaneously', 'Use KoBoToolbox, Python, and Google Colab — all free', 'Explore peer resource sharing with other project teams', 'Adopt lean research design to cut prototype costs'];
  }

  quizDone = true;
  document.getElementById('quizCard').style.display = 'none';

  var recHtml = '';
  for (var i = 0; i < recs.length; i++) {
    recHtml += '<div class="checkItem"><span style="color:' + col + ';font-weight:700">▸</span><span>' + recs[i] + '</span></div>';
  }

  document.getElementById('quizResult').style.display = 'block';
  document.getElementById('quizResult').innerHTML =
    '<div class="card" style="text-align:center;margin-bottom:14px">'
    + '<div style="font-size:1.6rem;font-weight:700;color:' + col + ';margin-bottom:6px">' + lvl + '</div>'
    + '<div style="font-size:0.78rem;color:#6b7280;margin-bottom:12px">Risk Score: ' + score + '/24 (' + pct + '%)</div>'
    + '<div class="progWrap" style="max-width:260px;margin:0 auto 12px"><div class="progBar" style="background:' + col + ';width:' + pct + '%"></div></div>'
    + '<p style="font-size:0.83rem;color:#374151;max-width:440px;margin:0 auto">' + adv + '</p></div>'
    + '<div class="card"><div class="cardTitle">📋 Your Personalised Recommendations</div>'
    + '<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">' + recHtml + '</div></div>'
    + '<button class="btn btnOutline" style="margin-top:12px" onclick="retakeQuiz()">↩ Retake Assessment</button>';

  updateProfile();
}

function retakeQuiz() {
  currentQ = 0;
  answers  = [];
  document.getElementById('quizCard').style.display   = 'block';
  document.getElementById('quizResult').style.display = 'none';
  renderQ();
}

/* 
   CASE STUDIES
*/
var casesData = [
  {
    title: 'Case 1: Low-Cost IoT Agriculture Sensor', domain: 'Electronics Engineering',
    color: '#0891b2', bg: '#ecfeff', icon: '🌱', cost: '₹5,500', orig: '₹15,000', save: '65%',
    strats:   ['Used Arduino IDE and FreeCAD (free open-source tools)', 'Obtained donated sensors via local vendor collaboration', 'Secured ₹4,000 departmental micro-grant', 'Used campus 3D printer and soldering lab'],
    outcomes: ['Functional IoT prototype delivered under budget', 'Presented at inter-college technical fest', 'Research paper published in student conference'],
    tip: 'Effective networking and open-source tools can cut costs by nearly 70% while improving learning.'
  },
  {
    title: 'Case 2: AI Emotion Detection Research', domain: 'Computer Science',
    color: '#2563eb', bg: '#eff6ff', icon: '🤖', cost: '₹0', orig: '₹10,000+', save: '100%',
    strats:   ['Used Kaggle and Hugging Face free datasets', 'Google Colab free GPU — zero cloud cost', 'Collaborative open GitHub repositories', 'arXiv free preprint for publication'],
    outcomes: ['Model accuracy improved from 82.5% to 86.1%', 'Completion time cut from 5 months to 3 months', 'Results published as free preprint on arXiv'],
    tip: 'Free compute and open data can yield results comparable to expensive infrastructure.'
  },
  {
    title: 'Case 3: Public Health Diet Survey', domain: 'Public Health / Social Science',
    color: '#d97706', bg: '#fffbeb', icon: '🏥', cost: '₹0', orig: '₹0 budget', save: '100%',
    strats:   ['KoBoToolbox for free mobile data collection', 'NGO partnership provided field access and volunteers', 'Open-source survey questionnaire templates used', 'Data analysed using R and Excel'],
    outcomes: ['200 households surveyed at absolutely zero cost', 'Won "Best Social Impact Project" award', 'Insights provided to local municipal bodies'],
    tip: 'NGO collaboration and free software enable impactful social research even with a zero budget.'
  },
  {
    title: 'Case 4: Mechanical Knee Support Prototype', domain: 'Mechanical Engineering',
    color: '#dc2626', bg: '#fef2f2', icon: '⚙️', cost: '₹5,700', orig: '₹21,500', save: '70%',
    strats:   ['FreeCAD instead of SolidWorks — saved ₹8,000', 'CalculiX instead of ANSYS — saved ₹6,000', 'University workshop for fabrication — saved ₹4,500', 'On-campus testing facility — saved ₹3,000'],
    outcomes: ['Prototype achieved 85% of industry-grade performance', 'Presented at National Design Challenge 2024', 'Proved frugal engineering is viable'],
    tip: 'Each paid tool has a free equivalent. Replacing just 4 tools saved ₹21,500 in this case.'
  },
  {
    title: 'Case 5: Smart Solar Irrigation System', domain: 'CS + Mechanical + Business Studies',
    color: '#059669', bg: '#f0fdf4', icon: '☀️', cost: '₹8,000', orig: '₹18,000+', save: '55%',
    strats:   ['Combined departmental fund of ₹10,000 raised', 'Vendor partnerships saved ₹5,000 on materials', 'Alumni network contributed ₹3,000 sponsorship', 'Cross-departmental resource and skill sharing'],
    outcomes: ['Won Best Multidisciplinary Innovation Award', 'Joint faculty-student publication achieved', 'Demonstrated collaboration as a cost-reduction model'],
    tip: 'Interdisciplinary collaboration reduces duplication and enables ambitious projects on shared budgets.'
  }
];

function renderCases() {
  var html = '';
  for (var i = 0; i < casesData.length; i++) {
    var c = casesData[i];
    var stratHtml = '', outHtml = '';

    for (var j = 0; j < c.strats.length; j++) {
      stratHtml += '<div class="checkItem"><span style="color:' + c.color + ';font-weight:700">✓</span><span>' + c.strats[j] + '</span></div>';
    }
    for (var j = 0; j < c.outcomes.length; j++) {
      outHtml += '<div class="checkItem"><span style="color:#059669;font-weight:700">★</span><span>' + c.outcomes[j] + '</span></div>';
    }

    html += '<div class="caseCard" id="case' + i + '">'
      + '<div class="caseHead" onclick="toggleCase(' + i + ')">'
      + '<div class="caseEmoji" style="background:' + c.bg + ';color:' + c.color + '">' + c.icon + '</div>'
      + '<div style="flex:1">'
      + '<div class="caseName">' + c.title + '</div>'
      + '<div class="caseMeta">' + c.domain + ' &nbsp;·&nbsp; Final Cost: <b style="color:' + c.color + '">' + c.cost + '</b> &nbsp;·&nbsp; Savings: <b style="color:#059669">' + c.save + '</b></div>'
      + '</div>'
      + '<div class="caseChev" id="chev' + i + '">▼</div>'
      + '</div>'
      + '<div class="caseBody" id="cb' + i + '">'
      + '<div class="twoCol">'
      + '<div><div class="colTitle">Strategies Used</div>' + stratHtml + '</div>'
      + '<div><div class="colTitle">Outcomes Achieved</div>' + outHtml + '</div>'
      + '</div>'
      + '<div style="background:#f9fafb;border-left:3px solid ' + c.color + ';border-radius:6px;padding:10px 12px;font-size:0.78rem;color:#374151">'
      + '<b style="color:' + c.color + '">Key Takeaway:</b> ' + c.tip
      + '</div>'
      + '</div></div>';
  }
  document.getElementById('caseList').innerHTML = html;
}

function toggleCase(i) {
  var cb = document.getElementById('cb'   + i);
  var ch = document.getElementById('chev' + i);
  if (cb.classList.contains('open')) {
    cb.classList.remove('open');
    ch.textContent = '▼';
  } else {
    cb.classList.add('open');
    ch.textContent = '▲';
    casesOpened[i] = true;
    updateProfile();
  }
}

/* 
   STRATEGIES
 */
var stratsData = [
  { icon: '💰', col: '#2563eb', title: 'Financial Planning & Budgeting',       items: ['Create a budget covering Direct, Indirect, and Hidden costs', 'Track every expense on a shared Google Sheet each week', 'Maintain a 10–15% contingency reserve at all times', 'Compare estimated vs. actual spending regularly'] },
  { icon: '🏫', col: '#0891b2', title: 'Institutional Support & Funding',      items: ['Apply for departmental micro-grants (₹3,000–₹15,000)', 'Collaborate with faculty projects to access lab resources free', 'Use the I&E Cell for prototype seed funding opportunities', 'Join IEEE / ACM / CSI for small project funds and competitions'] },
  { icon: '🌐', col: '#059669', title: 'Open-Source & Free Tools Adoption',    items: ['Replace MATLAB with Python or Octave and save ₹8,000+', 'Use FreeCAD and CalculiX instead of SolidWorks and ANSYS', 'Collect field data with KoBoToolbox — completely free', 'Publish your research on arXiv with no submission fee'] },
  { icon: '🤝', col: '#d97706', title: 'Collaboration & Resource Sharing',     items: ['Share lab consumables and testing equipment time with peers', 'Collaborate across departments to pool different skills and tools', 'Create a shared digital repository for all project documentation', 'Engage faculty mentors to connect you with industry partners'] },
  { icon: '📐', col: '#7c3aed', title: 'Lean Research Design',                 items: ['Build prototypes in phases: Paper → CAD → 3D Print → CNC', 'Use Taguchi and DoE methods to reduce total experiment trials', 'Simulate processes digitally before committing to physical builds', 'Use systematic sampling to cut field data collection costs'] },
  { icon: '🏆', col: '#dc2626', title: 'Competitions & External Funding',      items: ['Apply to hackathons — many reimburse project material costs', 'Submit to Smart India Hackathon for prizes of ₹1L and above', 'Reach out to your alumni network for small project sponsorships', 'Partner with NGOs or CSR wings for in-kind material support'] }
];

function renderStrats() {
  var html = '';
  for (var i = 0; i < stratsData.length; i++) {
    var s = stratsData[i];
    var items = '';
    for (var j = 0; j < s.items.length; j++) {
      items += '<div class="checkItem"><span style="color:' + s.col + '">▸</span><span style="color:#374151">' + s.items[j] + '</span></div>';
    }
    html += '<div class="card" style="border-left:3px solid ' + s.col + '">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'
      + '<span style="font-size:1.3rem">' + s.icon + '</span>'
      + '<div class="cardTitle" style="color:' + s.col + '">' + s.title + '</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px">' + items + '</div>'
      + '</div>';
  }
  document.getElementById('stratList').innerHTML = html;
}

/*
   PROFILE ACTIVITY UPDATE
*/
function updateProfile() {
  var bi = budgetItems.length;
  document.getElementById('profBI').textContent     = bi;
  document.getElementById('profBBar').style.width   = Math.min(bi * 10, 100) + '%';
  document.getElementById('profAss').textContent    = quizDone ? 'Complete ✅' : 'Not done';
  document.getElementById('profABar').style.width   = quizDone ? '100%' : '0%';
  var cv = Object.keys(casesOpened).length;
  document.getElementById('profCS').textContent     = cv + ' / 5';
  document.getElementById('profCBar').style.width   = (cv / 5 * 100) + '%';
}

/* 
   INIT — called after successful login
 */
function initAll() {
  renderFunding();
  renderTools();
  renderCases();
  renderStrats();
  renderQ();
}
/* DARK MODE */

function toggleTheme() {
  document.body.classList.toggle('dark');

  const btn = document.querySelector('.themeBtn');

  if (document.body.classList.contains('dark')) {
    btn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    btn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

/* LOAD SAVED THEME */

window.onload = function () {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');

    const btn = document.querySelector('.themeBtn');
    if (btn) btn.textContent = '☀️';
  }
};
