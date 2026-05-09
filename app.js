// Atomic Habits 2026 — Full Year Tracker

// Theme toggle
function getTheme(){return localStorage.getItem('ah_theme')||'dark';}
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  const icon=document.getElementById('theme-icon');
  if(icon){icon.className=t==='dark'?'ti ti-moon':'ti ti-sun';}
}
function toggleTheme(){
  const t=getTheme()==='dark'?'light':'dark';
  localStorage.setItem('ah_theme',t);
  applyTheme(t);
}
// Apply saved theme immediately
(function(){applyTheme(getTheme());})();

const BLOCKS=['wake','code','read','meal2','aiml','lunch','prework','workout','postwork','dinner','wind'];
const MEALS=[{id:'m1',cal:450},{id:'m2',cal:550},{id:'m3',cal:650},{id:'m4',cal:300},{id:'m5',cal:450},{id:'m6',cal:550},{id:'m7',cal:250}];
const HABITS=[
  {id:'wake',name:'Wake up by 8–9 AM',law:'Law 1 · Make it obvious'},
  {id:'code',name:'Coding / LeetCode / Python',law:'Law 3 · 2-min rule'},
  {id:'read',name:'Read daily',law:'Law 3 · 2-min rule'},
  {id:'aiml',name:'AIML study',law:'Law 2 · Make it attractive'},
  {id:'workout',name:'Workout at 6 PM',law:'Law 4 · Make it satisfying'}
];
let currentDate=new Date();currentDate.setHours(0,0,0,0);

function dateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function loadDay(d){try{return JSON.parse(localStorage.getItem('ah_'+dateKey(d)))||{};}catch(e){return {};}}
function saveDay(d,data){try{localStorage.setItem('ah_'+dateKey(d),JSON.stringify(data));}catch(e){}}
function getDayData(d){const raw=loadDay(d);if(!raw.blocks)raw.blocks={};if(!raw.meals)raw.meals={};return raw;}

function setDate(d){
  currentDate=new Date(d);currentDate.setHours(0,0,0,0);
  renderAll();
}
function prevDay(){const d=new Date(currentDate);d.setDate(d.getDate()-1);if(d.getFullYear()>=2026)setDate(d);}
function nextDay(){const d=new Date(currentDate);d.setDate(d.getDate()+1);if(d.getFullYear()<=2026)setDate(d);}
function goToday(){setDate(new Date());}

function toggleBlock(id){
  const data=getDayData(currentDate);
  data.blocks[id]=!data.blocks[id];
  saveDay(currentDate,data);
  renderToday();
}
function toggleMeal(id){
  const data=getDayData(currentDate);
  data.meals[id]=!data.meals[id];
  saveDay(currentDate,data);
  renderMeals();
}
function toggleWeekDot(hid,dayOffset){
  const monday=getMonday(currentDate);
  const target=new Date(monday);target.setDate(target.getDate()+dayOffset);
  if(target.getFullYear()!==2026)return;
  const data=getDayData(target);
  if(!data.blocks)data.blocks={};
  data.blocks[hid]=!data.blocks[hid];
  saveDay(target,data);
  renderHabits();
}
function getMonday(d){const day=d.getDay(),diff=d.getDate()-day+(day===0?-6:1);return new Date(new Date(d).setDate(diff));}

function renderToday(){
  const data=getDayData(currentDate);
  const opts={weekday:'long',month:'long',day:'numeric',year:'numeric'};
  document.getElementById('today-date').textContent=currentDate.toLocaleDateString('en-IN',opts);
  const isToday=dateKey(currentDate)===dateKey(new Date());
  document.getElementById('today-badge').textContent=isToday?'Today':'';
  document.getElementById('date-input').value=dateKey(currentDate);
  BLOCKS.forEach(b=>{
    const el=document.getElementById('chk-'+b);
    if(el){if(data.blocks[b])el.classList.add('done');else el.classList.remove('done');}
  });
  const done=BLOCKS.filter(b=>data.blocks[b]).length;
  document.getElementById('prog-text').textContent=done+' / '+BLOCKS.length+' done';
  document.getElementById('prog-bar').style.width=Math.round(done/BLOCKS.length*100)+'%';
  // streak
  let streak=0;const check=new Date(currentDate);
  while(true){
    check.setDate(check.getDate()-1);
    if(check.getFullYear()<2026)break;
    const dd=getDayData(check);
    const cnt=BLOCKS.filter(b=>dd.blocks[b]).length;
    if(cnt>=5)streak++;else break;
  }
  if(BLOCKS.filter(b=>data.blocks[b]).length>=5)streak++;
  document.getElementById('streak-label').innerHTML='<i class="ti ti-flame"></i> '+streak+' day streak';
}

function renderMeals(){
  const data=getDayData(currentDate);
  let calEaten=0;
  MEALS.forEach(m=>{
    const el=document.getElementById('mchk-'+m.id);
    if(el){if(data.meals[m.id]){el.classList.add('done');calEaten+=m.cal;}else el.classList.remove('done');}
  });
  const done=MEALS.filter(m=>data.meals[m.id]).length;
  document.getElementById('meal-prog-text').textContent=done+' / '+MEALS.length;
  document.getElementById('meal-prog-bar').style.width=Math.round(done/MEALS.length*100)+'%';
  document.getElementById('cal-eaten').textContent=calEaten.toLocaleString()+' / 3,200 cal';
}

