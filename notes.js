/* ---------- 29. NOTES / INSIGHT VAULT ---------- */
function renderNotes(){
  const list = document.getElementById('notesList');
  const query = (document.getElementById('notesSearch')?.value || '').toLowerCase();
  let notes = [...state.notes].sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  if(query){
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(query) ||
      (n.content||'').toLowerCase().includes(query) ||
      (n.tag||'').toLowerCase().includes(query)
    );
  }
  if(notes.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">🗒️</div><div>Belum ada catatan. Simpan ide, insight belajar, atau ringkasan konsep di sini.</div></div>`;
    return;
  }
  list.innerHTML = notes.map(n=>`
    <div class="card note-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="card-title" style="font-size:16px;">${escapeHtml(n.title)}</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openNoteModal('${n.id}')">✎</button>
          <button class="btn-icon" onclick="deleteNote('${n.id}')">🗑</button>
        </div>
      </div>
      <div class="mission-meta" style="margin:6px 0 10px;">
        ${n.tag?`<span class="badge">${escapeHtml(n.tag)}</span>`:''}
        <span class="badge">${n.date}</span>
      </div>
      <div class="note-content">${escapeHtml(n.content)}</div>
    </div>
  `).join('');
}
function searchNotes(){ renderNotes(); }

function openNoteModal(id){
  const editing = id ? state.notes.find(n=>n.id===id) : null;
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Catatan</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Judul</label><input id="f_notetitle" value="${editing?escapeHtml(editing.title):''}"></div>
    <div class="field"><label>Tag/Kategori (opsional)</label><input id="f_notetag" placeholder="cth: Trading, Mental Model, Buku" value="${editing?escapeHtml(editing.tag||''):''}"></div>
    <div class="field"><label>Isi Catatan</label><textarea id="f_notecontent" style="min-height:160px;">${editing?escapeHtml(editing.content||''):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveNote('${id||''}')">Simpan</button>
    </div>
  `);
}
function saveNote(id){
  const title = document.getElementById('f_notetitle').value.trim();
  if(!title){ showToast('Judul catatan wajib diisi',''); return; }
  const data = {
    title,
    tag: document.getElementById('f_notetag').value.trim(),
    content: document.getElementById('f_notecontent').value.trim(),
  };
  if(id){
    Object.assign(state.notes.find(n=>n.id===id), data);
  } else {
    state.notes.push({id:uid(), date:todayStr(), ...data});
    addXP(10);
    addSkillXP('learning',10);
  }
  closeModal(); saveAndRenderAll();
}
function deleteNote(id){
  if(!confirm('Hapus catatan ini?')) return;
  state.notes = state.notes.filter(n=>n.id!==id);
  saveAndRenderAll();
}
