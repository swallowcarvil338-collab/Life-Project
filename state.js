/* ==========================================================
   PROJECT 21 — LifeOS
   Modules: State, Storage, Engine (XP/Rank/Skill), Render, Events
   ========================================================== */

/* ---------- 1. STATE ---------- */
const STORAGE_KEY = 'project21_state_v1';

const SKILL_LIST = ['learning','reading','finance','trading','health','productivity'];
const SKILL_LABEL = {learning:'Learning',reading:'Reading',finance:'Finance',trading:'Trading',health:'Health',productivity:'Productivity'};
const MISSION_CATEGORIES = ['Learning','Reading','Finance','Trading','Health','Productivity'];
const CATEGORY_SKILL_MAP = {
  'Learning':'learning','Reading':'reading','Finance':'finance','Trading':'trading','Health':'health','Productivity':'productivity'
};
const RANKS = ['Explorer','Adventurer','Scholar','Strategist','Builder','Master','Legend','PROJECT 21'];
const RANK_LEVEL_FLOOR = [1,6,11,21,31,46,61,100];

function defaultState(){
  return {
    profile:{
      name:'Rofik', avatarLetter:'R', avatarPhoto:null, title:'Newcomer of Project 21',
      motto:'Disiplin hari ini adalah kebebasan di masa depan.',
      joinDate: new Date().toISOString().slice(0,10),
      totalXP:0, level:1, xp:0,
      currentMissionId:null
    },
    skills: Object.fromEntries(SKILL_LIST.map(s=>[s,{level:1,xp:0}])),
    missions:[],
    targets:{oneYear:'',threeYear:'',fiveYear:'',tenYear:'',lifeMission:''},
    targetGoals:[], // {id,period,category,text,done,doneDate}
    books:[],
    trades:[],
    projects:[],
    financeGoals:[], // {id,name,category,target,current,deadline,notes}
    assetAllocation:[], // {id,assetName,category,value}
    readingSessions:[], // {id,date,bookId,minutes,pages}
    activeReadingSession:null, // {startTime,bookId}
    activeLearningSession:null, // {startTime}
    dailyLogs:[], // {date,mood,evaluation,gratitude:[string,string,string]}
    notes:[], // {id,title,content,tag,date}
    tradingPlan:'',
    cashflow:[], // {id,date,type:'income'|'expense',category,amount,notes}
    achievements:{}, // id -> {unlocked:true, date}
    stats:{activeDays:0, lastActiveDate:null, learningHours:0, readingHours:0, tradingHours:0, missionCompletions:0},
    history:[] // {date, totalXP}
  };
}

let state = loadState();

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // merge with defaults to survive future field additions
    const def = defaultState();
    const merged = {...def, ...parsed, profile:{...def.profile,...parsed.profile}, skills:{...def.skills,...(parsed.skills||{})}, targets:{...def.targets,...(parsed.targets||{})}, stats:{...def.stats,...(parsed.stats||{})}, financeGoals:parsed.financeGoals||[], assetAllocation:parsed.assetAllocation||[], readingSessions:parsed.readingSessions||[], activeReadingSession:parsed.activeReadingSession||null, activeLearningSession:parsed.activeLearningSession||null};
    // migrate missions: old format used a single boolean `done`; new format resets daily via completedDates
    merged.missions = (merged.missions||[]).map(m=>{
      if(m.completedDates) return m;
      const today = new Date().toISOString().slice(0,10);
      return {...m, completedDates: m.done ? [today] : []};
    });
    merged.targetGoals = merged.targetGoals || [];
    merged.dailyLogs = merged.dailyLogs || [];
    merged.notes = merged.notes || [];
    merged.cashflow = merged.cashflow || [];
    // migrate old book status "Rencana" (unowned plan) to "Wishlist"
    merged.books = (merged.books||[]).map(b=> b.status==='Rencana' ? {...b, status:'Wishlist'} : b);
    // clean skills object down to the current 6-skill list (drops retired skills, keeps progress for kept ones)
    merged.skills = Object.fromEntries(SKILL_LIST.map(k=>[k, merged.skills[k] || {level:1,xp:0}]));
    if(merged.targetGoals.length===0 && merged.targets){
      Object.keys(merged.targets).forEach(period=>{
        if(merged.targets[period] && merged.targets[period].trim()){
          merged.targetGoals.push({id:uid(), period, category:'Umum', text:merged.targets[period].trim(), done:false});
        }
      });
    }
    return merged;
  }catch(e){
    console.warn('Load failed, using defaults', e);
    return defaultState();
  }
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){
    console.warn('Save failed (localStorage unavailable in this environment).', e);
  }
}

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function isMissionDoneToday(m){ return (m.completedDates||[]).includes(todayStr()); }

