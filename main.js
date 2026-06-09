// ============ 세종대 이수체계도 — 바닐라 JS 앱 ============
const SUPABASE_URL = "https://mtmfyhxqatuixgrfzwpy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWZ5aHhxYXR1aXhncmZ6d3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwOTA2MTYsImV4cCI6MjA5MDY2NjYxNn0.YPKhJMvcJKYkDv5CoiYYnJFwbPVGwVQfRNfZqxzpilU";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUPPORTED_YEARS = [2022, 2023, 2024, 2025, 2026];
const STORAGE_INFO = "studentInfo";
const transcriptKey = (sid) => `transcript:${sid}`;

// ---------- State ----------
const state = {
  studentInfo: null,    // { studentId, admissionYear, year, semester, departmentId, departmentName }
  departments: [],
  courses: [],
  requirement: null,
  transcript: { entries: [], fileName: null, uploadedAt: null },
  activeTab: "curriculum",
};

// ---------- Utils ----------
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, "");
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
};
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toast({ title, description, variant }) {
  const root = $("#toast-container");
  const node = el("div", { class: `toast ${variant === "destructive" ? "destructive" : ""}` },
    el("div", { class: "toast-title" }, title),
    description ? el("div", { class: "toast-desc" }, description) : null
  );
  root.appendChild(node);
  setTimeout(() => node.remove(), 4000);
}

