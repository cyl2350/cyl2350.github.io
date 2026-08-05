const defaultSlots=[['08:00','08:45'],['09:00','09:45'],['10:15','11:00'],['11:15','12:00'],['14:00','14:45'],['15:00','15:45'],['16:15','17:00'],['19:00','19:45']];
let slots=JSON.parse(localStorage.getItem('classroom-slots')||'null')||defaultSlots;
const colors=['coral','mint','yellow','purple','navy'];
const sample=[
 {id:'a1',name:'高等数学',day:1,slot:0,teacher:'李老师',room:'明德楼 301',color:'coral'},
 {id:'a2',name:'大学英语',day:1,slot:2,teacher:'陈老师',room:'文科楼 204',color:'mint'},
 {id:'a3',name:'程序设计基础',day:2,slot:1,teacher:'张老师',room:'信息楼 402',color:'purple'},
 {id:'a4',name:'线性代数',day:3,slot:0,teacher:'王老师',room:'明德楼 206',color:'yellow'},
 {id:'a5',name:'体育',day:3,slot:5,teacher:'刘老师',room:'田径场',color:'mint'},
 {id:'a6',name:'数据结构',day:4,slot:3,teacher:'赵老师',room:'信息楼 305',color:'navy'},
 {id:'a7',name:'大学物理',day:5,slot:1,teacher:'孙老师',room:'理学楼 101',color:'coral'},
 {id:'a8',name:'形势与政策',day:5,slot:6,teacher:'周老师',room:'文科楼 108',color:'yellow'}
];
let courses=JSON.parse(localStorage.getItem('classroom-courses')||'null')||sample;
courses=courses.map(course=>({...course,startWeek:Number(course.startWeek)||1,endWeek:Number(course.endWeek)||20}));
let tasks=JSON.parse(localStorage.getItem('classroom-tasks')||'[]');
let term=JSON.parse(localStorage.getItem('classroom-term')||'null')||{year:2025,semester:'秋'};
let weekOffset=0;let selectedColor='coral';
const $=s=>document.querySelector(s);const grid=$('#scheduleGrid');const dialog=$('#courseDialog');
function monday(offset=0){const d=new Date();const day=d.getDay()||7;d.setDate(d.getDate()-day+1+offset*7);d.setHours(0,0,0,0);return d}
function fmt(d){return `${d.getMonth()+1}月${d.getDate()}日`};
function render(){const start=monday(weekOffset);const today=new Date(),activeWeek=Math.max(1,1+weekOffset);let html='<div class="corner"></div>';for(let day=1;day<=7;day++){const d=new Date(start);d.setDate(d.getDate()+day-1);const isToday=d.toDateString()===today.toDateString();html+=`<div class="day-header ${isToday?'today':''}">${['周一','周二','周三','周四','周五','周六','周日'][day-1]}<span>${d.getMonth()+1}/${d.getDate()}</span></div>`}slots.forEach((time,slot)=>{html+=`<div class="time-label"><b>第 ${slot+1} 节</b>${time[0]}<br>${time[1]}</div>`;for(let day=1;day<=7;day++){const dayNo=day%7,item=courses.find(c=>c.day===dayNo&&c.slot===slot),todo=tasks.find(t=>t.week===activeWeek&&t.day===dayNo&&t.slot===slot);html+=`<div class="cell ${todo?'has-task':''}" data-day="${dayNo}" data-slot="${slot}">${item?card(item,activeWeek):''}${todo?taskChip(todo):`<button class="task-add" aria-label="添加待办">+</button>`}</div>`}});grid.innerHTML=html;$('#dateRange').textContent=`第 ${activeWeek} 周 · ${fmt(start)} — ${fmt(new Date(start.getTime()+6*86400000))}`;$('#classHours').textContent=courses.filter(c=>activeWeek>=c.startWeek&&activeWeek<=c.endWeek).length;$('#freeDays').textContent=7-new Set(courses.filter(c=>activeWeek>=c.startWeek&&activeWeek<=c.endWeek).map(c=>c.day)).size;$('#weekNo').textContent=activeWeek;$('#taskCount').textContent=tasks.filter(t=>!t.done).length;$('#termLabel').textContent=`${term.year} · ${term.semester}`;}
function card(c,activeWeek){const inactive=activeWeek<c.startWeek||activeWeek>c.endWeek;return `<article class="course ${c.color} ${inactive?'inactive':''}" data-id="${c.id}"><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.teacher||'未填写教师')}</p><p>${escapeHtml(c.room||'未填写地点')}</p><small>${c.startWeek}-${c.endWeek}周</small></article>`}
function taskChip(task){return `<button class="task-chip ${task.done?'done':''}" data-task-id="${task.id}" title="点击文字编辑待办"><span class="task-toggle" title="完成待办">${task.done?'✓':'○'}</span>${escapeHtml(task.name)}</button>`}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function persist(){localStorage.setItem('classroom-courses',JSON.stringify(courses));render()}
function openCourse(c={day:1,slot:0,color:'coral',startWeek:Math.max(1,1+weekOffset),endWeek:20}){selectedColor=c.color;$('#dialogTitle').textContent=c.id?'编辑课程':'添加课程';$('#courseId').value=c.id||'';$('#courseName').value=c.name||'';$('#courseDay').value=c.day;$('#courseSlot').value=c.slot;$('#courseStartWeek').value=c.startWeek||1;$('#courseEndWeek').value=c.endWeek||20;$('#courseTeacher').value=c.teacher||'';$('#courseRoom').value=c.room||'';$('#courseColor').value=c.color;$('#deleteButton').style.visibility=c.id?'visible':'hidden';paintColors();dialog.showModal();$('#courseName').focus()}
function paintColors(){$('#colorPicks').innerHTML=colors.map(color=>`<button type="button" class="color-pick ${color} ${color===selectedColor?'active':''}" data-color="${color}" aria-label="${color}"></button>`).join('')}
function refreshCourseSlotOptions(){const selected=$('#courseSlot').value,taskSelected=$('#taskSlot').value,options=slots.map((s,i)=>`<option value="${i}">第 ${i+1} 节 · ${s[0]}</option>`).join('');$('#courseSlot').innerHTML=options;$('#taskSlot').innerHTML=options;$('#courseSlot').value=Math.min(+selected||0,slots.length-1);$('#taskSlot').value=Math.min(+taskSelected||0,slots.length-1)}
refreshCourseSlotOptions();
grid.addEventListener('click',e=>{const taskAdd=e.target.closest('.task-add'),taskChipTarget=e.target.closest('.task-chip');if(taskAdd){e.stopPropagation();const cell=e.target.closest('.cell');openTask({day:+cell.dataset.day,slot:+cell.dataset.slot,week:Math.max(1,1+weekOffset)});return}if(taskChipTarget){e.stopPropagation();const task=tasks.find(t=>t.id===taskChipTarget.dataset.taskId);if(task){if(e.target.closest('.task-toggle')){task.done=!task.done;persistTasks()}else openTask(task)}return}const course=e.target.closest('.course');if(course){e.stopPropagation();openCourse(courses.find(x=>x.id===course.dataset.id));return}const cell=e.target.closest('.cell');if(cell)openCourse({day:+cell.dataset.day,slot:+cell.dataset.slot,color:'coral'})});
$('#addButton').onclick=()=>openCourse();$('#prevWeek').onclick=()=>{weekOffset--;render()};$('#nextWeek').onclick=()=>{weekOffset++;render()};$('#todayButton').onclick=()=>{weekOffset=0;render()};
let swipeStartX=0,swipeStartY=0;
$('#schedule').addEventListener('pointerdown',event=>{swipeStartX=event.clientX;swipeStartY=event.clientY});
$('#schedule').addEventListener('pointerup',event=>{const x=event.clientX-swipeStartX,y=event.clientY-swipeStartY;if(Math.abs(x)>55&&Math.abs(x)>Math.abs(y)){weekOffset+=x<0?1:-1;render()}});
$('#closeCourseDialog').onclick=()=>dialog.close();
$('#cancelCourseDialog').onclick=()=>dialog.close();
$('#colorPicks').addEventListener('click',e=>{if(e.target.dataset.color){selectedColor=e.target.dataset.color;$('#courseColor').value=selectedColor;paintColors()}});
$('#courseForm').addEventListener('submit',e=>{e.preventDefault();const id=$('#courseId').value,startWeek=+$('#courseStartWeek').value,endWeek=+$('#courseEndWeek').value;if(startWeek<1||endWeek<startWeek){alert('请检查课程的起止周');return}const course={id:id||crypto.randomUUID(),name:$('#courseName').value.trim(),day:+$('#courseDay').value,slot:+$('#courseSlot').value,startWeek,endWeek,teacher:$('#courseTeacher').value.trim(),room:$('#courseRoom').value.trim(),color:$('#courseColor').value};if(!course.name)return;if(id)courses=courses.map(c=>c.id===id?course:c);else{courses=courses.filter(c=>!(c.day===course.day&&c.slot===course.slot));courses.push(course)}persist();dialog.close()});
$('#deleteButton').onclick=()=>{const id=$('#courseId').value;if(id){courses=courses.filter(c=>c.id!==id);persist();dialog.close()}};
const taskDialog=$('#taskDialog');
function persistTasks(){localStorage.setItem('classroom-tasks',JSON.stringify(tasks));render()}
function openTask(task={day:1,slot:0,week:Math.max(1,1+weekOffset)}){const isEditing=Boolean(task.id);$('#taskDialogTitle').textContent=isEditing?'编辑待办':'添加待办';$('#taskId').value=task.id||'';$('#taskName').value=task.name||'';$('#taskDay').value=task.day;$('#taskSlot').value=Math.min(task.slot||0,slots.length-1);$('#deleteTaskButton').style.visibility=isEditing?'visible':'hidden';taskDialog.dataset.week=task.week;taskDialog.dataset.done=task.done?'1':'0';taskDialog.showModal();$('#taskName').focus()}
$('#tasksButton').onclick=()=>openTask({day:1,slot:0,week:Math.max(1,1+weekOffset)});
$('#tasksMobileButton').onclick=$('#tasksButton').onclick;
$('#closeTaskDialog').onclick=()=>taskDialog.close();$('#cancelTaskDialog').onclick=()=>taskDialog.close();
$('#taskForm').addEventListener('submit',event=>{event.preventDefault();const id=$('#taskId').value,name=$('#taskName').value.trim();if(!name)return;const task={id:id||crypto.randomUUID(),name,day:+$('#taskDay').value,slot:+$('#taskSlot').value,week:+taskDialog.dataset.week,done:taskDialog.dataset.done==='1'};if(id)tasks=tasks.map(old=>old.id===id?task:old);else{tasks=tasks.filter(old=>!(old.week===task.week&&old.day===task.day&&old.slot===task.slot));tasks.push(task)}persistTasks();taskDialog.close()});
$('#deleteTaskButton').onclick=()=>{const id=$('#taskId').value;if(id){tasks=tasks.filter(task=>task.id!==id);persistTasks();taskDialog.close()}};
$('#resetButton').onclick=()=>{courses=sample.map(c=>({...c}));persist()};

