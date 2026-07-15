/* ---------- 25. FINANCE: GOALS + ASSET ALLOCATION ---------- */
const GOAL_CATEGORIES = ['Dana Darurat','Tabungan','Biaya Nikah','Investasi','Lainnya'];
const ASSET_CATEGORIES = ['Saham','Reksadana','Emas','Crypto','Obligasi','Properti','Cash','Lainnya'];
const ASSET_COLORS = {Saham:'#38BDF8',Reksadana:'#60A5FA',Emas:'#FACC15',Crypto:'#EF4444',Obligasi:'#22C55E',Properti:'#A78BFA',Cash:'#94A3B8',Lainnya:'#F472B6'};

function fmtIDR(n){
  return 'Rp' + (Math.round(n)||0).toLocaleString('id-ID');
}

/* ---- Goals render ---- */
function renderGoals(){
  const list = document.getElementById('goalList');
  if(state.financeGoals.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">🎯</div><div>Belum ada target keuangan. Tambahkan goal pertamamu.</div></div>`;
    return;
  }
  list.innerHTML = state.financeGoals.map(g=>{
    const pct = g.target>0 ? Math.min(100,Math.round((g.current/g.target)*100)) : 0;
    return `<div class="card goal-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="card-title" style="font-size:17px;">${escapeHtml(g.name)}</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openGoalModal('${g.id}')">✎</button>
          <button class="btn-icon" onclick="deleteGoal('${g.id}')">🗑</button>
        </div>
      </div>
      <div class="mission-meta">
        <span class="badge">${escapeHtml(g.category)}</span>
        ${g.deadline?`<span class="badge">📅 ${g.deadline}</span>`:''}
      </div>
      <div class="goal-amounts"><span>${fmtIDR(g.current)} <span class="muted">/ ${fmtIDR(g.target)}</span></span><b>${pct}%</b></div>
      <div class="progress-line"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${g.notes?`<div class="muted" style="font-size:12px;margin-top:10px;">${escapeHtml(g.notes)}</div>`:''}
    </div>`;
  }).join('');
}
function deleteGoal(id){
  if(!confirm('Hapus target keuangan ini?')) return;
  state.financeGoals = state.financeGoals.filter(g=>g.id!==id);
  saveAndRenderAll();
}
function openGoalModal(id){
  const editing = id ? state.financeGoals.find(g=>g.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Financial Goal</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Nama Goal</label><input id="f_name" value="${editing?escapeHtml(editing.name):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Kategori</label>
        <select id="f_category">${GOAL_CATEGORIES.map(c=>`<option ${editing&&editing.category===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Deadline</label><input id="f_deadline" type="date" value="${editing&&editing.deadline?editing.deadline:''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Target (Rp)</label><input id="f_target" type="number" min="0" value="${editing?editing.target:0}"></div>
      <div class="field"><label>Terkumpul (Rp)</label><input id="f_current" type="number" min="0" value="${editing?editing.current:0}"></div>
    </div>
    <div class="field"><label>Catatan</label><textarea id="f_notes">${editing?escapeHtml(editing.notes||''):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveGoal('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveGoal(id){
  const name = document.getElementById('f_name').value.trim();
  if(!name){ showToast('Nama goal wajib diisi',''); return; }
  const data = {
    name, category: document.getElementById('f_category').value,
    deadline: document.getElementById('f_deadline').value,
    target: parseFloat(document.getElementById('f_target').value)||0,
    current: parseFloat(document.getElementById('f_current').value)||0,
    notes: document.getElementById('f_notes').value.trim()
  };
  const wasIncomplete = id ? (state.financeGoals.find(g=>g.id===id).current < state.financeGoals.find(g=>g.id===id).target) : true;
  if(id){ Object.assign(state.financeGoals.find(g=>g.id===id), data); }
  else{ state.financeGoals.push({id:uid(),...data}); }
  if(data.target>0 && data.current>=data.target && wasIncomplete){
    addXP(40); addSkillXP('economics',25);
  }
  closeModal(); saveAndRenderAll();
}

/* ---- Asset allocation render ---- */
function renderAllocation(){
  const total = state.assetAllocation.reduce((a,x)=>a+ (parseFloat(x.value)||0), 0);
  const summary = document.getElementById('allocSummaryCard');
  if(state.assetAllocation.length===0){
    summary.innerHTML = `<div class="muted" style="text-align:center;">Belum ada data alokasi aset. Tambahkan aset pertamamu.</div>`;
    document.getElementById('allocList').innerHTML = '';
    return;
  }
  summary.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
      <span class="muted">Total Portofolio</span><b style="color:var(--primary);font-size:18px;">${fmtIDR(total)}</b>
    </div>
    <div style="display:flex;height:14px;border-radius:999px;overflow:hidden;border:1px solid var(--border);">
      ${state.assetAllocation.map(a=>{
        const pct = total>0 ? (a.value/total)*100 : 0;
        return `<div style="width:${pct}%;background:${ASSET_COLORS[a.category]||'#38BDF8'};"></div>`;
      }).join('')}
    </div>`;
  document.getElementById('allocList').innerHTML = state.assetAllocation.map(a=>{
    const pct = total>0 ? Math.round((a.value/total)*100) : 0;
    return `<div class="card" style="margin-bottom:12px;">
      <div class="alloc-row">
        <div class="alloc-swatch" style="background:${ASSET_COLORS[a.category]||'#38BDF8'};"></div>
        <div class="alloc-name"><b>${escapeHtml(a.assetName)}</b> <span class="muted">· ${a.category}</span></div>
        <div class="alloc-bar-outer"><div class="alloc-bar-inner" style="width:${pct}%;background:${ASSET_COLORS[a.category]||'#38BDF8'};"></div></div>
        <div class="alloc-pct">${pct}%</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openAssetModal('${a.id}')">✎</button>
          <button class="btn-icon" onclick="deleteAsset('${a.id}')">🗑</button>
        </div>
      </div>
      <div class="muted" style="font-size:12px;padding-left:24px;">${fmtIDR(a.value)}</div>
    </div>`;
  }).join('');
}
function deleteAsset(id){
  if(!confirm('Hapus aset ini dari portofolio?')) return;
  state.assetAllocation = state.assetAllocation.filter(a=>a.id!==id);
  saveAndRenderAll();
}
function openAssetModal(id){
  const editing = id ? state.assetAllocation.find(a=>a.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Aset Portofolio</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Nama Aset</label><input id="f_assetname" placeholder="cth: BBCA, BTC, Reksadana Pasar Uang" value="${editing?escapeHtml(editing.assetName):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Kategori</label>
        <select id="f_assetcat">${ASSET_CATEGORIES.map(c=>`<option ${editing&&editing.category===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Nilai (Rp)</label><input id="f_assetvalue" type="number" min="0" value="${editing?editing.value:0}"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveAsset('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveAsset(id){
  const assetName = document.getElementById('f_assetname').value.trim();
  if(!assetName){ showToast('Nama aset wajib diisi',''); return; }
  const data = {
    assetName, category: document.getElementById('f_assetcat').value,
    value: parseFloat(document.getElementById('f_assetvalue').value)||0
  };
  if(id){ Object.assign(state.assetAllocation.find(a=>a.id===id), data); }
  else{ state.assetAllocation.push({id:uid(),...data}); addXP(10); addSkillXP('economics',10); }
  closeModal(); saveAndRenderAll();
}

function renderFinance(){
  renderGoals();
  renderAllocation();
}