const normalize = (s) =>
  (s || "")
    .replace(/[\s:;,./\\\-_·•~!?'"`(){}\[\]<>|+=*&^%$#@]/g, "")
    .toLowerCase();

const isFailGrade = (g) => {
  const u = (g || "").toUpperCase();
  return u === "F" || u === "FA" || u === "NP";
};

// ---------- Storage ----------
function loadStudentInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_INFO);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveStudentInfo(info) { localStorage.setItem(STORAGE_INFO, JSON.stringify(info)); }
function clearStudentInfo() { localStorage.removeItem(STORAGE_INFO); }

function loadTranscript(sid) {
  try {
    const raw = localStorage.getItem(transcriptKey(sid));
    return raw ? JSON.parse(raw) : { entries: [] };
  } catch { return { entries: [] }; }
}
function saveTranscript(sid, data) { localStorage.setItem(transcriptKey(sid), JSON.stringify(data)); }

// ---------- Transcript helpers ----------
function transcriptByName() {
  const m = new Map();
  for (const e of state.transcript.entries) {
    const key = normalize(e.courseName);
    if (!key) continue;
    const prev = m.get(key);
    if (!prev || (isFailGrade(prev.grade) && !isFailGrade(e.grade))) m.set(key, e);
  }
  return m;
}
let _cache = null;
function getByName() {
  if (!_cache) _cache = transcriptByName();
  return _cache;
}
function invalidateTranscript() { _cache = null; }

const isCompleted = (name) => {
  const e = getByName().get(normalize(name));
  return e && !isFailGrade(e.grade);
};
const gradeOf = (name) => getByName().get(normalize(name))?.grade;
const findByCourse = (name) => getByName().get(normalize(name));

// ---------- Data fetchers ----------
async function fetchDepartments() {
  const { data, error } = await sb.from("departments").select("*");
  if (error) throw error;
  return data;
}
const resolveCurriculumYear = (y) => (y === 2026 ? 2025 : y);

async function fetchCourses(deptId, year) {
  const cy = resolveCurriculumYear(year);
  const { data, error } = await sb.from("courses").select("*")
    .eq("department_id", deptId).eq("admission_year", cy)
    .order("target_year").order("target_semester").order("course_type");
  if (error) throw error;
  return data;
}
async function fetchRequirement(deptId, year) {
  const cy = resolveCurriculumYear(year);
  const { data, error } = await sb.from("department_requirements").select("*")
    .eq("department_id", deptId).eq("admission_year", cy).maybeSingle();
  if (error) throw error;
  return data;
}

// ============ Views ============

function renderApp() {
  const app = $("#app");
  app.innerHTML = "";
  if (!state.studentInfo) {
    app.appendChild(renderStudentForm());
  } else {
    app.appendChild(renderDashboard());
  }
}

// ---------- Student Form ----------
function renderStudentForm() {
  const wrap = el("div", { class: "center-page" });
  const card = el("div", { class: "card card-lg", style: "width:100%;max-width:440px" });

  const header = el("div", { class: "card-header card-center" },
    el("div", { class: "icon-circle" }, "🎓"),
    el("h1", { class: "text-2xl mt-2" }, "세종대학교 이수체계도"),
    el("p", { class: "text-sm text-muted mt-2" }, "학번을 입력하면 입학년도(2022~2026) 이수체계도를 보여드립니다")
  );

  const form = el("form", { class: "card-content", onSubmit: (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const sid = String(fd.get("studentId") || "").trim();
    const admissionYear = Number(fd.get("admissionYear"));
    const departmentId = String(fd.get("departmentId") || "");
    const year = Number(fd.get("year"));
    const semester = Number(fd.get("semester"));
    const dept = state.departments.find((d) => d.id === departmentId);
    if (!sid || !departmentId || !year || !semester || !admissionYear || !dept) return;
    const info = { studentId: sid, admissionYear, year, semester, departmentId, departmentName: dept.name };
    saveStudentInfo(info);
    state.studentInfo = info;
    bootDashboard();
  } });

  const idInput = el("input", { class: "input", name: "studentId", placeholder: "예: 22011234 / 24011234 / 26011234", required: true, maxlength: 20 });
  idInput.addEventListener("input", () => {
    const m = idInput.value.match(/^(\d{2})/);
    if (m) {
      const yr = 2000 + Number(m[1]);
      if (SUPPORTED_YEARS.includes(yr)) ySelect.value = String(yr);
    }
  });

  const ySelect = el("select", { class: "select", name: "admissionYear", required: true },
    el("option", { value: "" }, "입학년도 선택"),
    ...SUPPORTED_YEARS.map((y) => el("option", { value: String(y) }, `${y}학번 이수체계도`))
  );

  const deptSelect = el("select", { class: "select", name: "departmentId", required: true },
    el("option", { value: "" }, state.departments.length ? "학과 선택" : "로딩 중..."),
    ...state.departments.map((d) => el("option", { value: d.id }, d.name))
  );

  const yearSelect = el("select", { class: "select", name: "year", required: true },
    el("option", { value: "" }, "학년"),
    ...[1,2,3,4].map((n) => el("option", { value: String(n) }, `${n}학년`))
  );
  const semSelect = el("select", { class: "select", name: "semester", required: true },
    el("option", { value: "" }, "학기"),
    ...[1,2].map((n) => el("option", { value: String(n) }, `${n}학기`))
  );

  form.append(
    el("div", { class: "form-group" }, el("label", { class: "label" }, "학번"), idInput),
    el("div", { class: "form-group" },
      el("label", { class: "label" }, "입학년도 (이수체계도 기준)"),
      ySelect,
      el("p", { class: "hint" }, "학번 앞 2자리로 자동 인식됩니다. 다르면 직접 선택하세요.")
    ),
    el("div", { class: "form-group" }, el("label", { class: "label" }, "학과"), deptSelect),
    el("div", { class: "row-2" },
      el("div", { class: "form-group" }, el("label", { class: "label" }, "현재 학년"), yearSelect),
      el("div", { class: "form-group" }, el("label", { class: "label" }, "현재 학기"), semSelect)
    ),
    el("button", { class: "btn btn-block mt-2", type: "submit" }, "커리큘럼 조회")
  );

  card.append(header, form);
  wrap.appendChild(card);
  return wrap;
}

// ---------- Dashboard ----------
function renderDashboard() {
  const root = el("div");

  // Header
  const info = state.studentInfo;
  const header = el("header", { class: "header" },
    el("div", { class: "header-inner" },
      el("button", { class: "btn btn-ghost btn-icon", title: "뒤로", onClick: () => {
        clearStudentInfo(); state.studentInfo = null; state.courses = []; renderApp();
      } }, "←"),
      el("div", { class: "row gap-2" },
        el("span", { class: "text-primary", style: "font-size:20px" }, "🎓"),
        el("div", null,
          el("div", { class: "header-title" }, "세종대학교 이수체계도"),
          el("div", { class: "header-sub" },
            `${info.admissionYear}학번 · ${info.departmentName} · ${info.year}학년 ${info.semester}학기 · ${info.studentId}`
          )
        )
      )
    )
  );

  // Tabs
  const tabs = [
    { id: "curriculum", label: "이수체계도" },
    { id: "major", label: "전공필수" },
    { id: "recommend", label: "전공추천" },
    { id: "credits", label: "학점현황" },
  ];
  const tabsList = el("div", { class: "tabs-list", role: "tablist" });
  const panels = el("div");
  for (const t of tabs) {
    const btn = el("button", {
      class: "tab-trigger",
      role: "tab",
      "aria-selected": String(state.activeTab === t.id),
      onClick: () => { state.activeTab = t.id; renderApp(); },
    }, t.label);
    tabsList.appendChild(btn);
  }

  if (state.courses.length === 0) {
    panels.appendChild(el("p", { class: "text-muted text-center", style: "padding:48px" }, "커리큘럼 데이터를 불러오는 중..."));
  } else {
    const view =
      state.activeTab === "curriculum" ? renderCurriculumMap() :
      state.activeTab === "major" ? renderMajorRequired() :
      state.activeTab === "recommend" ? renderMajorRecommendation() :
      renderCreditSummary();
    panels.appendChild(view);
  }

  const main = el("main", { class: "container" }, tabsList, panels);
  root.append(header, main);
  return root;
}

// ---------- Curriculum Map ----------
function renderCurriculumMap() {
  const info = state.studentInfo;
  const wrap = el("div", { class: "stack" });
  wrap.appendChild(el("h2", { class: "text-xl" }, "📋 이수체계도"));

  wrap.appendChild(renderTranscriptUpload());

  if (state.transcript.entries.length === 0) {
    wrap.appendChild(el("p", { class: "text-xs text-muted" }, "기이수 성적 조회 엑셀을 업로드하면 수강 완료한 과목이 자동으로 표시됩니다."));
  }

  const grid = el("div", { class: "stack" });
  for (let y = 1; y <= 4; y++) {
    const row = el("div", { class: "grid-2" });
    for (let s = 1; s <= 2; s++) {
      const current = y === info.year && s === info.semester;
      const past = y < info.year || (y === info.year && s < info.semester);
      const card = el("div", { class: `card ${current ? "ring" : ""}` });
      card.appendChild(el("div", { class: "card-header" },
        el("div", { class: "card-title text-base" },
          `${y}학년 ${s}학기`,
          current ? el("span", { class: "badge badge-primary" }, "현재") : null,
          past ? el("span", { class: "badge badge-secondary" }, "지난학기") : null
        )
      ));
      const semCourses = state.courses.filter((c) => c.target_year === y && c.target_semester === s);
      const content = el("div", { class: "card-content stack-sm" });
      if (semCourses.length === 0) {
        content.appendChild(el("p", { class: "text-sm text-muted" }, "등록된 과목 없음"));
      } else {
        for (const c of semCourses) {
          const done = isCompleted(c.course_name);
          const grade = gradeOf(c.course_name);
          const courseRow = el("div", { class: `course-row ${done ? "done" : ""}` },
            el("span", { class: `checkbox-mark ${done ? "checked" : ""}` }, done ? "✓" : ""),
            el("span", { class: `badge type-${c.course_type}` }, c.course_type),
            el("span", { class: "flex-1 truncate font-medium" }, c.course_name),
            el("span", { class: "text-xs text-muted shrink-0" }, `${c.credits}학점`),
            grade ? el("span", { class: `badge ${(grade === "F" || grade === "FA" || grade === "NP") ? "badge-destructive" : "badge-secondary"}` }, grade) : null
          );
          content.appendChild(courseRow);
        }
      }
      card.appendChild(content);
      row.appendChild(card);
    }
    grid.appendChild(row);
  }
  wrap.appendChild(grid);
  return wrap;
}

// ---------- Transcript Upload ----------
const NAME_KEYS = ["과목명", "교과목명", "과목", "course", "courseName"];
const GRADE_KEYS = ["성적", "등급", "평점", "grade"];
const CREDIT_KEYS = ["학점", "credit", "credits"];
const CODE_KEYS = ["학수번호", "과목코드", "코드", "code"];

function pickField(row, keys) {
  for (const k of Object.keys(row)) {
    const norm = k.replace(/\s+/g, "").toLowerCase();
    if (keys.some((kk) => norm.includes(kk.toLowerCase()))) {
      const v = row[k];
      if (v !== null && v !== undefined && String(v).trim() !== "") return String(v).trim();
    }
  }
  return undefined;
}

function parseWorkbook(wb) {
  const entries = [];
  for (const sn of wb.SheetNames) {
    const sheet = wb.Sheets[sn];
    const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    let headerIdx = -1;
    for (let i = 0; i < Math.min(aoa.length, 20); i++) {
      const r = aoa[i].map((c) => String(c));
      if (r.some((c) => NAME_KEYS.some((k) => c.includes(k)))) { headerIdx = i; break; }
    }
    if (headerIdx === -1) continue;
    const headers = aoa[headerIdx].map((c) => String(c).trim());
    for (let i = headerIdx + 1; i < aoa.length; i++) {
      const r = aoa[i];
      if (!r || r.every((c) => String(c).trim() === "")) continue;
      const obj = {};
      headers.forEach((h, idx) => (obj[h] = r[idx]));
      const courseName = pickField(obj, NAME_KEYS);
      if (!courseName) continue;
      const grade = pickField(obj, GRADE_KEYS);
      const creditsRaw = pickField(obj, CREDIT_KEYS);
      const credits = creditsRaw ? Number(creditsRaw) : undefined;
      entries.push({
        courseName,
        grade: grade ? grade.toUpperCase() : undefined,
        credits: Number.isFinite(credits) ? credits : undefined,
        rawCode: pickField(obj, CODE_KEYS),
      });
    }
  }
  return entries;
}

function renderTranscriptUpload() {
  const card = el("div", { class: "card" });
  card.appendChild(el("div", { class: "card-header" },
    el("div", { class: "card-title text-base" }, "📑 기이수 성적 조회 업로드")
  ));
  const content = el("div", { class: "card-content stack-sm" });
  content.appendChild(el("p", { class: "text-xs text-muted" },
    "세종대학교 포털 > 기이수 성적 조회에서 다운로드한 엑셀(.xlsx/.xls) 파일을 업로드하면 수강한 과목과 성적이 자동으로 표시됩니다."
  ));

  const input = el("input", { type: "file", accept: ".xlsx,.xls,.csv", class: "hidden" });
  const has = state.transcript.entries.length > 0;
  const upBtn = el("button", { class: "btn btn-sm", type: "button", onClick: () => input.click() },
    "📤 ", has ? "다시 업로드" : "엑셀 업로드"
  );
  const clearBtn = el("button", { class: "btn btn-outline btn-sm", type: "button", onClick: () => {
    state.transcript = { entries: [] };
    saveTranscript(state.studentInfo.studentId, state.transcript);
    invalidateTranscript();
    renderApp();
  } }, "🗑️ 지우기");

  input.addEventListener("change", async () => {
    const f = input.files && input.files[0];
    if (!f) return;
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const entries = parseWorkbook(wb);
      if (entries.length === 0) {
        toast({ title: "과목을 찾지 못했습니다", description: "엑셀에 '과목명' 열이 있는지 확인해주세요.", variant: "destructive" });
        return;
      }
      state.transcript = { entries, fileName: f.name, uploadedAt: new Date().toISOString() };
      saveTranscript(state.studentInfo.studentId, state.transcript);
      invalidateTranscript();
      toast({ title: "성적표 업로드 완료", description: `${entries.length}개 과목을 인식했습니다.` });
      renderApp();
    } catch (e) {
      toast({ title: "파일을 읽을 수 없습니다", description: e && e.message ? e.message : "다시 시도해주세요.", variant: "destructive" });
    }
  });

  const buttons = el("div", { class: "row row-wrap gap-2" }, input, upBtn);
  if (has) {
    buttons.appendChild(clearBtn);
    buttons.appendChild(el("span", { class: "text-xs text-muted" },
      `${state.transcript.fileName || ""} · ${state.transcript.entries.length}개 과목`
    ));
  }
  content.appendChild(buttons);
  card.appendChild(content);
  return card;
}

