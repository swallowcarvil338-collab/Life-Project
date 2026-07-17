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
