/* ---------- 14. MODAL HELPERS ---------- */
function openModal(html){
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(){
  document.getElementById('modalOverlay').classList.remove('open');
}
document.getElementById('modalOverlay').addEventListener('click', e=>{
  if(e.target.id==='modalOverlay') closeModal();
});

/* ---------- 15. PROFILE MODAL ---------- */
function openProfileModal(){
  const p = state.profile;
  openModal(`
    <div class="modal-head"><h3>Edit Profil</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div style="text-align:center;">
      <div class="avatar" style="width:100px;height:100px;font-size:36px;cursor:default;">${p.avatarPhoto?`<img src="${p.avatarPhoto}">`:escapeHtml(p.avatarLetter)}</div>
      <div class="avatar-upload-row">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('avatarFileInput').click()">Upload Foto</button>
        ${p.avatarPhoto?`<button class="btn btn-danger btn-sm" onclick="removeAvatarPhoto()">Hapus Foto</button>`:''}
      </div>
    </div>
    <div class="field"><label>Nama</label><input id="f_name" value="${escapeHtml(p.name)}"></div>
    <div class="field"><label>Avatar (1 huruf, dipakai jika tanpa foto)</label><input id="f_avatar" maxlength="2" value="${escapeHtml(p.avatarLetter)}"></div>
    <div class="field"><label>Title</label><input id="f_title" value="${escapeHtml(p.title)}"></div>
    <div class="field"><label>Motto</label><textarea id="f_motto">${escapeHtml(p.motto)}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveProfile()">Simpan</button>
    </div>
  `);
}
function saveProfile(){
  state.profile.name = document.getElementById('f_name').value.trim() || 'Rofik';
  state.profile.avatarLetter = (document.getElementById('f_avatar').value.trim() || state.profile.name.charAt(0)).toUpperCase();
  state.profile.title = document.getElementById('f_title').value.trim();
  state.profile.motto = document.getElementById('f_motto').value.trim();
  closeModal(); saveAndRenderAll();
}

/* ---------- 16. MISSION MODAL ---------- */
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
    state.missions.push({id:uid(),title,category,xpReward,deadline,done:false});
  }
  closeModal(); saveAndRenderAll();
}