// ---------- Major Required ----------
function renderMajorRequired() {
  const info = state.studentInfo;
  const requiredCourses = state.courses.filter((c) => c.course_type === "전공필수");
  const isPast = (c) => c.target_year < info.year || (c.target_year === info.year && c.target_semester < info.semester);
  const isCurrent = (c) => c.target_year === info.year && c.target_semester === info.semester;

  const completed = requiredCourses.filter((c) => isCompleted(c.course_name));
  const retake = requiredCourses.filter((c) => isFailGrade(gradeOf(c.course_name)));
  const overdue = requiredCourses.filter((c) => isPast(c) && !isCompleted(c.course_name) && !retake.includes(c));
  const currentCourses = requiredCourses.filter((c) => isCurrent(c) && !isCompleted(c.course_name));
  const futureCourses = requiredCourses.filter((c) => !isPast(c) && !isCurrent(c) && !isCompleted(c.course_name));

  const wrap = el("div", { class: "stack" });
  wrap.appendChild(el("h2", { class: "text-xl" }, "📌 전공 필수 과목"));

  // Current
  const cur = el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-base" }, `⏱ 이번 학기 수강 권장 (${currentCourses.length}과목)`)),
    el("div", { class: "card-content" },
      currentCourses.length === 0
        ? el("p", { class: "text-sm text-muted" }, "이번 학기 전공필수 과목이 없습니다.")
        : courseTable(currentCourses, true)
    )
  );
  wrap.appendChild(cur);

  // Retake / Overdue
  if (overdue.length > 0 || retake.length > 0) {
    const cardR = el("div", { class: "card destructive" });
    cardR.appendChild(el("div", { class: "card-header" },
      el("div", { class: "card-title text-base text-destructive" }, `⚠ 미이수 / 재수강 필요 (${overdue.length + retake.length}과목)`)
    ));
    const body = el("div", { class: "card-content stack-sm" });
    for (const c of retake) {
      body.appendChild(el("div", { class: "row-between text-sm" },
        el("span", null, c.course_name, el("span", { class: "text-xs text-destructive", style: "margin-left:8px" }, `(${gradeOf(c.course_name)} - 재수강)`)),
        el("span", { class: "badge badge-destructive" }, `${c.target_year}-${c.target_semester}`)
      ));
    }
    for (const c of overdue) {
      body.appendChild(el("div", { class: "row-between text-sm" },
        el("span", null, c.course_name, el("span", { class: "text-xs text-muted", style: "margin-left:8px" }, "(미이수)")),
        el("span", { class: "badge badge-outline" }, `${c.target_year}-${c.target_semester}`)
      ));
    }
    cardR.appendChild(body);
    wrap.appendChild(cardR);
  }

  // Completed + Future
  const dual = el("div", { class: "grid-2" });
  const compCard = el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-base" }, `✓ 이수 완료 (${completed.length}과목)`))
  );
  const cb = el("div", { class: "card-content stack-sm" });
  if (completed.length === 0) cb.appendChild(el("p", { class: "text-sm text-muted" }, "아직 이수한 전공필수가 없습니다."));
  for (const c of completed) {
    cb.appendChild(el("div", { class: "row-between text-sm" },
      el("span", null, c.course_name),
      el("span", { class: "badge badge-secondary" }, gradeOf(c.course_name) || "P")
    ));
  }
  compCard.appendChild(cb);

  const futCard = el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-base" }, `📅 향후 이수 예정 (${futureCourses.length}과목)`))
  );
  const fb = el("div", { class: "card-content stack-sm" });
  if (futureCourses.length === 0) fb.appendChild(el("p", { class: "text-sm text-muted" }, "없음"));
  for (const c of futureCourses) {
    fb.appendChild(el("div", { class: "row-between text-sm" },
      el("span", null, c.course_name),
      el("span", { class: "badge badge-outline" }, `${c.target_year}-${c.target_semester}`)
    ));
  }
  futCard.appendChild(fb);

  dual.append(compCard, futCard);
  wrap.appendChild(dual);
  return wrap;
}