function renderHabits(){
  const monday=getMonday(currentDate);
  const list=document.getElementById('habit-list');list.innerHTML='';
  let totalDone=0,totalPossible=HABITS.length*7;
  HABITS.forEach(h=>{
    const row=document.createElement('div');row.className='habit-row';
    let dots='';
    for(let i=0;i<7;i++){
      const day=new Date(monday);day.setDate(day.getDate()+i);
      const dd=getDayData(day);
      const done=dd.blocks&&dd.blocks[h.id];
      if(done)totalDone++;
      const cls=done?'dot done':'dot';
      const inYear=day.getFullYear()===2026;
      dots+=`<div class="${cls}" onclick="${inYear?`toggleWeekDot('${h.id}',${i})`:'void(0)'}" title="${day.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})}"></div>`;
    }
    row.innerHTML=`<div class="habit-info"><div class="habit-name">${h.name}</div><div class="habit-law">${h.law}</div></div><div class="habit-dots">${dots}</div>`;
    list.appendChild(row);
  });
  document.getElementById('week-text').textContent=totalDone+' / '+totalPossible+' completed';
  document.getElementById('week-bar').style.width=Math.round(totalDone/totalPossible*100)+'%';
  const wStart=monday.toLocaleDateString('en-IN',{month:'short',day:'numeric'});
  const wEnd=new Date(monday);wEnd.setDate(wEnd.getDate()+6);
  document.getElementById('week-range').textContent=wStart+' – '+wEnd.toLocaleDateString('en-IN',{month:'short',day:'numeric'});
}

function renderYear(){
  const grid=document.getElementById('year-grid');if(!grid)return;grid.innerHTML='';
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let html='<div class="year-months">';months.forEach(m=>html+=`<span>${m}</span>`);html+='</div>';
  html+='<div class="year-cells">';
  const start=new Date(2026,0,1),end=new Date(2026,11,31);
  let d=new Date(start);
  // pad start
  const startDow=d.getDay()||7;
  for(let i=1;i<startDow;i++)html+='<div class="ycell empty"></div>';
  while(d<=end){
    const dd=getDayData(d);
    const done=BLOCKS.filter(b=>dd.blocks&&dd.blocks[b]).length;
    const pct=Math.round(done/BLOCKS.length*100);
    let lvl=0;if(pct>0)lvl=1;if(pct>=30)lvl=2;if(pct>=60)lvl=3;if(pct>=90)lvl=4;
    const isCur=dateKey(d)===dateKey(currentDate);
    const title=d.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'})+' — '+done+'/'+BLOCKS.length;
    html+=`<div class="ycell lvl${lvl}${isCur?' cur':''}" title="${title}" onclick="setDate(new Date(${d.getFullYear()},${d.getMonth()},${d.getDate()}))">${d.getDate()===1?'':''}​</div>`;
    d.setDate(d.getDate()+1);
  }
  html+='</div>';
  grid.innerHTML=html;
  // stats
  let totalDays=0,totalCompleted=0;
  d=new Date(start);
  while(d<=end){
    const dd=getDayData(d);
    const done=BLOCKS.filter(b=>dd.blocks&&dd.blocks[b]).length;
    if(done>0)totalDays++;
    if(done>=5)totalCompleted++;
    d.setDate(d.getDate()+1);
  }
  document.getElementById('year-active').textContent=totalDays;
  document.getElementById('year-perfect').textContent=totalCompleted;
}

function showTab(id,btn){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  btn.classList.add('active');
  if(id==='year')renderYear();
}
function renderAll(){renderToday();renderMeals();renderHabits();renderTasks();}
function onDatePick(v){if(v){const d=new Date(v+'T00:00:00');if(d.getFullYear()===2026)setDate(d);}}

// Custom Tasks
function getTasksKey(){return 'ah_tasks_'+dateKey(currentDate);}
function loadTasks(){try{return JSON.parse(localStorage.getItem(getTasksKey()))||[];}catch(e){return [];}}
function saveTasks(tasks){try{localStorage.setItem(getTasksKey(),JSON.stringify(tasks));}catch(e){}}

function addTask(){
  const input=document.getElementById('task-input');
  const text=input.value.trim();
  if(!text)return;
  const tasks=loadTasks();
  tasks.push({id:Date.now(),text:text,done:false});
  saveTasks(tasks);
  input.value='';
  renderTasks();
}

function toggleTask(id){
  const tasks=loadTasks();
  const t=tasks.find(t=>t.id===id);
  if(t){t.done=!t.done;saveTasks(tasks);renderTasks();}
}

function deleteTask(id){
  let tasks=loadTasks();
  tasks=tasks.filter(t=>t.id!==id);
  saveTasks(tasks);
  renderTasks();
}

function renderTasks(){
  const tasks=loadTasks();
  const list=document.getElementById('task-list');
  const empty=document.getElementById('task-empty');
  if(!list)return;
  list.innerHTML='';
  if(tasks.length===0){empty.style.display='block';return;}
  empty.style.display='none';
  tasks.forEach(t=>{
    const div=document.createElement('div');
    div.className='task-item'+(t.done?' completed':'');
    div.innerHTML=`<div class="task-check${t.done?' done':''}" onclick="toggleTask(${t.id})"><i class="ti ti-check" style="font-size:11px"></i></div><span class="task-text">${escapeHtml(t.text)}</span><button class="task-delete" onclick="deleteTask(${t.id})" title="Remove"><i class="ti ti-trash"></i></button>`;
    list.appendChild(div);
  });
}

function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}

document.addEventListener('DOMContentLoaded',()=>{
  const today=new Date();today.setHours(0,0,0,0);
  if(today.getFullYear()===2026)currentDate=today;
  else currentDate=new Date(2026,0,1);
  renderAll();
});

