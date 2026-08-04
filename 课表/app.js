const slots=[['08:00','08:45'],['09:00','09:45'],['10:15','11:00'],['11:15','12:00'],['14:00','14:45'],['15:00','15:45'],['16:15','17:00'],['19:00','19:45']];
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
let weekOffset=0;let selectedColor='coral';
const $=s=>document.querySelector(s);const grid=$('#scheduleGrid');const dialog=$('#courseDialog');
function monday(offset=0){const d=new Date();const day=d.getDay()||7;d.setDate(d.getDate()-day+1+offset*7);d.setHours(0,0,0,0);return d}
function fmt(d){return `${d.getMonth()+1}月${d.getDate()}日`};
function render(){const start=monday(weekOffset);const today=new Date();let html='<div class="corner"></div>';for(let day=1;day<=7;day++){const d=new Date(start);d.setDate(d.getDate()+day-1);const isToday=d.toDateString()===today.toDateString();html+=`<div class="day-header ${isToday?'today':''}">${['周一','周二','周三','周四','周五','周六','周日'][day-1]}<span>${d.getMonth()+1}/${d.getDate()}</span></div>`}slots.forEach((time,slot)=>{html+=`<div class="time-label"><b>第 ${slot+1} 节</b>${time[0]}<br>${time[1]}</div>`;for(let day=1;day<=7;day++){const item=courses.find(c=>c.day===day%7&&c.slot===slot);html+=`<div class="cell" data-day="${day%7}" data-slot="${slot}">${item?card(item):''}</div>`}});grid.innerHTML=html;$('#dateRange').textContent=`${fmt(start)} — ${fmt(new Date(start.getTime()+6*86400000))}`;$('#classHours').textContent=courses.length;$('#freeDays').textContent=7-new Set(courses.map(c=>c.day)).size;$('#weekNo').textContent=Math.max(1,Math.ceil(((start-new Date(start.getFullYear(),0,1))/86400000+1)/7));}
function card(c){return `<article class="course ${c.color}" data-id="${c.id}"><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.teacher||'未填写教师')}</p><p>${escapeHtml(c.room||'未填写地点')}</p></article>`}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function persist(){localStorage.setItem('classroom-courses',JSON.stringify(courses));render()}
function openCourse(c={day:1,slot:0,color:'coral'}){selectedColor=c.color;$('#dialogTitle').textContent=c.id?'编辑课程':'添加课程';$('#courseId').value=c.id||'';$('#courseName').value=c.name||'';$('#courseDay').value=c.day;$('#courseSlot').value=c.slot;$('#courseTeacher').value=c.teacher||'';$('#courseRoom').value=c.room||'';$('#courseColor').value=c.color;$('#deleteButton').style.visibility=c.id?'visible':'hidden';paintColors();dialog.showModal();$('#courseName').focus()}
function paintColors(){$('#colorPicks').innerHTML=colors.map(color=>`<button type="button" class="color-pick ${color} ${color===selectedColor?'active':''}" data-color="${color}" aria-label="${color}"></button>`).join('')}
$('#courseSlot').innerHTML=slots.map((s,i)=>`<option value="${i}">第 ${i+1} 节 · ${s[0]}</option>`).join('');
grid.addEventListener('click',e=>{const course=e.target.closest('.course');if(course){e.stopPropagation();openCourse(courses.find(x=>x.id===course.dataset.id));return}const cell=e.target.closest('.cell');if(cell)openCourse({day:+cell.dataset.day,slot:+cell.dataset.slot,color:'coral'})});
$('#addButton').onclick=()=>openCourse();$('#prevWeek').onclick=()=>{weekOffset--;render()};$('#nextWeek').onclick=()=>{weekOffset++;render()};$('#todayButton').onclick=()=>{weekOffset=0;render()};
$('#colorPicks').addEventListener('click',e=>{if(e.target.dataset.color){selectedColor=e.target.dataset.color;$('#courseColor').value=selectedColor;paintColors()}});
$('#courseForm').addEventListener('submit',e=>{e.preventDefault();const id=$('#courseId').value;const course={id:id||crypto.randomUUID(),name:$('#courseName').value.trim(),day:+$('#courseDay').value,slot:+$('#courseSlot').value,teacher:$('#courseTeacher').value.trim(),room:$('#courseRoom').value.trim(),color:$('#courseColor').value};if(!course.name)return;if(id)courses=courses.map(c=>c.id===id?course:c);else{courses=courses.filter(c=>!(c.day===course.day&&c.slot===course.slot));courses.push(course)}persist();dialog.close()});
$('#deleteButton').onclick=()=>{const id=$('#courseId').value;if(id){courses=courses.filter(c=>c.id!==id);persist();dialog.close()}};
$('#resetButton').onclick=()=>{courses=sample.map(c=>({...c}));persist()};

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
    const raw=file.name.toLowerCase().endsWith('.json')?JSON.parse(content):parseCsv(content);
    const incoming=validateImported(raw);
    incoming.forEach(course=>{courses=courses.filter(old=>!(old.day===course.day&&old.slot===course.slot));courses.push(course)});
    persist();importDialog.close();alert(`已导入 ${incoming.length} 门课程`);
  }catch(error){alert(`导入失败：${error.message}`)}finally{importFile.value=''}
});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