function courseTable(courses, withDesc = false) {
  const tw = el("div", { class: "table-wrap" });
  const table = el("table", { class: "table" });
  table.appendChild(el("thead", null,
    el("tr", null,
      el("th", null, "과목코드"),
      el("th", null, "과목명"),
      el("th", null, "학점"),
      withDesc ? el("th", null, "설명") : null
    )
  ));
  const tb = el("tbody");
  for (const c of courses) {
    tb.appendChild(el("tr", null,
      el("td", { class: "font-mono" }, c.course_code || ""),
      el("td", { class: "font-medium" }, c.course_name),
      el("td", null, String(c.credits)),
      withDesc ? el("td", { class: "text-muted text-sm" }, c.description || "") : null
    ));
  }
  table.appendChild(tb);
  tw.appendChild(table);
  return tw;
}

// ---------- Major Recommendation ----------
function renderMajorRecommendation() {
  const info = state.studentInfo;
  const hasTranscript = state.transcript.entries.length > 0;
  const majorCourses = state.courses.filter((c) => c.course_type === "전공필수" || c.course_type === "전공선택");
  const notCompleted = majorCourses.filter((c) => !isCompleted(c.course_name));
  const isFuture = (c) => c.target_year > info.year || (c.target_year === info.year && c.target_semester >= info.semester);
  const overdue = notCompleted.filter((c) => !isFuture(c)).sort((a,b) => a.target_year - b.target_year || a.target_semester - b.target_semester);
  const thisSemester = notCompleted.filter((c) => c.target_year === info.year && c.target_semester === info.semester);
  const upcoming = notCompleted.filter((c) => isFuture(c) && !(c.target_year === info.year && c.target_semester === info.semester))
    .sort((a,b) => a.target_year - b.target_year || a.target_semester - b.target_semester);
  const requiredRemaining = notCompleted.filter((c) => c.course_type === "전공필수");
  const remainingCredits = notCompleted.reduce((s,c) => s + c.credits, 0);
  const requiredRemainingCredits = requiredRemaining.reduce((s,c) => s + c.credits, 0);

  const wrap = el("div", { class: "stack" });
  wrap.appendChild(el("h2", { class: "text-xl" }, "🎯 앞으로 들어야 할 전공 수업"));

  if (!hasTranscript) {
    wrap.appendChild(el("div", { class: "card warning" },
      el("div", { class: "card-content text-sm text-muted" },
        "정확한 추천을 위해 ", el("strong", null, "이수체계도 탭"), "에서 기이수 성적 엑셀 파일을 먼저 업로드해주세요."
      )
    ));
  }

  const stat = (title, val, sub, primary) => el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-sm text-muted" }, title)),
    el("div", { class: "card-content" },
      el("p", { class: `text-2xl ${primary ? "text-primary" : ""}` }, String(val), el("span", { class: "text-sm text-muted font-medium" }, " " + sub))
    )
  );
  wrap.appendChild(el("div", { class: "grid-3" },
    stat("남은 전공 과목", notCompleted.length, "과목"),
    stat("남은 전공 학점", remainingCredits, "학점"),
    stat("남은 전공필수", requiredRemaining.length, `과목 / ${requiredRemainingCredits}학점`, true)
  ));

  const recoTable = (list) => {
    const tw = el("div", { class: "table-wrap" });
    const t = el("table", { class: "table" });
    t.appendChild(el("thead", null, el("tr", null,
      el("th", null, "구분"), el("th", null, "과목명"), el("th", null, "코드"), el("th", null, "학점"), el("th", null, "권장학기")
    )));
    const tb = el("tbody");
    for (const c of list) {
      tb.appendChild(el("tr", null,
        el("td", null, el("span", { class: `badge ${c.course_type === "전공필수" ? "badge-primary" : "badge-outline"}` }, c.course_type === "전공필수" ? "필수" : "선택")),
        el("td", { class: "font-medium" }, c.course_name),
        el("td", { class: "font-mono text-muted" }, c.course_code || ""),
        el("td", null, String(c.credits)),
        el("td", null, el("span", { class: "badge badge-secondary" }, `${c.target_year}-${c.target_semester}`))
      ));
    }
    t.appendChild(tb);
    tw.appendChild(t);
    return tw;
  };

  if (overdue.length > 0) {
    wrap.appendChild(el("div", { class: "card destructive" },
      el("div", { class: "card-header" }, el("div", { class: "card-title text-base text-destructive" }, `⚠ 미이수 (지난 학기 권장 과목) — ${overdue.length}과목`)),
      el("div", { class: "card-content" }, recoTable(overdue))
    ));
  }

  wrap.appendChild(el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-base" }, `✨ 이번 학기 추천 (${info.year}-${info.semester}) — ${thisSemester.length}과목`)),
    el("div", { class: "card-content" },
      thisSemester.length === 0 ? el("p", { class: "text-sm text-muted" }, "이번 학기 권장 전공 과목이 없습니다.") : recoTable(thisSemester))
  ));

  wrap.appendChild(el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-base" }, `앞으로 이수할 전공 (${upcoming.length}과목)`)),
    el("div", { class: "card-content" },
      upcoming.length === 0 ? el("p", { class: "text-sm text-muted" }, "남은 전공 과목이 없습니다. 🎉") : recoTable(upcoming))
  ));

  return wrap;
}

