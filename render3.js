function renderTrades(){
  const table = document.getElementById('tradeTable');
  if(state.trades.length===0){
    table.innerHTML = `<tbody><tr><td style="white-space:normal;padding:24px;text-align:center;" colspan="11">
      <div class="big" style="font-size:32px;">📈</div>Belum ada trade. Tambahkan entri jurnal pertamamu.
    </td></tr></tbody>`;
    drawTradeEquityChart();
    return;
  }
  const sorted = [...state.trades].reverse().sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  const rows = sorted.map(t=>{
    const net = (parseFloat(t.profit)||0) - (parseFloat(t.loss)||0);
    return `<tr>
      <td>${t.date||'-'}</td>
      <td><b>${escapeHtml(t.pair)}</b></td>
      <td>${t.bias||'-'}</td>
      <td>${t.entry??'-'}</td>
      <td>${t.exit??'-'}</td>
      <td>${t.rr??'-'}</td>
      <td>${escapeHtml(t.method||'-')}</td>
      <td class="${net>=0?'net-pos':'net-neg'}">${net>=0?'+':''}${net.toFixed(2)}</td>
      <td>${escapeHtml(t.emotion||'-')}</td>
      <td style="white-space:normal;min-width:180px;">${escapeHtml(t.evaluation||'-')}</td>
      <td>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openTradeModal('${t.id}')">✎</button>
          <button class="btn-icon" onclick="deleteTrade('${t.id}')">🗑</button>
        </div>
      </td>
    </tr>`;
  }).join('');
  table.innerHTML = `
    <thead><tr>
      <th>Tanggal</th><th>Pair</th><th>Bias</th><th>Entry</th><th>Exit</th><th>RR</th><th>Metode</th><th>Net</th><th>Emosi</th><th>Evaluasi</th><th>Aksi</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  `;
  drawTradeEquityChart();
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
    {label:'Jumlah Quest', val:s.stats.missionCompletions},
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