/* ---------- 2. ENGINE: XP / LEVEL / RANK ---------- */
function xpRequired(level){
  return Math.round(100 * Math.pow(1.5, level-1));
}

function rankForLevel(level){
  let idx = 0;
  for(let i=0;i<RANK_LEVEL_FLOOR.length;i++){
    if(level >= RANK_LEVEL_FLOOR[i]) idx = i;
  }
  return RANKS[idx];
}

function addXP(amount, {silent=false}={}){
  const p = state.profile;
  p.totalXP += amount;
  p.xp += amount;
  let leveledUp = false;
  while(p.xp >= xpRequired(p.level)){
    p.xp -= xpRequired(p.level);
    p.level += 1;
    leveledUp = true;
  }
  touchActiveDay();
  logHistory();
  if(!silent){
    showToast(`+${amount} XP`, 'xp');
    if(leveledUp) showToast(`LEVEL UP! Sekarang Level ${p.level} — ${rankForLevel(p.level)}`, 'levelup');
  }
  checkAchievements();
  return leveledUp;
}

function addSkillXP(skillKey, amount){
  if(!skillKey || !state.skills[skillKey]) return;
  const sk = state.skills[skillKey];
  sk.xp += amount;
  while(sk.xp >= xpRequired(sk.level)){
    sk.xp -= xpRequired(sk.level);
    sk.level += 1;
  }
}

function touchActiveDay(){
  const today = new Date().toISOString().slice(0,10);
  if(state.stats.lastActiveDate !== today){
    state.stats.activeDays += 1;
    state.stats.lastActiveDate = today;
  }
}

function logHistory(){
  const today = new Date().toISOString().slice(0,10);
  const last = state.history[state.history.length-1];
  if(last && last.date === today){
    last.totalXP = state.profile.totalXP;
  } else {
    state.history.push({date:today, totalXP: state.profile.totalXP});
  }
  if(state.history.length > 90) state.history = state.history.slice(-90);
}

/* ---------- 3. ACHIEVEMENTS ---------- */
const ACHIEVEMENT_DEFS = [
  {id:'first_book', name:'First Book', icon:'📖', desc:'Selesaikan buku pertama', test:s=>s.books.filter(b=>b.status==='Selesai').length>=1},
  {id:'books_10', name:'10 Books', icon:'📚', desc:'Selesaikan 10 buku', test:s=>s.books.filter(b=>b.status==='Selesai').length>=10},
  {id:'books_50', name:'50 Books', icon:'🏛️', desc:'Selesaikan 50 buku', test:s=>s.books.filter(b=>b.status==='Selesai').length>=50},
  {id:'books_100', name:'100 Books', icon:'👑', desc:'Selesaikan 100 buku', test:s=>s.books.filter(b=>b.status==='Selesai').length>=100},
  {id:'first_quest', name:'First Quest', icon:'⚔️', desc:'Selesaikan mission pertama', test:s=>s.stats.missionCompletions>=1},
  {id:'level_10', name:'Level 10', icon:'🔥', desc:'Capai level 10', test:s=>s.profile.level>=10},
  {id:'level_25', name:'Level 25', icon:'🌟', desc:'Capai level 25', test:s=>s.profile.level>=25},
  {id:'level_50', name:'Level 50', icon:'💎', desc:'Capai level 50', test:s=>s.profile.level>=50},
  {id:'level_100', name:'Level 100', icon:'🏆', desc:'Capai level 100', test:s=>s.profile.level>=100},
  {id:'streak_30', name:'30 Days Streak', icon:'📅', desc:'30 hari aktif', test:s=>s.stats.activeDays>=30},
  {id:'streak_100', name:'100 Days Streak', icon:'🗓️', desc:'100 hari aktif', test:s=>s.stats.activeDays>=100},
  {id:'streak_365', name:'365 Days Streak', icon:'🎖️', desc:'365 hari aktif', test:s=>s.stats.activeDays>=365},
  {id:'first_project', name:'First Project', icon:'🛠️', desc:'Buat project pertama', test:s=>s.projects.length>=1},
  {id:'first_trade', name:'First Trade', icon:'📈', desc:'Catat trade pertama', test:s=>s.trades.length>=1},
];

function checkAchievements(){
  let newlyUnlocked = [];
  ACHIEVEMENT_DEFS.forEach(def=>{
    const already = state.achievements[def.id];
    if(!already && def.test(state)){
      state.achievements[def.id] = {unlocked:true, date:new Date().toISOString().slice(0,10)};
      newlyUnlocked.push(def);
    }
  });
  newlyUnlocked.forEach(def=> showToast(`Achievement Unlocked: ${def.name}`, 'ach'));
  return newlyUnlocked;
}