// ---------- Credit Summary ----------
function renderCreditSummary() {
  const dept = state.requirement
    ? { ...state.departments.find((d) => d.id === state.studentInfo.departmentId), ...state.requirement }
    : state.departments.find((d) => d.id === state.studentInfo.departmentId);
  if (!dept) return el("div");

  const completedCourses = state.courses.filter((c) => isCompleted(c.course_name));
  const calc = (filter) => completedCourses.filter(filter).reduce((sum, c) => {
    const t = findByCourse(c.course_name);
    return sum + (t && Number.isFinite(t.credits) ? t.credits : c.credits);
  }, 0);

  const curriculumNameSet = new Set(state.courses.map((c) => normalize(c.course_name)));
  const extra = state.transcript.entries.reduce((sum, e) => {
    if (isFailGrade(e.grade)) return sum;
    if (curriculumNameSet.has(normalize(e.courseName))) return sum;
    const c = Number(e.credits);
    return sum + (Number.isFinite(c) ? c : 0);
  }, 0);

  const cats = [
    { label: "전공필수", earned: calc((c) => c.course_type === "전공필수"), required: dept.major_required_credits || 0 },
    { label: "전공선택", earned: calc((c) => c.course_type === "전공선택"), required: dept.major_elective_credits || 0 },
    { label: "교양필수", earned: calc((c) => c.course_type === "교양필수"), required: dept.general_required_credits || 0 },
    { label: "교양선택", earned: calc((c) => c.course_type === "교양선택") + extra, required: dept.general_elective_credits || 0 },
  ];

  const totalEarned = cats.reduce((s,c) => s + c.earned, 0);
  const totalRequired = dept.total_credits_required || 0;
  const totalRemaining = Math.max(0, totalRequired - totalEarned);
  const totalPct = totalRequired > 0 ? Math.min(100, Math.round((totalEarned / totalRequired) * 100)) : 0;

  const wrap = el("div", { class: "stack" });
  wrap.appendChild(el("h2", { class: "text-xl" }, "📊 학점 현황"));

  wrap.appendChild(el("div", { class: "card" },
    el("div", { class: "card-header" }, el("div", { class: "card-title text-base" }, "전체 학점 진행률")),
    el("div", { class: "card-content stack-sm" },
      el("div", { class: "row-between text-sm" },
        el("span", null, "이수 ", el("span", { class: "font-bold text-primary" }, String(totalEarned)), ` / ${totalRequired}학점`),
        el("span", { class: "font-bold text-primary" }, `${totalPct}%`)
      ),
      el("div", { class: "progress h-lg" }, el("div", { class: "progress-bar", style: `width:${totalPct}%` })),
      el("p", { class: "text-sm text-muted" },
        "졸업까지 ", el("span", { class: "font-semibold" }, `${totalRemaining}학점`), " 남았습니다"
      )
    )
  ));

  const grid = el("div", { class: "grid-3" });
  for (const cat of cats) {
    const remaining = Math.max(0, cat.required - cat.earned);
    const pct = cat.required > 0 ? Math.min(100, Math.round((cat.earned / cat.required) * 100)) : 100;
    grid.appendChild(el("div", { class: "card" },
      el("div", { class: "card-content stack-sm", style: "padding-top:16px" },
        el("div", { class: "row-between" }, el("span", { class: "font-medium text-sm" }, cat.label), el("span", { class: "text-xs text-muted" }, `${pct}%`)),
        el("div", { class: "progress h-sm" }, el("div", { class: "progress-bar", style: `width:${pct}%` })),
        el("div", { class: "row-between text-xs text-muted" },
          el("span", null, `이수: ${cat.earned}학점`),
          el("span", null, `필요: ${cat.required}학점`)
        ),
        remaining > 0 ? el("p", { class: "text-xs text-primary font-medium" }, `잔여: ${remaining}학점`) : null
      )
    ));
  }
  wrap.appendChild(grid);
  return wrap;
}

// ============ Boot ============
async function bootDashboard() {
  renderApp();
  const info = state.studentInfo;
  state.transcript = loadTranscript(info.studentId);
  invalidateTranscript();
  try {
    const [courses, requirement] = await Promise.all([
      fetchCourses(info.departmentId, info.admissionYear),
      fetchRequirement(info.departmentId, info.admissionYear),
    ]);
    state.courses = courses || [];
    state.requirement = requirement || null;
    renderApp();
  } catch (e) {
    toast({ title: "데이터를 불러올 수 없습니다", description: e.message, variant: "destructive" });
  }
}

async function boot() {
  renderApp(); // initial (loading)
  try {
    state.departments = await fetchDepartments();
  } catch (e) {
    toast({ title: "학과 목록을 불러올 수 없습니다", description: e.message, variant: "destructive" });
  }
  state.studentInfo = loadStudentInfo();
  if (state.studentInfo) {
    bootDashboard();
  } else {
    renderApp();
  }
}

boot();
