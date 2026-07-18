function openMissionModal(id){
  const editing = id ? state.missions.find(m=>m.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Mission</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Judul Mission</label><input id="f_title" value="${editing?escapeHtml(editing.title):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Kategori</label>
        <select id="f_category">${MISSION_CATEGORIES.map(c=>`<option ${editing&&editing.category===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>XP Reward</label><input id="f_xp" type="number" min="1" value="${editing?editing.xpReward:10}"></div>
    </div>
    <div class="field"><label>Deadline (opsional)</label><input id="f_deadline" type="date" value="${editing&&editing.deadline?editing.deadline:''}"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveMission('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveMission(id){
  const title = document.getElementById('f_title').value.trim();
  if(!title){ showToast('Judul mission wajib diisi',''); return; }
  const category = document.getElementById('f_category').value;
  const xpReward = parseInt(document.getElementById('f_xp').value)||10;
  const deadline = document.getElementById('f_deadline').value;
  if(id){
    const m = state.missions.find(x=>x.id===id);
    Object.assign(m,{title,category,xpReward,deadline});
  } else {
    state.missions.push({id:uid(),title,category,xpReward,deadline,completedDates:[]});
  }
  closeModal(); saveAndRenderAll();
}

/* ---------- 18. PROJECT MODAL ---------- */
function openProjectModal(id){
  const editing = id ? state.projects.find(p=>p.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Project</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Nama Project</label><input id="f_name" value="${editing?escapeHtml(editing.name):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Kategori</label><input id="f_category" value="${editing?escapeHtml(editing.category||''):''}"></div>
      <div class="field"><label>Status</label>
        <select id="f_status">${['Rencana','Berjalan','Selesai'].map(s=>`<option ${editing&&editing.status===s?'selected':''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Deadline</label><input id="f_deadline" type="date" value="${editing&&editing.deadline?editing.deadline:''}"></div>
      <div class="field"><label>Progress (%)</label><input id="f_percentage" type="number" min="0" max="100" value="${editing?editing.percentage:0}"></div>
    </div>
    <div class="field"><label>Catatan</label><textarea id="f_notes">${editing?escapeHtml(editing.notes||''):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveProject('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveProject(id){
  const name = document.getElementById('f_name').value.trim();
  if(!name){ showToast('Nama project wajib diisi',''); return; }
  const data = {
    name,
    category: document.getElementById('f_category').value.trim(),
    status: document.getElementById('f_status').value,
    deadline: document.getElementById('f_deadline').value,
    percentage: Math.max(0,Math.min(100, parseInt(document.getElementById('f_percentage').value)||0)),
    notes: document.getElementById('f_notes').value.trim()
  };
  const wasIncomplete = id ? state.projects.find(p=>p.id===id).status!=='Selesai' : true;
  if(id){
    Object.assign(state.projects.find(p=>p.id===id), data);
  } else {
    state.projects.push({id:uid(),...data});
  }
  if(data.status==='Selesai' && wasIncomplete) addXP(50);
  closeModal(); saveAndRenderAll();
}

/* ---------- 19. BOOK MODAL ---------- */