const scheduleDialog=$('#scheduleDialog');
let savedSlotsSnapshot=null;
function renderSlotSettings(){
  $('#slotSettings').innerHTML=slots.map((slot,index)=>`<div class="slot-row"><b>${index+1}</b><label>开始<input type="time" required value="${slot[0]}" data-start="${index}" /></label><label>结束<input type="time" required value="${slot[1]}" data-end="${index}" /></label><button type="button" class="remove-slot" data-remove-slot="${index}" aria-label="删除第${index+1}节">−</button></div>`).join('');
}
$('#settingsButton').onclick=()=>{savedSlotsSnapshot=slots.map(slot=>[...slot]);$('#termYear').value=term.year;$('#termSemester').value=term.semester;renderSlotSettings();scheduleDialog.showModal()};
$('#settingsMobileButton').onclick=$('#settingsButton').onclick;
$('#closeScheduleDialog').onclick=()=>scheduleDialog.close();
$('#cancelScheduleDialog').onclick=()=>scheduleDialog.close();
scheduleDialog.addEventListener('close',()=>{if(savedSlotsSnapshot){slots=savedSlotsSnapshot;savedSlotsSnapshot=null}});
$('#addSlotButton').onclick=()=>{const last=slots.at(-1)||['08:00','08:45'];const [hour,minute]=last[1].split(':').map(Number),startMinutes=hour*60+minute+15,endMinutes=startMinutes+45,toTime=value=>`${String(Math.floor(value/60)%24).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;slots.push([toTime(startMinutes),toTime(endMinutes)]);renderSlotSettings()};
$('#slotSettings').addEventListener('click',event=>{const index=event.target.dataset.removeSlot;if(index!==undefined){if(slots.length===1){alert('每天至少保留一节课');return}slots.splice(+index,1);renderSlotSettings()}});
$('#scheduleForm').addEventListener('submit',event=>{event.preventDefault();const next=slots.map((_,index)=>[$(`[data-start="${index}"]`).value,$(`[data-end="${index}"]`).value]),year=+$('#termYear').value;if(!year){alert('请选择学年');return}if(next.some(([start,end])=>!start||!end||start>=end)){alert('请填写正确的上课时间');return}slots=next;term={year,semester:$('#termSemester').value};localStorage.setItem('classroom-slots',JSON.stringify(slots));localStorage.setItem('classroom-term',JSON.stringify(term));savedSlotsSnapshot=null;refreshCourseSlotOptions();render();scheduleDialog.close()});

const importDialog=$('#importDialog'), importFile=$('#importFile');
$('#importButton').onclick=()=>importDialog.showModal();
$('#chooseFile').onclick=()=>importFile.click();
$('#downloadTemplate').onclick=()=>{
  const csv='课程名称,星期,节次,教师,地点,颜色\n高等数学,1,1,李老师,明德楼301,coral\n大学英语,3,3,陈老师,文科楼204,mint\n';
  const link=document.createElement('a');link.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));link.download='课表导入模板.csv';link.click();URL.revokeObjectURL(link.href);
};
function parseCsv(text){
  const rows=text.replace(/^\ufeff/,'').trim().split(/\r?\n/).filter(Boolean).map(row=>row.split(',').map(x=>x.trim()));
  if(rows.length<2) throw new Error('文件中没有课程数据');
  return rows.slice(1).map((row,index)=>({name:row[0],day:+row[1],slot:+row[2]-1,teacher:row[3]||'',room:row[4]||'',color:colors.includes(row[5])?row[5]:colors[index%colors.length]}));
}
function unfoldIcs(text){return text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/)}
function icsValue(line){const colon=line.indexOf(':');return colon<0?'':line.slice(colon+1).replace(/\\n/gi,' ').replace(/\\,/g,',').replace(/\\;/g,';').replace(/\\\\/g,'\\').trim()}
function icsTime(value){const match=value.match(/(\d{8})T(\d{2})(\d{2})?/);if(!match)return null;const date=match[1],hour=+match[2],minute=+(match[3]||0);return {date,hour,minute}}
function slotFromTime(time){if(!time)return -1;const minutes=time.hour*60+time.minute;let best=-1,delta=Infinity;slots.forEach((slot,index)=>{const [h,m]=slot[0].split(':').map(Number),difference=Math.abs(minutes-(h*60+m));if(difference<delta){delta=difference;best=index}});return delta<=60?best:-1}
function dayFromIcsDate(date){return new Date(+date.slice(0,4),+date.slice(4,6)-1,+date.slice(6,8)).getDay()}
function parseIcs(text){
  const events=[];let event=null;
  unfoldIcs(text).forEach(line=>{
    if(line==='BEGIN:VEVENT'){event={};return}
    if(line==='END:VEVENT'){if(event)events.push(event);event=null;return}
    if(!event)return;
    const key=line.slice(0,line.indexOf(':')).split(';')[0].toUpperCase();
    if(key==='SUMMARY')event.name=icsValue(line);
    if(key==='LOCATION')event.room=icsValue(line);
    if(key==='DESCRIPTION')event.teacher=icsValue(line);
    if(key==='DTSTART')event.start=icsValue(line);
    if(key==='RRULE')event.rule=icsValue(line);
  });
  const days={MO:1,TU:2,WE:3,TH:4,FR:5,SA:6,SU:0};
  const courses=[];
  events.forEach((event,index)=>{
    const time=icsTime(event.start||''),slot=slotFromTime(time);
    if(!event.name||slot<0||!time)return;
    const byDay=(event.rule||'').match(/BYDAY=([^;]+)/i);
    const eventDays=byDay?byDay[1].split(',').map(value=>days[value.replace(/^[+-]?\d+/,'').toUpperCase()]).filter(value=>value!==undefined):[dayFromIcsDate(time.date)];
    eventDays.forEach(day=>courses.push({name:event.name,day,slot,teacher:event.teacher||'',room:event.room||'',color:colors[index%colors.length],slotIsZeroBased:true}));
  });
  if(!courses.length)throw new Error('未识别到可导入的课程事件，请确认日历包含课程名称和具体上课时间');
  return courses;
}
function validateImported(items){
  if(!Array.isArray(items)||!items.length) throw new Error('文件中没有课程数据');
  return items.map((item,index)=>{
    const day=Number(item.day), rawSlot=Number(item.slot);
    const slot=item.slotIsZeroBased?rawSlot:rawSlot-1;
    if(!item.name||!Number.isInteger(day)||day<0||day>6||!Number.isInteger(slot)||slot<0||slot>=slots.length) throw new Error(`第 ${index+1} 行格式不正确`);
    return {id:crypto.randomUUID(),name:String(item.name).trim(),day,slot,teacher:String(item.teacher||'').trim(),room:String(item.room||'').trim(),color:colors.includes(item.color)?item.color:colors[index%colors.length]};
  });
}
importFile.addEventListener('change',async()=>{
  const file=importFile.files[0];if(!file)return;
  try{
    const content=await file.text();
    const name=file.name.toLowerCase();
    const raw=name.endsWith('.json')?JSON.parse(content):name.endsWith('.ics')?parseIcs(content):parseCsv(content);
    const incoming=validateImported(raw);
    incoming.forEach(course=>{courses=courses.filter(old=>!(old.day===course.day&&old.slot===course.slot));courses.push(course)});
    persist();importDialog.close();alert(`已导入 ${incoming.length} 门课程`);
  }catch(error){alert(`导入失败：${error.message}`)}finally{importFile.value=''}
});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
