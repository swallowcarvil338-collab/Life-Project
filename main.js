/* ---------- 21. MASTER RENDER ---------- */
function renderAll(){
  renderProfile();
  renderMissionFilters();
  renderMissions();
  renderMissionStreak();
  renderLearningTimer();
  renderTargetGoals();
  renderProjects();
  renderReadingTracker();
  renderBooks();
  renderTrades();
  renderTradeStats();
  renderTradingPlan();
  renderFinance();
  renderCashflow();
  renderDailyLog();
  renderNotes();
  renderAchievements();
  renderStats();
  renderRecap();
  renderChartTabs();
  drawChart();
}
function saveAndRenderAll(){ saveState(); renderAll(); }

/* ---------- 23. EXPORT / IMPORT / RESET ---------- */
function exportData(){
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `project21-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data berhasil di-export','');
}
document.getElementById('importFile').addEventListener('change', function(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try{
      const parsed = JSON.parse(evt.target.result);
      state = {...defaultState(), ...parsed};
      saveAndRenderAll();
      showToast('Data berhasil di-import','');
    }catch(err){
      showToast('File tidak valid','');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});
function confirmReset(){
  if(confirm('Reset seluruh data PROJECT 21? Tindakan ini tidak dapat dibatalkan. Disarankan export data terlebih dahulu.')){
    if(confirm('Konfirmasi sekali lagi: hapus SEMUA data?')){
      state = defaultState();
      saveAndRenderAll();
      showToast('Data telah direset','');
    }
  }
}

/* ---------- 24. INIT ---------- */
touchActiveDay();
saveAndRenderAll();