/* ---------- 17. TARGET MODAL ---------- */
function openTargetModal(key){
  const f = TARGET_FIELDS.find(t=>t.key===key);
  openModal(`
    <div class="modal-head"><h3>Edit Target ${f.label}</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>${f.label}</label><textarea id="f_target" style="min-height:140px;">${escapeHtml(state.targets[key])}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveTarget('${key}')">Simpan</button>
    </div>
  `);
}
function saveTarget(key){
  state.targets[key] = document.getElementById('f_target').value.trim();
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
function openBookModal(id){
  const editing = id ? state.books.find(b=>b.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Buku</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Judul</label><input id="f_title" value="${editing?escapeHtml(editing.title):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Penulis</label><input id="f_author" value="${editing?escapeHtml(editing.author||''):''}"></div>
      <div class="field"><label>Kategori</label><input id="f_category" value="${editing?escapeHtml(editing.category||''):''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Status</label>
        <select id="f_status">${['Rencana','Proses','Selesai'].map(s=>`<option ${editing&&editing.status===s?'selected':''}>${s}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Format</label>
        <select id="f_format">${['Fisik','Ebook'].map(s=>`<option ${editing&&editing.format===s?'selected':''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Tanggal Selesai</label><input id="f_finish" type="date" value="${editing&&editing.finishDate?editing.finishDate:''}"></div>
      <div class="field"><label>Jumlah Halaman</label><input id="f_pages" type="number" value="${editing?editing.pages||'':''}"></div>
    </div>
    <div class="field"><label>Rating (1-5)</label><input id="f_rating" type="number" min="0" max="5" value="${editing?editing.rating||'':''}"></div>
    <div class="field"><label>Insight</label><textarea id="f_insight">${editing?escapeHtml(editing.insight||''):''}</textarea></div>
    <div class="field"><label>Quote Favorit</label><textarea id="f_quote">${editing?escapeHtml(editing.quote||''):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveBook('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveBook(id){
  const title = document.getElementById('f_title').value.trim();
  if(!title){ showToast('Judul buku wajib diisi',''); return; }
  const data = {
    title,
    author: document.getElementById('f_author').value.trim(),
    category: document.getElementById('f_category').value.trim(),
    status: document.getElementById('f_status').value,
    format: document.getElementById('f_format').value,
    finishDate: document.getElementById('f_finish').value,
    pages: parseInt(document.getElementById('f_pages').value)||0,
    rating: parseInt(document.getElementById('f_rating').value)||0,
    insight: document.getElementById('f_insight').value.trim(),
    quote: document.getElementById('f_quote').value.trim()
  };
  const wasIncomplete = id ? state.books.find(b=>b.id===id).status!=='Selesai' : true;
  if(id){
    Object.assign(state.books.find(b=>b.id===id), data);
  } else {
    state.books.push({id:uid(),...data});
  }
  if(data.status==='Selesai' && wasIncomplete){
    addXP(30);
    addSkillXP('reading',20);
    state.stats.readingHours += Math.round((data.pages||0)/40) || 1;
  }
  closeModal(); saveAndRenderAll();
}

/* ---------- 20. TRADE MODAL ---------- */
function openTradeModal(id){
  const editing = id ? state.trades.find(t=>t.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Trade</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="form-grid">
      <div class="field"><label>Tanggal</label><input id="f_date" type="date" value="${editing&&editing.date?editing.date:new Date().toISOString().slice(0,10)}"></div>
      <div class="field"><label>Pair</label><input id="f_pair" value="${editing?escapeHtml(editing.pair||''):''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Bias</label>
        <select id="f_bias"><option ${editing&&editing.bias==='Buy'?'selected':''}>Buy</option><option ${editing&&editing.bias==='Sell'?'selected':''}>Sell</option></select>
      </div>
      <div class="field"><label>RR</label><input id="f_rr" value="${editing?editing.rr||'':''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Entry</label><input id="f_entry" type="number" step="any" value="${editing?editing.entry??'':''}"></div>
      <div class="field"><label>Exit</label><input id="f_exit" type="number" step="any" value="${editing?editing.exit??'':''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Profit</label><input id="f_profit" type="number" step="any" value="${editing?editing.profit||0:0}"></div>
      <div class="field"><label>Loss</label><input id="f_loss" type="number" step="any" value="${editing?editing.loss||0:0}"></div>
    </div>
    <div class="field"><label>Screenshot URL (opsional)</label><input id="f_screenshot" value="${editing?escapeHtml(editing.screenshot||''):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Emosi</label><input id="f_emotion" value="${editing?escapeHtml(editing.emotion||''):''}"></div>
      <div class="field"><label>&nbsp;</label></div>
    </div>
    <div class="field"><label>Evaluasi / Catatan</label><textarea id="f_evaluation">${editing?escapeHtml(editing.evaluation||''):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveTrade('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveTrade(id){
  const pair = document.getElementById('f_pair').value.trim();
  if(!pair){ showToast('Pair wajib diisi',''); return; }
  const data = {
    date: document.getElementById('f_date').value,
    pair, bias: document.getElementById('f_bias').value,
    entry: document.getElementById('f_entry').value,
    exit: document.getElementById('f_exit').value,
    rr: document.getElementById('f_rr').value,
    profit: document.getElementById('f_profit').value,
    loss: document.getElementById('f_loss').value,
    screenshot: document.getElementById('f_screenshot').value.trim(),
    emotion: document.getElementById('f_emotion').value.trim(),
    evaluation: document.getElementById('f_evaluation').value.trim(),
    notes: ''
  };
  const isNew = !id;
  if(id){
    Object.assign(state.trades.find(t=>t.id===id), data);
  } else {
    state.trades.push({id:uid(),...data});
  }
  if(isNew){
    addXP(15);
    addSkillXP('trading',20);
    state.stats.tradingHours += 1;
  }
  closeModal(); saveAndRenderAll();
}

/* ---------- 21. AVATAR PHOTO UPLOAD ---------- */
document.getElementById('avatarFileInput').addEventListener('change', function(e){
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')){ showToast('File harus berupa gambar',''); return; }
  const img = new Image();
  const reader = new FileReader();
  reader.onload = evt=>{ img.onload = ()=> resizeAndSetAvatar(img); img.src = evt.target.result; };
  reader.readAsDataURL(file);
  e.target.value = '';
});
function resizeAndSetAvatar(img){
  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const scale = Math.max(size/img.width, size/img.height);
  const w = img.width*scale, h = img.height*scale;
  ctx.drawImage(img, (size-w)/2, (size-h)/2, w, h);
  state.profile.avatarPhoto = canvas.toDataURL('image/jpeg', 0.82);
  saveState(); renderProfile();
  showToast('Foto profil diperbarui','');
  if(document.getElementById('modalOverlay').classList.contains('open')) openProfileModal();
}
function removeAvatarPhoto(){
  state.profile.avatarPhoto = null;
  saveState(); renderProfile(); openProfileModal();
}
