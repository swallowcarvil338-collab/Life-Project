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
    <div class="field"><label>Metode/Strategi</label>
      <input id="f_method" list="methodOptions" placeholder="cth: Price Action, Breakout, Scalping" value="${editing?escapeHtml(editing.method||''):''}">
      <datalist id="methodOptions">
        <option value="Price Action"><option value="Breakout"><option value="Scalping">
        <option value="Swing Trading"><option value="Support Resistance"><option value="Trend Following">
      </datalist>
    </div>
    <div class="form-grid">
      <div class="field"><label>Entry</label><input id="f_entry" type="number" step="any" value="${editing?editing.entry??'':''}"></div>
      <div class="field"><label>Exit</label><input id="f_exit" type="number" step="any" value="${editing?editing.exit??'':''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Pips Untung</label><input id="f_pipsprofit" type="number" step="any" min="0" value="${editing?editing.pipsProfit||0:0}"></div>
      <div class="field"><label>Pips Rugi</label><input id="f_pipsloss" type="number" step="any" min="0" value="${editing?editing.pipsLoss||0:0}"></div>
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
    method: document.getElementById('f_method').value.trim(),
    pipsProfit: document.getElementById('f_pipsprofit').value,
    pipsLoss: document.getElementById('f_pipsloss').value,
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
