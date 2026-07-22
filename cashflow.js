/* ---------- 32. PEMASUKAN & PENGELUARAN HARIAN ---------- */
const INCOME_CATEGORIES = ['Gaji','Freelance','Bonus','Lainnya'];
const EXPENSE_CATEGORIES = ['Makan','Transport','Belanja','Tagihan','Hiburan','Lainnya'];

function renderCashflow(){
  const today = todayStr();
  const todayEntries = state.cashflow.filter(c=>c.date===today);
  const todayIncome = todayEntries.filter(c=>c.type==='income').reduce((a,c)=>a+(parseFloat(c.amount)||0),0);
  const todayExpense = todayEntries.filter(c=>c.type==='expense').reduce((a,c)=>a+(parseFloat(c.amount)||0),0);

  document.getElementById('cashflowSummaryCard').innerHTML = `
    <div class="grid grid-3">
      <div class="stat-card"><div class="stat-value" style="color:var(--success);font-size:18px;">${fmtIDR(todayIncome)}</div><div class="stat-label">Pemasukan Hari Ini</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--danger);font-size:18px;">${fmtIDR(todayExpense)}</div><div class="stat-label">Pengeluaran Hari Ini</div></div>
      <div class="stat-card"><div class="stat-value" style="font-size:18px;">${fmtIDR(todayIncome-todayExpense)}</div><div class="stat-label">Selisih Hari Ini</div></div>
    </div>`;

  const list = document.getElementById('cashflowList');
  const sorted = [...state.cashflow].reverse().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  if(sorted.length===0){
    list.innerHTML = `<div class="empty-state"><div class="big">💵</div><div>Belum ada catatan pemasukan/pengeluaran.</div></div>`;
    return;
  }
  list.innerHTML = sorted.slice(0,30).map(c=>`
    <div class="mission-item">
      <div class="mission-body">
        <div class="mission-title">${escapeHtml(c.category)} ${c.notes?`· <span class="muted" style="font-weight:400;">${escapeHtml(c.notes)}</span>`:''}</div>
        <div class="mission-meta"><span class="badge">${c.date}</span></div>
      </div>
      <div class="${c.type==='income'?'net-pos':'net-neg'}" style="font-weight:700;white-space:nowrap;">
        ${c.type==='income'?'+':'-'}${fmtIDR(c.amount)}
      </div>
      <div class="mission-actions">
        <button class="btn-icon" onclick="deleteCashflow('${c.id}')">🗑</button>
      </div>
    </div>
  `).join('');
}

function openCashflowModal(){
  openModal(`
    <div class="modal-head"><h3>Tambah Pemasukan/Pengeluaran</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <div class="field"><label>Jenis</label>
      <select id="f_cftype" onchange="updateCashflowCategoryOptions()">
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
      </select>
    </div>
    <div class="form-grid">
      <div class="field"><label>Tanggal</label><input id="f_cfdate" type="date" value="${todayStr()}"></div>
      <div class="field"><label>Jumlah (Rp)</label><input id="f_cfamount" type="number" min="0" value="0"></div>
    </div>
    <div class="field"><label>Kategori</label><select id="f_cfcategory"></select></div>
    <div class="field"><label>Catatan (opsional)</label><input id="f_cfnotes"></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary" onclick="saveCashflow()">Simpan</button>
    </div>
  `);
  updateCashflowCategoryOptions();
}
function updateCashflowCategoryOptions(){
  const type = document.getElementById('f_cftype').value;
  const cats = type==='income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  document.getElementById('f_cfcategory').innerHTML = cats.map(c=>`<option>${c}</option>`).join('');
}
function saveCashflow(){
  const amount = parseFloat(document.getElementById('f_cfamount').value)||0;
  if(amount<=0){ showToast('Jumlah harus lebih dari 0',''); return; }
  state.cashflow.push({
    id:uid(),
    type: document.getElementById('f_cftype').value,
    date: document.getElementById('f_cfdate').value || todayStr(),
    category: document.getElementById('f_cfcategory').value,
    amount,
    notes: document.getElementById('f_cfnotes').value.trim()
  });
  closeModal(); saveAndRenderAll();
}
function deleteCashflow(id){
  if(!confirm('Hapus catatan ini?')) return;
  state.cashflow = state.cashflow.filter(c=>c.id!==id);
  saveAndRenderAll();
}
