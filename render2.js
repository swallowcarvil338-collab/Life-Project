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
  const ongoing = state.books.filter(b=>b.status!=='Selesai');
  const finished = state.books.filter(b=>b.status==='Selesai');

  if(ongoing.length===0){
    list.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="big">📖</div><div>Belum ada buku rencana/proses. Tambahkan buku pertamamu.</div></div>`;
  } else {
    list.innerHTML = ongoing.map(b=>`
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
        </div>
        ${b.quote?`<div class="muted" style="font-size:12px;font-style:italic;margin-top:6px;">"${escapeHtml(b.quote)}"</div>`:''}
        ${b.insight?`<div style="font-size:12px;margin-top:6px;color:var(--text2);">${escapeHtml(b.insight)}</div>`:''}
      </div>
    `).join('');
  }

  if(finished.length===0){
    finishedRow.innerHTML = `<div class="muted" style="font-size:13px;">Belum ada buku yang selesai dibaca.</div>`;
  } else {
    finishedRow.innerHTML = finished.map(b=>`
      <div class="finished-book-card" onclick="openBookModal('${b.id}')">
        ${b.cover?`<img class="book-cover" src="${b.cover}">`:`<div class="book-cover-placeholder">📕</div>`}
        <div class="fb-title">${escapeHtml(b.title)}</div>
        <div class="fb-meta">${b.format==='Ebook'?'📱 Ebook':'📘 Fisik'}${b.rating?' · '+'★'.repeat(b.rating):''}</div>
        ${b.finishDate?`<div class="fb-meta">✓ ${b.finishDate}</div>`:''}
      </div>
    `).join('');
  }
}
function deleteBook(id){
  if(!confirm('Hapus buku ini?')) return;
  state.books = state.books.filter(b=>b.id!==id);
  saveAndRenderAll();
}

/* ---------- 10. RENDER: TRADES ---------- */
