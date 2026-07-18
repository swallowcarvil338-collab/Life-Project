/* ---------- 27. STRUCTURED TARGET GOALS ---------- */
const TARGET_PERIODS = [
  {key:'oneYear', label:'1 Tahun'},
  {key:'threeYear', label:'3 Tahun'},
  {key:'fiveYear', label:'5 Tahun'},
  {key:'tenYear', label:'10 Tahun'},
  {key:'lifeMission', label:'Life Mission'},
];
const TARGET_CATEGORIES = ['Karier','Trading & Investasi','Keuangan','Kesehatan','Skill & Belajar','Personal'];

function renderTargetGoals(){
  document.getElementById('targetGrid').innerHTML = TARGET_PERIODS.map(f=>{
    const goals = state.targetGoals.filter(g=>g.period===f.key);
    const itemsHtml = goals.length===0
      ? `<div class="muted" style="font-size:13px;">Belum ada tujuan. Tekan + untuk menambahkan.</div>`
      : goals.map((g,i)=>`
        <div class="target-goal-item ${g.done?'done':''}">
          <div class="check-square" onclick="toggleTargetGoal('${g.id}')">${g.done?'✓':''}</div>
          <div class="tg-num">${i+1}.</div>
          <div class="tg-body">
            <div class="tg-text">${escapeHtml(g.text)}</div>
            <span class="badge" style="margin-top:4px;display:inline-block;">${escapeHtml(g.category)}</span>
          </div>
          <div class="mission-actions">
            <button class="btn-icon" onclick="openTargetGoalModal('${f.key}','${g.id}')">✎</button>
            <button class="btn-icon" onclick="deleteTargetGoal('${g.id}')">🗑</button>
          </div>
        </div>`).join('');
    return `<div class="card target-card">
      <div class="target-card-head">
        <div class="target-period">${f.label}</div>
        <button class="btn-icon" onclick="openTargetGoalModal('${f.key}')" title="Tambah tujuan">+</button>
      </div>
      ${itemsHtml}
    </div>`;
  }).join('');
}

function toggleTargetGoal(id){
  const g = state.targetGoals.find(x=>x.id===id);
  if(!g) return;
  g.done = !g.done;
  if(g.done){
    g.doneDate = todayStr();
    addXP(20);
    addSkillXP('discipline',10);
  } else {
    g.doneDate = null;
    state.profile.totalXP = Math.max(0, state.profile.totalXP - 20);
  }
  saveAndRenderAll();
}

function deleteTargetGoal(id){
  if(!confirm('Hapus tujuan ini?')) return;
  state.targetGoals = state.targetGoals.filter(g=>g.id!==id);
  saveAndRenderAll();
}

function openTargetGoalModal(period, id){
  const editing = id ? state.targetGoals.find(g=>g.id===id) : null;
  const f = TARGET_PERIODS.find(p=>p.key===period);
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Tujuan · ${f.label}</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Bidang</label>
      <select id="f_tgcategory">${TARGET_CATEGORIES.map(c=>`<option ${editing&&editing.category===c?'selected':''}>${c}</option>`).join('')}</select>
    </div>
    <div class="field"><label>Deskripsi Tujuan</label><textarea id="f_tgtext" style="min-height:90px;">${editing?escapeHtml(editing.text):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveTargetGoal('${period}','${id||''}')">Simpan</button>
    </div>
  `);
}

function saveTargetGoal(period, id){
  const text = document.getElementById('f_tgtext').value.trim();
  if(!text){ showToast('Deskripsi tujuan wajib diisi',''); return; }
  const category = document.getElementById('f_tgcategory').value;
  if(id){
    Object.assign(state.targetGoals.find(g=>g.id===id), {text, category});
  } else {
    state.targetGoals.push({id:uid(), period, category, text, done:false, doneDate:null});
  }
  closeModal(); saveAndRenderAll();
}
