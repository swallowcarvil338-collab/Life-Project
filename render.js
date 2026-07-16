/* ---------- 4. TOAST ---------- */
function showToast(msg, type=''){
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast '+type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, 3200);
}

/* ---------- 5. RENDER: CHARACTER PROFILE ---------- */
function renderProfile(){
  const p = state.profile;
  const avatarEl = document.getElementById('avatarEl');
  avatarEl.innerHTML = p.avatarPhoto ? `<img src="${p.avatarPhoto}" alt="Foto profil">` : escapeHtml(p.avatarLetter || p.name.charAt(0).toUpperCase());
  document.getElementById('charName').textContent = p.name;
  document.getElementById('charTitleTxt').textContent = '"'+p.title+'"';
  document.getElementById('charMotto').textContent = '"'+p.motto+'"';
  const rank = rankForLevel(p.level);
  document.getElementById('charRank').textContent = rank.toUpperCase();
  document.getElementById('levelNum').textContent = p.level;
  const req = xpRequired(p.level);
  document.getElementById('xpText').textContent = `${p.xp} / ${req} XP`;
  document.getElementById('xpBar').style.width = Math.min(100,(p.xp/req)*100)+'%';
  document.getElementById('totalXPVal').textContent = p.totalXP;
  document.getElementById('legacyVal').textContent = Object.keys(state.achievements).length;
  document.getElementById('powerVal').textContent = Math.round(p.totalXP/10 + p.level*5);
  document.getElementById('joinDateVal').textContent = p.joinDate;

  const activeMission = state.missions.find(m=>m.id===p.currentMissionId && !m.done) || state.missions.find(m=>!m.done);
  document.getElementById('currentMissionTxt').textContent = activeMission ? activeMission.title : 'Belum ada misi aktif. Tambahkan quest pertamamu di bawah.';

  renderSkillBars();
  renderRankTrack();
}

