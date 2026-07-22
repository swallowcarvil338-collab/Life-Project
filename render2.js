/* ---------- 8. RENDER: PROJECTS ---------- */
function statusClass(status){
  return 'status-'+status.toLowerCase().replace(/\s+/g,'-');
}
function renderProjects(){
  const list = document.getElementById('projectList');
  if(state.projects.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">🛠️</div><div>Belum ada project. Tambahkan project pertamamu.</div></div>`;
    return;
  }
  list.innerHTML = state.projects.map(pr=>`
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="card-title" style="font-size:18px;">${escapeHtml(pr.name)}</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openProjectModal('${pr.id}')">✎</button>
          <button class="btn-icon" onclick="deleteProject('${pr.id}')">🗑</button>
        </div>
      </div>
      <div class="mission-meta" style="margin-bottom:10px;">
        <span class="badge">${escapeHtml(pr.category||'-')}</span>
        <span class="status-tag ${statusClass(pr.status)}">${pr.status}</span>
        ${pr.deadline?`<span class="badge">📅 ${pr.deadline}</span>`:''}
      </div>
      ${pr.notes?`<div class="muted" style="font-size:13px;margin-bottom:10px;">${escapeHtml(pr.notes)}</div>`:''}
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);"><span>Progress</span><span>${pr.percentage}%</span></div>
      <div class="progress-line"><div class="progress-fill" style="width:${pr.percentage}%"></div></div>
    </div>
  `).join('');
}
function deleteProject(id){
  if(!confirm('Hapus project ini?')) return;
  state.projects = state.projects.filter(p=>p.id!==id);
  saveAndRenderAll();
}

/* ---------- 9. RENDER: BOOKS ---------- */
function renderBooks(){
  const list = document.getElementById('bookList');
  const finishedRow = document.getElementById('finishedBookRow');
  const wishlistList = document.getElementById('wishlistBookList');
  const ongoing = state.books.filter(b=>b.status==='Proses');
  const finished = state.books.filter(b=>b.status==='Selesai');
  const wishlist = state.books.filter(b=>b.status==='Wishlist');

  const bookCardHtml = (b, extra='') => `
    <div class="card book-card">
      ${b.cover?`<img class="book-cover" src="${b.cover}">`:`<div class="book-cover-placeholder">📕</div>`}
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="card-title" style="font-size:17px;">${escapeHtml(b.title)}</div>
        <div class="mission-actions">
          <button class="btn-icon" onclick="openBookModal('${b.id}')">✎</button>
          <button class="btn-icon" onclick="deleteBook('${b.id}')">🗑</button>
        </div>
      </div>
      <div class="muted" style="font-size:13px;">${escapeHtml(b.author||'-')}</div>
      <div class="mission-meta" style="margin:8px 0;">
        <span class="badge">${escapeHtml(b.category||'-')}</span>
        <span class="status-tag ${statusClass(b.status)}">${b.status}</span>
        <span class="badge">${b.format==='Ebook'?'📱 Ebook':'📘 Fisik'}</span>
        ${b.pages?`<span class="badge">${b.pages}p</span>`:''}
        ${b.price?`<span class="badge">${fmtIDR(b.price)}</span>`:''}
      </div>
      ${b.quote?`<div class="muted" style="font-size:12px;font-style:italic;margin-top:6px;">"${escapeHtml(b.quote)}"</div>`:''}
      ${b.insight?`<div style="font-size:12px;margin-top:6px;color:var(--text2);">${escapeHtml(b.insight)}</div>`:''}
      ${extra}
    </div>`;

  list.innerHTML = ongoing.length===0
    ? `<div class="empty-state" style="grid-column:1/-1;"><div class="big">📖</div><div>Belum ada buku yang sedang dibaca.</div></div>`
    : ongoing.map(b=>bookCardHtml(b)).join('');

  finishedRow.innerHTML = finished.length===0
    ? `<div class="muted" style="font-size:13px;">Belum ada buku yang selesai dibaca.</div>`
    : finished.map(b=>`
      <div class="finished-book-card" onclick="openBookModal('${b.id}')">
        ${b.cover?`<img class="book-cover" src="${b.cover}">`:`<div class="book-cover-placeholder">📕</div>`}
        <div class="fb-title">${escapeHtml(b.title)}</div>
        <div class="fb-meta">${b.format==='Ebook'?'📱 Ebook':'📘 Fisik'}${b.rating?' · '+'★'.repeat(b.rating):''}</div>
        ${b.price?`<div class="fb-meta">${fmtIDR(b.price)}</div>`:''}
      </div>
    `).join('');

  const totalSpent = [...ongoing, ...finished].reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  document.getElementById('bookSpendCard').innerHTML = `
    <div style="display:flex;justify-content:space-between;">
      <span class="muted">Total dihabiskan untuk koleksi buku (sedang + sudah dibaca)</span>
      <b style="color:var(--primary);">${fmtIDR(totalSpent)}</b>
    </div>`;

  wishlistList.innerHTML = wishlist.length===0
    ? `<div class="empty-state" style="grid-column:1/-1;"><div class="big">🛒</div><div>Belum ada buku di wishlist. Tambahkan buku yang ingin kamu beli.</div></div>`
    : wishlist.map(b=>bookCardHtml(b, `<button class="btn btn-outline btn-sm" style="margin-top:10px;width:100%;" onclick="markBookAsBought('${b.id}')">✓ Tandai Sudah Dibeli</button>`)).join('');
}
function deleteBook(id){
  if(!confirm('Hapus buku ini?')) return;
  state.books = state.books.filter(b=>b.id!==id);
  saveAndRenderAll();
}

/* ---------- 10. RENDER: TRADES ---------- */
