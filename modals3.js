function openBookModal(id, keepCover){
  const editing = id ? state.books.find(b=>b.id===id) : null;
  currentEditingBookId = id || '';
  if(!keepCover){
    tempBookCover = editing ? (editing.cover||null) : null;
  }
  openModal(`
    <div class="modal-head"><h3>${editing?'Edit':'Tambah'} Buku</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="cover-upload-row">
      ${tempBookCover?`<img id="coverPreviewImg" class="cover-upload-preview" src="${tempBookCover}">`:`<div id="coverPreviewImg" class="cover-upload-preview" style="display:flex;align-items:center;justify-content:center;background:var(--section);color:var(--text2);">📕</div>`}
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('bookCoverFileInput').click()">Upload Cover</button>
        ${tempBookCover?`<button class="btn btn-danger btn-sm" onclick="removeBookCover()">Hapus Cover</button>`:''}
      </div>
    </div>
    <div class="field"><label>Judul</label><input id="f_title" value="${editing?escapeHtml(editing.title):''}"></div>
    <div class="form-grid">
      <div class="field"><label>Penulis</label><input id="f_author" value="${editing?escapeHtml(editing.author||''):''}"></div>
      <div class="field"><label>Kategori</label><input id="f_category" value="${editing?escapeHtml(editing.category||''):''}"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Status</label>
        <select id="f_status">${['Wishlist','Proses','Selesai'].map(s=>`<option ${editing&&editing.status===s?'selected':''}>${s}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Format</label>
        <select id="f_format">${['Fisik','Ebook'].map(s=>`<option ${editing&&editing.format===s?'selected':''}>${s}</option>`).join('')}</select>
      </div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Harga (Rp)</label><input id="f_price" type="number" min="0" value="${editing?editing.price||0:0}"></div>
      <div class="field"><label>Jumlah Halaman</label><input id="f_pages" type="number" value="${editing?editing.pages||'':''}"></div>
    </div>
    <div class="field"><label>Tanggal Selesai</label><input id="f_finish" type="date" value="${editing&&editing.finishDate?editing.finishDate:''}"></div>
    <div class="field"><label>Rating (1-5)</label><input id="f_rating" type="number" min="0" max="5" value="${editing?editing.rating||'':''}"></div>
    <div class="field"><label>Insight</label><textarea id="f_insight">${editing?escapeHtml(editing.insight||''):''}</textarea></div>
    <div class="field"><label>Quote Favorit</label><textarea id="f_quote">${editing?escapeHtml(editing.quote||''):''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveBook('${id||''}')">Simpan</button>
    </div>
  `);
}
let tempBookCover = null;
let currentEditingBookId = '';
document.getElementById('bookCoverFileInput').addEventListener('change', function(e){
  const file = e.target.files[0];
  if(!file || !file.type.startsWith('image/')){ e.target.value=''; return; }
  resizeImageFile(file, 500, dataUrl=>{
    tempBookCover = dataUrl;
    openBookModal(currentEditingBookId, true);
  });
  e.target.value = '';
});
function removeBookCover(){ tempBookCover = null; openBookModal(currentEditingBookId, true); }
function resizeImageFile(file, maxDim, callback){
  const reader = new FileReader();
  reader.onload = evt=>{
    const img = new Image();
    img.onload = ()=>{
      let w = img.width, h = img.height;
      const scale = Math.min(1, maxDim/Math.max(w,h));
      w = Math.round(w*scale); h = Math.round(h*scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      callback(canvas.toDataURL('image/jpeg',0.82));
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}
function saveBook(id){
  const title = document.getElementById('f_title').value.trim();
  if(!title){ showToast('Judul buku wajib diisi',''); return; }
  const data = {
    title, cover: tempBookCover,
    author: document.getElementById('f_author').value.trim(),
    category: document.getElementById('f_category').value.trim(),
    status: document.getElementById('f_status').value,
    format: document.getElementById('f_format').value,
    price: parseFloat(document.getElementById('f_price').value)||0,
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
function markBookAsBought(id){
  const b = state.books.find(x=>x.id===id);
  if(!b) return;
  b.status = 'Proses';
  saveAndRenderAll();
  showToast('Buku ditandai sudah dibeli','');
}

/* ---------- 20. TRADE MODAL ---------- */