function renderSkillBars(){
  const wrap = document.getElementById('skillBars');
  wrap.innerHTML = SKILL_LIST.map(key=>{
    const sk = state.skills[key];
    const req = xpRequired(sk.level);
    const pct = Math.min(100,(sk.xp/req)*100);
    return `<div class="skill-row">
      <div class="skill-row-top"><span class="sname">${SKILL_LABEL[key]}</span><span class="slvl">Lv.${sk.level}</span></div>
      <div class="skill-bar-outer"><div class="skill-bar-inner" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function renderRankTrack(){
  const curIdx = RANKS.indexOf(rankForLevel(state.profile.level));
  document.getElementById('rankTrack').innerHTML = RANKS.map((r,i)=>{
    let cls = '';
    if(i < curIdx) cls = 'done';
    if(i === curIdx) cls = 'active';
    return `<div class="rank-pill ${cls}">${r}</div>`;
  }).join('');
}

/* ---------- 6. RENDER: MISSIONS ---------- */
let activeMissionFilter = 'Semua';

function renderMissionFilters(){
  const cats = ['Semua', ...MISSION_CATEGORIES];
  document.getElementById('missionFilters').innerHTML = cats.map(c=>
    `<button class="chip ${c===activeMissionFilter?'active':''}" onclick="setMissionFilter('${c}')">${c}</button>`
  ).join('');
}
function setMissionFilter(c){ activeMissionFilter = c; renderMissions(); renderMissionFilters(); }

function renderMissions(){
  const list = document.getElementById('missionList');
  let missions = [...state.missions].sort((a,b)=> (a.done - b.done) || (a.deadline||'').localeCompare(b.deadline||''));
  if(activeMissionFilter !== 'Semua') missions = missions.filter(m=>m.category===activeMissionFilter);

  if(missions.length===0){
    list.innerHTML = `<div class="empty-state"><div class="big">🗺️</div><div>Belum ada mission di kategori ini.</div></div>`;
    return;
  }
  list.innerHTML = missions.map(m=>`
    <div class="mission-item ${m.done?'done':''}">
      <div class="check-circle" onclick="toggleMission('${m.id}')">${m.done?'✓':''}</div>
      <div class="mission-body">
        <div class="mission-title">${escapeHtml(m.title)}</div>
        <div class="mission-meta">
          <span class="badge">${m.category}</span>
          ${m.deadline?`<span class="badge">📅 ${m.deadline}</span>`:''}
          <span class="badge badge-xp">+${m.xpReward} XP</span>
        </div>
      </div>
      <div class="mission-actions">
        <button class="btn-icon" onclick="openMissionModal('${m.id}')" title="Edit">✎</button>
        <button class="btn-icon" onclick="deleteMission('${m.id}')" title="Hapus">🗑</button>
      </div>
    </div>
  `).join('');
}

function toggleMission(id){
  const m = state.missions.find(x=>x.id===id);
  if(!m) return;
  m.done = !m.done;
  if(m.done){
    addXP(m.xpReward);
    addSkillXP(CATEGORY_SKILL_MAP[m.category], Math.round(m.xpReward*0.6));
  } else {
    state.profile.totalXP = Math.max(0,state.profile.totalXP - m.xpReward);
  }
  saveAndRenderAll();
}

function deleteMission(id){
  if(!confirm('Hapus mission ini?')) return;
  state.missions = state.missions.filter(m=>m.id!==id);
  saveAndRenderAll();
}

function escapeHtml(str){
  const d = document.createElement('div'); d.textContent = str??''; return d.innerHTML;
}

/* ---------- 7. RENDER: TARGETS ---------- */
const TARGET_FIELDS = [
  {key:'oneYear', label:'1 Tahun'},
  {key:'threeYear', label:'3 Tahun'},
  {key:'fiveYear', label:'5 Tahun'},
  {key:'tenYear', label:'10 Tahun'},
  {key:'lifeMission', label:'Life Mission'},
];
function renderTargets(){
  document.getElementById('targetGrid').innerHTML = TARGET_FIELDS.map(f=>`
    <div class="card target-card">
      <button class="btn-icon edit-btn" onclick="openTargetModal('${f.key}')" title="Edit">✎</button>
      <div class="target-period">${f.label}</div>
      <div class="target-text">${state.targets[f.key] ? escapeHtml(state.targets[f.key]) : '<span class="muted">Belum diisi. Klik ✎ untuk menambahkan target.</span>'}</div>
    </div>
  `).join('');
}

/* ---------- 8. RENDER: PROJECTS ---------- */
function statusClass(status){
  return 'status-'+status.toLowerCase().replace(/\s+/g,'-');
}
function renderProjects(){
  const list = document.getElementById('projectList');
  if(state.projects.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">🛠️</div><div>Belum ada project. Tambahkan project pertamamu.</div></div>`;
    return;
  }
  list.innerHTML = state.projects.map(pr=>`
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="card-title" style="font-size:18px;">${escapeHtml(pr.name)}</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openProjectModal('${pr.id}')">✎</button>
          <button class="btn-icon" onclick="deleteProject('${pr.id}')">🗑</button>
        </div>
      </div>
      <div class="mission-meta" style="margin-bottom:10px;">
        <span class="badge">${escapeHtml(pr.category||'-')}</span>
        <span class="status-tag ${statusClass(pr.status)}">${pr.status}</span>
        ${pr.deadline?`<span class="badge">📅 ${pr.deadline}</span>`:''}
      </div>
      ${pr.notes?`<div class="muted" style="font-size:13px;margin-bottom:10px;">${escapeHtml(pr.notes)}</div>`:''}
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);"><span>Progress</span><span>${pr.percentage}%</span></div>
      <div class="progress-line"><div class="progress-fill" style="width:${pr.percentage}%"></div></div>
    </div>
  `).join('');
}
function deleteProject(id){
  if(!confirm('Hapus project ini?')) return;
  state.projects = state.projects.filter(p=>p.id!==id);
  saveAndRenderAll();
}

/* ---------- 9. RENDER: BOOKS ---------- */
function renderBooks(){
  const list = document.getElementById('bookList');
  if(state.books.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">📖</div><div>Belum ada buku. Tambahkan buku pertamamu.</div></div>`;
    return;
  }
  list.innerHTML = state.books.map(b=>`
    <div class="card book-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="card-title" style="font-size:17px;">${escapeHtml(b.title)}</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openBookModal('${b.id}')">✎</button>
          <button class="btn-icon" onclick="deleteBook('${b.id}')">🗑</button>
        </div>
      </div>
      <div class="muted" style="font-size:13px;">${escapeHtml(b.author||'-')}</div>
      <div class="mission-meta" style="margin:8px 0;">
        <span class="badge">${escapeHtml(b.category||'-')}</span>
        <span class="status-tag ${statusClass(b.status)}">${b.status}</span>
        <span class="badge">${b.format==='Ebook'?'📱 Ebook':'📘 Fisik'}</span>
        ${b.pages?`<span class="badge">${b.pages}p</span>`:''}
      </div>
      ${b.rating?`<div class="rating">${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}</div>`:''}
      ${b.quote?`<div class="muted" style="font-size:12px;font-style:italic;margin-top:6px;">"${escapeHtml(b.quote)}"</div>`:''}
      ${b.insight?`<div style="font-size:12px;margin-top:6px;color:var(--text2);">${escapeHtml(b.insight)}</div>`:''}
    </div>
  `).join('');
}
function deleteBook(id){
  if(!confirm('Hapus buku ini?')) return;
  state.books = state.books.filter(b=>b.id!==id);
  saveAndRenderAll();
}

/* ---------- 10. RENDER: TRADES ---------- */
function renderTrades(){
  const list = document.getElementById('tradeList');
  if(state.trades.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">📈</div><div>Belum ada trade. Tambahkan entri jurnal pertamamu.</div></div>`;
    return;
  }
  const sorted = [...state.trades].sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  list.innerHTML = sorted.map(t=>{
    const net = (parseFloat(t.profit)||0) - (parseFloat(t.loss)||0);
    return `
    <div class="card trade-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div class="card-title" style="font-size:17px;">${escapeHtml(t.pair)}</div>
          <div class="muted" style="font-size:12px;">${t.date||'-'}</div>
        </div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openTradeModal('${t.id}')">✎</button>
          <button class="btn-icon" onclick="deleteTrade('${t.id}')">🗑</button>
        </div>
      </div>
      <div class="mission-meta" style="margin:8px 0;">
        <span class="badge">${t.bias||'-'}</span>
        <span class="badge">Entry ${t.entry??'-'}</span>
        <span class="badge">Exit ${t.exit??'-'}</span>
      </div>
      <div class="rr ${net>=0?'rr-pos':'rr-neg'}">${net>=0?'+':''}${net.toFixed(2)} | RR ${t.rr??'-'}</div>
      ${t.emotion?`<div class="muted" style="font-size:12px;margin-top:6px;">Emosi: ${escapeHtml(t.emotion)}</div>`:''}
      ${t.evaluation?`<div style="font-size:12px;margin-top:6px;color:var(--text2);">${escapeHtml(t.evaluation)}</div>`:''}
    </div>`;
  }).join('');
}
function deleteTrade(id){
  if(!confirm('Hapus trade ini?')) return;
  state.trades = state.trades.filter(t=>t.id!==id);
  saveAndRenderAll();
}

/* ---------- 11. RENDER: ACHIEVEMENTS ---------- */
function renderAchievements(){
  document.getElementById('achievementGrid').innerHTML = ACHIEVEMENT_DEFS.map(def=>{
    const unlocked = !!state.achievements[def.id];
    return `<div class="card ach-card ${unlocked?'unlocked':''}">
      <div class="ach-icon">${def.icon}</div>
      <div class="ach-name">${def.name}</div>
      <div class="ach-desc">${unlocked ? 'Unlocked · '+state.achievements[def.id].date : def.desc}</div>
    </div>`;
  }).join('');
}

/* ---------- 12. RENDER: STATS ---------- */
function renderStats(){
  const s = state;
  const items = [
    {label:'Hari Aktif', val:s.stats.activeDays},
    {label:'Total XP', val:s.profile.totalXP},
    {label:'Jam Belajar', val:s.stats.learningHours},
    {label:'Jam Membaca', val:s.stats.readingHours},
    {label:'Jam Trading', val:s.stats.tradingHours},
    {label:'Jumlah Buku', val:s.books.length},
    {label:'Jumlah Quest', val:s.missions.filter(m=>m.done).length},
    {label:'Jumlah Achievement', val:Object.keys(s.achievements).length},
    {label:'Jumlah Project', val:s.projects.length},
    {label:'Financial Goals', val:s.financeGoals.length},
    {label:'Total Portofolio', val: (typeof fmtIDR==='function'?fmtIDR(s.assetAllocation.reduce((a,x)=>a+(parseFloat(x.value)||0),0)):0)},
    {label:'Rata Skill Lv.', val: Math.round(SKILL_LIST.reduce((a,k)=>a+s.skills[k].level,0)/SKILL_LIST.length)},
    {label:'Character Level', val:s.profile.level},
    {label:'Rank', val:rankForLevel(s.profile.level)},
  ];
  document.getElementById('statsGrid').innerHTML = items.map(i=>`
    <div class="card stat-card"><div class="stat-value">${i.val}</div><div class="stat-label">${i.label}</div></div>
  `).join('');
}

