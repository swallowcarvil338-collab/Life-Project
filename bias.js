/* ---------- 34. XAUUSD DAILY BIAS (read-only, computed by GitHub Actions) ---------- */
async function renderBiasCard(){
  const card = document.getElementById('biasCard');
  if(!card) return;
  try{
    const res = await fetch('bias.json', {cache:'no-store'});
    if(!res.ok) throw new Error('bias.json not found');
    const data = await res.json();
    if(!data.bias){
      card.innerHTML = `<div class="muted">Data bias belum tersedia. Menunggu update otomatis pertama.</div>`;
      return;
    }
    const colorMap = {Bullish:'var(--success)', Bearish:'var(--danger)', 'No Bias':'var(--text2)'};
    const color = colorMap[data.bias] || 'var(--text)';
    card.innerHTML = `
      <div class="card-title" style="font-size:16px;">XAUUSD Daily Bias</div>
      <div class="muted" style="font-size:13px;margin-bottom:4px;">${escapeHtml(data.label||'')}</div>
      <div style="font-size:26px;font-weight:800;color:${color};margin:6px 0;">${escapeHtml(data.bias)}</div>
      ${data.reason?`<div class="muted" style="font-size:12px;">${escapeHtml(data.reason)}</div>`:''}
    `;
  }catch(e){
    card.innerHTML = `<div class="muted">Data bias belum tersedia.</div>`;
  }
}
