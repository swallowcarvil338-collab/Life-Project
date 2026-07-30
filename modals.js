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
let tempMottos = null;
let tempActiveMotto = 0;

function openProfileModal(){
  const p = state.profile;
  if(tempMottos === null){ tempMottos = [...p.mottos]; tempActiveMotto = p.activeMottoIndex; }
  openModal(`
    <div class="modal-head"><h3>Edit Profil</h3><button class="modal-close" onclick="cancelProfileModal()">×</button></div>
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
    <div class="field"><label>Join Date</label><input id="f_joindate" type="date" value="${p.joinDate}"></div>
    <div class="field">
      <label>Motto / Quotes (tandai salah satu sebagai yang aktif ditampilkan)</label>
      ${tempMottos.map((m,i)=>`
        <div class="mission-item" style="padding:10px 12px;margin-bottom:8px;">
          <div class="check-square ${i===tempActiveMotto?'done':''}" onclick="setActiveMottoTemp(${i})">${i===tempActiveMotto?'✓':''}</div>
          <input value="${escapeHtml(m)}" oninput="updateMottoTextTemp(${i}, this.value)" style="flex:1;">
          <button type="button" class="btn-icon" onclick="removeMottoTemp(${i})">🗑</button>
        </div>
      `).join('')}
      <button type="button" class="btn btn-outline btn-sm" onclick="addMottoTemp()">+ Tambah Quote</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="cancelProfileModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveProfile()">Simpan</button>
    </div>
  `);
}
function setActiveMottoTemp(i){ tempActiveMotto = i; openProfileModal(); }
function updateMottoTextTemp(i, val){ tempMottos[i] = val; }
function addMottoTemp(){ tempMottos.push('Quote baru...'); openProfileModal(); }
function removeMottoTemp(i){
  if(tempMottos.length<=1){ showToast('Minimal harus ada 1 quote',''); return; }
  tempMottos.splice(i,1);
  if(tempActiveMotto>=tempMottos.length) tempActiveMotto = tempMottos.length-1;
  openProfileModal();
}
function cancelProfileModal(){ tempMottos = null; closeModal(); }
function saveProfile(){
  state.profile.name = document.getElementById('f_name').value.trim() || 'Rofik';
  state.profile.avatarLetter = (document.getElementById('f_avatar').value.trim() || state.profile.name.charAt(0)).toUpperCase();
  state.profile.title = document.getElementById('f_title').value.trim();
  state.profile.joinDate = document.getElementById('f_joindate').value || state.profile.joinDate;
  const cleaned = tempMottos.map(m=>m.trim()).filter(m=>m);
  state.profile.mottos = cleaned.length ? cleaned : ['Quote'];
  state.profile.activeMottoIndex = Math.min(tempActiveMotto, state.profile.mottos.length-1);
  tempMottos = null;
  closeModal(); saveAndRenderAll();
}

/* ---------- 16. MISSION MODAL ---------- */

/* ---------- 15b. CONTACT MODAL ---------- */
function openContactModal(){
  const c = state.contact;
  openModal(`
    <div class="modal-head"><h3>Edit Kontak</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Nomor WhatsApp (cth: 081234567890)</label><input id="f_wa" value="${escapeHtml(c.whatsapp)}"></div>
    <div class="field"><label>Email</label><input id="f_email" type="email" value="${escapeHtml(c.email)}"></div>
    <div class="field"><label>Username Instagram (tanpa @)</label><input id="f_ig" value="${escapeHtml(c.instagram)}"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveContact()">Simpan</button>
    </div>
  `);
}
function saveContact(){
  state.contact.whatsapp = document.getElementById('f_wa').value.trim();
  state.contact.email = document.getElementById('f_email').value.trim();
  state.contact.instagram = document.getElementById('f_ig').value.trim();
  closeModal(); saveAndRenderAll();
}
