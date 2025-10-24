<!DOCTYPE html>
<html lang="th" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Task Flow — Fixed clickable details + Done button</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body{box-sizing:border-box;font-family:'Prompt','Inter',-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:-.01em}
    .glass-effect{background:rgba(255,255,255,.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.2)}
    .task-card{transition:all .25s ease;border:1px solid rgba(226,232,240,.8);cursor:pointer}
    .task-card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.08);border-color:rgba(99,102,241,.2)}
    .calendar-day{transition:all .2s ease}
    .modal-backdrop{backdrop-filter:blur(8px);background:rgba(15,23,42,.6)}
    .btn{display:inline-flex;align-items:center;justify-content:center;padding:.6rem 1rem;border-radius:.75rem}
  </style>
</head>
<body class="h-full bg-gradient-to-br from-sky-50 via-white to-sky-100">
  <!-- NAV -->
  <nav class="glass-effect shadow-sm border-b border-slate-200/50">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="h-16 flex items-center justify-between">
        <h1 class="text-xl font-semibold text-slate-800 tracking-tight">TaskFlow</h1>
        <div class="hidden sm:flex gap-2">
          <button onclick="showAddActivity()" class="btn bg-white border border-slate-200">เพิ่มกิจกรรม</button>
          <button onclick="showAddHomework()" class="btn bg-slate-900 text-white">เพิ่มการบ้าน</button>
        </div>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-10">
    <!-- Calendar + Upcoming -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 glass-effect rounded-2xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-slate-800" id="calendar-title">January 2024</h2>
          <div class="flex gap-2">
            <button onclick="previousMonth()" class="btn bg-white border border-slate-200">◀</button>
            <button onclick="nextMonth()" class="btn bg-white border border-slate-200">▶</button>
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2 mb-3 text-sm font-semibold text-slate-500">
          <div class="text-center py-2">Sun</div><div class="text-center py-2">Mon</div><div class="text-center py-2">Tue</div><div class="text-center py-2">Wed</div><div class="text-center py-2">Thu</div><div class="text-center py-2">Fri</div><div class="text-center py-2">Sat</div>
        </div>
        <div id="calendar-grid" class="grid grid-cols-7 gap-2"></div>
      </div>
      <div class="glass-effect rounded-2xl p-6">
        <h3 class="text-xl font-semibold text-slate-800 mb-4">งานที่ใกล้ถึงกำหนด</h3>
        <div id="upcoming-tasks" class="space-y-3"></div>
      </div>
    </section>

    <!-- Homework -->
    <section class="glass-effect rounded-2xl p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-slate-800">การบ้าน</h2>
        <div class="flex gap-2">
          <button onclick="showSubjectSettings()" class="btn bg-white border border-slate-200">วิชา</button>
          <button onclick="showAddHomework()" class="btn bg-slate-900 text-white">เพิ่มการบ้าน</button>
        </div>
      </div>
      <div class="flex gap-2 mb-6 bg-slate-100 p-1 rounded-full w-full max-w-xl">
        <button onclick="filterHomework('all')" id="filter-all" class="filter-btn bg-white text-slate-700 px-4 py-2 rounded-full font-medium shadow-sm">ทั้งหมด (<span id="count-all">0</span>)</button>
        <button onclick="filterHomework('pending')" id="filter-pending" class="filter-btn text-slate-600 px-4 py-2 rounded-full font-medium">ค้างส่ง (<span id="count-pending">0</span>)</button>
        <button onclick="filterHomework('overdue')" id="filter-overdue" class="filter-btn text-slate-600 px-4 py-2 rounded-full font-medium">เลยกำหนด (<span id="count-overdue">0</span>)</button>
        <button onclick="filterHomework('completed')" id="filter-completed" class="filter-btn text-slate-600 px-4 py-2 rounded-full font-medium">เสร็จแล้ว (<span id="count-completed">0</span>)</button>
      </div>
      <div id="homework-list" class="grid md:grid-cols-2 gap-4"></div>
    </section>

    <!-- Activities -->
    <section class="glass-effect rounded-2xl p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-slate-800">กิจกรรม</h2>
        <button onclick="showAddActivity()" class="btn bg-slate-900 text-white">เพิ่มกิจกรรม</button>
      </div>
      <div id="activities-list" class="grid md:grid-cols-2 gap-4"></div>
    </section>
  </main>

  <!-- Day Modal -->
  <div id="day-modal" class="fixed inset-0 modal-backdrop hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" id="day-modal-title">รายละเอียดวันที่</h3>
          <button onclick="closeDayModal()" class="text-gray-500">✕</button>
        </div>
        <div id="day-modal-content" class="space-y-3"></div>
      </div>
    </div>
  </div>

  <!-- Detail Modal -->
  <div id="detail-modal" class="fixed inset-0 modal-backdrop hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold" id="detail-title">รายละเอียด</h3>
          <button onclick="closeDetail()" class="text-gray-500">✕</button>
        </div>
        <div id="detail-body" class="space-y-3"></div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Homework Modal -->
  <div id="add-homework-modal" class="fixed inset-0 modal-backdrop hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">เพิ่ม/แก้ไข การบ้าน</h3>
          <button onclick="closeAddHomework()" class="text-gray-500">✕</button>
        </div>
        <form id="homework-form" onsubmit="saveHomework(event)" class="space-y-3">
          <div>
            <label class="text-sm">วิชา</label>
            <select id="homework-subject" required class="w-full px-3 py-2 rounded-xl border border-slate-200"></select>
          </div>
          <div>
            <label class="text-sm">รายละเอียด</label>
            <input id="homework-title" required class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-sm">กำหนดส่ง</label>
            <input id="homework-date" type="date" required class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-sm">สถานะ</label>
            <select id="homework-status" class="w-full px-3 py-2 rounded-xl border border-slate-200">
              <option value="pending">ยังไม่เสร็จ</option>
              <option value="completed">เสร็จแล้ว</option>
            </select>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" onclick="closeAddHomework()" class="flex-1 btn bg-slate-100">ยกเลิก</button>
            <button type="submit" class="flex-1 btn bg-slate-900 text-white">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Add/Edit Activity Modal -->
  <div id="add-activity-modal" class="fixed inset-0 modal-backdrop hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">เพิ่ม/แก้ไข กิจกรรม</h3>
          <button onclick="closeAddActivity()" class="text-gray-500">✕</button>
        </div>
        <form id="activity-form" onsubmit="saveActivity(event)" class="space-y-3">
          <div>
            <label class="text-sm">ชื่อกิจกรรม</label>
            <input id="activity-title" required class="w-full px-3 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label class="text-sm">รายละเอียด</label>
            <textarea id="activity-description" rows="3" class="w-full px-3 py-2 rounded-xl border border-slate-200"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm">เริ่ม</label>
              <input id="activity-start-date" type="date" required class="w-full px-3 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label class="text-sm">สิ้นสุด</label>
              <input id="activity-end-date" type="date" required class="w-full px-3 py-2 rounded-xl border border-slate-200" />
            </div>
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" onclick="closeAddActivity()" class="flex-1 btn bg-slate-100">ยกเลิก</button>
            <button type="submit" class="flex-1 btn bg-slate-900 text-white">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirm -->
  <div id="delete-modal" class="fixed inset-0 modal-backdrop hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <div class="text-4xl mb-3">⚠️</div>
        <h3 class="text-lg font-bold mb-2">ยืนยันการลบ</h3>
        <p class="text-slate-600 mb-5">คุณต้องการลบรายการนี้หรือไม่?</p>
        <div class="flex gap-2">
          <button onclick="closeDeleteConfirm()" class="flex-1 btn bg-slate-100">ยกเลิก</button>
          <button onclick="confirmDelete()" class="flex-1 btn bg-rose-600 text-white">ลบ</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // ===== State =====
    let currentDate=new Date();
    let subjects=['คณิตศาสตร์','ภาษาไทย','ภาษาอังกฤษ','วิทยาศาสตร์','สังคมศึกษา'];
    let homework=[{id:1,subject:'คณิตศาสตร์',title:'แบบฝึกหัดบทที่ 5',dueDate:'2024-01-25',status:'pending'},{id:2,subject:'ภาษาอังกฤษ',title:'เขียนเรียงความ My Family',dueDate:'2024-01-20',status:'pending'}];
    // เพิ่ม status ให้กิจกรรมเพื่อรองรับ "ทำเสร็จแล้ว"
    let activities=[{id:1,title:'งานวิทยาศาสตร์',description:'จัดทำโครงงานเรื่องพลังงานทดแทน',startDate:'2024-01-22',endDate:'2024-01-30',status:'planned'}];
    let editingId=null; // ใช้ร่วมตอนแก้ไข
    let deleteTarget=null; // {type:'homework'|'activity', id}

    // ===== Utils =====
    const pad2=n=>String(n).padStart(2,'0');
    const fmt=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
    const parseLocal=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,(m||1)-1,(d||1))};
    const startOfDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
    const daysUntil=s=>{const t=startOfDay(new Date());const g=startOfDay(parseLocal(s));return Math.round((g-t)/86400000)};
    const thaiDate=s=>{const d=parseLocal(s);const mm=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][d.getMonth()];return `${d.getDate()} ${mm} ${d.getFullYear()+543}`};

    // ===== Calendar =====
    function updateCalendar(){
      const y=currentDate.getFullYear();const m=currentDate.getMonth();
      const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
      const titleEl=document.getElementById('calendar-title'); if(titleEl) titleEl.textContent=`${months[m]} ${y}`;
      const first=new Date(y,m,1);const start=new Date(first);start.setDate(first.getDate()-first.getDay());
      const grid=document.getElementById('calendar-grid'); if(!grid) return; grid.innerHTML='';
      const today=startOfDay(new Date());
      for(let i=0;i<42;i++){
        const d=new Date(start);d.setDate(start.getDate()+i);
        const isCur=d.getMonth()===m;const isToday=startOfDay(d).getTime()===today.getTime();
        const ds=fmt(d);
        const hasHW=homework.some(h=>h.dueDate===ds);const hasAct=activities.some(a=>ds>=a.startDate && ds<=a.endDate);
        const el=document.createElement('div');
        el.className='calendar-day p-3 text-center rounded-xl '+(!isCur?'text-gray-300':isToday?'bg-blue-500 text-white font-bold':'text-gray-700 hover:bg-gray-100');
        el.innerHTML=`<div class="font-medium">${d.getDate()}</div>${(hasHW||hasAct)?`<div class='flex justify-center gap-1 mt-1'>${hasHW?"<div class='w-2 h-2 bg-red-400 rounded-full'></div>":''}${hasAct?"<div class='w-2 h-2 bg-green-400 rounded-full'></div>":''}</div>`:''}`;
        if(isCur){ el.addEventListener('click',()=>showDayDetail(ds)); }
        grid.appendChild(el);
      }
    }
    function previousMonth(){ currentDate.setMonth(currentDate.getMonth()-1); updateCalendar(); }
    function nextMonth(){ currentDate.setMonth(currentDate.getMonth()+1); updateCalendar(); }

    function showDayDetail(dateStr){
      const dayHW=homework.filter(h=>h.dueDate===dateStr);
      const dayAct=activities.filter(a=>dateStr>=a.startDate && dateStr<=a.endDate);
      const title=document.getElementById('day-modal-title'); if(title) title.textContent=`รายการวันที่ ${thaiDate(dateStr)}`;
      let html='';
      if(dayHW.length){
        html+="<div class='font-semibold text-red-600 mb-2'>📝 การบ้าน</div>";
        dayHW.forEach(h=>{ html+=`<div class='p-3 rounded-lg border border-slate-200 mb-2'>
          <div class='font-medium'>${h.title}</div>
          <div class='text-sm text-slate-600'>วิชา: ${h.subject}</div>
          <div class='text-xs text-slate-500'>กำหนดส่ง: ${thaiDate(h.dueDate)}</div>
        </div>`; });
      }
      if(dayAct.length){
        html+="<div class='font-semibold text-green-600 mt-3 mb-2'>🎯 กิจกรรม</div>";
        dayAct.forEach(a=>{ html+=`<div class='p-3 rounded-lg border border-slate-200 mb-2'>
          <div class='font-medium'>${a.title}</div>
          <div class='text-sm text-slate-600'>${a.description||''}</div>
          <div class='text-xs text-slate-500'>${thaiDate(a.startDate)} - ${thaiDate(a.endDate)}</div>
        </div>`; });
      }
      if(!html) html = "<div class='text-center text-slate-500 py-4'>ไม่มีงานในวันนี้</div>";
      const body=document.getElementById('day-modal-content'); if(body) body.innerHTML=html;
      openModal('day-modal');
    }

    // ===== Upcoming =====
    function updateUpcoming(){
      const list=[];const today=startOfDay(new Date());
      homework.filter(h=>h.status!=='completed').forEach(h=>list.push({type:'homework',id:h.id,title:h.title,sub:h.subject,date:h.dueDate,days:daysUntil(h.dueDate)}));
      activities.filter(a=>a.status!=='completed').forEach(a=>{const s=startOfDay(parseLocal(a.startDate));if(s>=today) list.push({type:'activity',id:a.id,title:a.title,sub:a.description,date:a.startDate,days:daysUntil(a.startDate)})});
      list.sort((a,b)=>a.days-b.days);
      const c=document.getElementById('upcoming-tasks'); if(!c) return;
      if(!list.length){c.innerHTML='<div class="text-center text-gray-500 py-8">ไม่มีงานที่กำลังมาถึง</div>';return}
      c.innerHTML=list.slice(0,5).map(item=>`<button class='w-full text-left flex items-center justify-between p-4 bg-white rounded-xl border hover:bg-slate-50' onclick="openUpcoming('${item.type}', ${item.id})">
        <div class='flex items-center gap-3'>
          <div class='text-2xl'>${item.type==='homework'?'📝':'🎯'}</div>
          <div><div class='font-semibold text-slate-900'>${item.title}</div><div class='text-sm text-slate-600'>${item.sub||''}</div></div>
        </div>
        <div class='text-right'>
          <div class='text-sm font-semibold ${item.days<0?'text-rose-600':item.days<=3?'text-amber-600':'text-emerald-600'}'>${item.days<0?'เลยกำหนดแล้ว':item.days===0?'วันนี้':`เหลืออีก ${item.days} วัน`}</div>
          <div class='text-xs text-slate-500'>${thaiDate(item.date)}</div>
        </div>
      </button>`).join('');
    }
    function openUpcoming(type,id){ if(type==='homework'){showHomeworkDetail(id)} else{showActivityDetail(id)} }

    // ===== Homework list (clickable block) =====
    let activeFilter='all';
    function filterHomework(f){
      activeFilter=f;
      document.querySelectorAll('.filter-btn').forEach(b=>{b.classList.remove('bg-white','text-slate-700','shadow-sm');b.classList.add('text-slate-600')});
      const btn=document.getElementById(`filter-${f}`); if(btn){btn.classList.add('bg-white','text-slate-700','shadow-sm')}
      displayHomework();
    }
    function updateHomeworkCounts(){
      homework.forEach(h=>{if(h.status!=='completed' && daysUntil(h.dueDate)<0) h.status='overdue'});
      const counts={all:homework.length,pending:homework.filter(h=>h.status==='pending').length,overdue:homework.filter(h=>h.status==='overdue').length,completed:homework.filter(h=>h.status==='completed').length};
      for(const k in counts){const el=document.getElementById(`count-${k}`); if(el) el.textContent=counts[k];}
    }
    function displayHomework(){
      updateHomeworkCounts();
      let data=activeFilter==='all'?homework:homework.filter(h=>h.status===activeFilter);
      const c=document.getElementById('homework-list'); if(!c) return;
      if(!data.length){c.innerHTML='<div class="text-center text-gray-500 py-8">ไม่มีการบ้าน</div>';return}
      c.innerHTML=data.map(h=>{
        const d=daysUntil(h.dueDate);
        let badge='';
        if(h.status==='completed') badge='<span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">เสร็จแล้ว</span>';
        else if(h.status==='overdue') badge='<span class="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full">เลยกำหนด</span>';
        else if(d<=3) badge=`<span class='bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full'>เหลืออีก ${d} วัน</span>`;
        else badge=`<span class='bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full'>เหลืออีก ${d} วัน</span>`;
        return `<div class='task-card bg-white rounded-xl p-4' data-type='homework' data-id='${h.id}'>
          <div class='flex items-start justify-between'>
            <div>
              <div class='flex gap-2 mb-1'><span class='bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full'>${h.subject}</span>${badge}</div>
              <div class='font-semibold'>${h.title}</div>
              <div class='text-sm text-slate-600'>กำหนด: ${thaiDate(h.dueDate)}</div>
            </div>
            <div class='flex gap-2'>
              <button class='p-2 text-slate-600 hover:bg-slate-100 rounded-lg action-edit' title='แก้ไข'>🖉</button>
              <button class='p-2 text-rose-600 hover:bg-rose-50 rounded-lg action-delete' title='ลบ'>🗑</button>
            </div>
          </div>
        </div>`
      }).join('');
    }

    // ===== Activities list (clickable block) =====
    function updateActivities(){
      const c=document.getElementById('activities-list'); if(!c) return;
      if(!activities.length){c.innerHTML='<div class="text-center text-gray-500 py-8">ยังไม่มีกิจกรรม</div>';return}
      const sorted=[...activities].sort((a,b)=>parseLocal(a.startDate)-parseLocal(b.startDate));
      c.innerHTML=sorted.map(a=>{
        const isCompleted=a.status==='completed';
        const statusBadge=isCompleted?'<span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">เสร็จแล้ว</span>':'';
        return `<div class='task-card bg-white rounded-xl p-4' data-type='activity' data-id='${a.id}'>
          <div class='flex items-start justify-between'>
            <div>
              <div class='mb-1 flex items-center gap-2'><span class='font-semibold'>${a.title}</span>${statusBadge}</div>
              <div class='text-sm text-slate-600 mb-1'>${a.description||''}</div>
              <div class='text-xs text-slate-500'>${thaiDate(a.startDate)} - ${thaiDate(a.endDate)}</div>
            </div>
            <div class='flex gap-2'>
              <button class='p-2 text-slate-600 hover:bg-slate-100 rounded-lg action-edit' title='แก้ไข'>🖉</button>
              <button class='p-2 text-rose-600 hover:bg-rose-50 rounded-lg action-delete' title='ลบ'>🗑</button>
            </div>
          </div>
        </div>`
      }).join('');
    }

    // ===== Event delegation (whole card clickable) =====
    document.addEventListener('click', (e)=>{
      const card = e.target.closest('.task-card');
      if(!card) return;
      const type = card.getAttribute('data-type');
      const id = Number(card.getAttribute('data-id'));
      if(Number.isNaN(id)) return;
      // action buttons
      if(e.target.closest('.action-edit')){ e.stopPropagation(); if(type==='homework') editHomework(id); else editActivity(id); return; }
      if(e.target.closest('.action-delete')){ e.stopPropagation(); if(type==='homework') openDeleteConfirm('homework', id); else openDeleteConfirm('activity', id); return; }
      // open details
      if(type==='homework') showHomeworkDetail(id); else showActivityDetail(id);
    });

    // ===== Detail Views =====
    function showHomeworkDetail(id){
      const h=homework.find(x=>x.id===id); if(!h) return;
      const titleEl=document.getElementById('detail-title'); if(titleEl) titleEl.textContent='รายละเอียดการบ้าน';
      const body=document.getElementById('detail-body'); if(!body) return;
      body.innerHTML=`
        <div class='space-y-2'>
          <div class='text-lg font-bold'>${h.title}</div>
          <div class='text-slate-600'>วิชา: ${h.subject}</div>
          <div class='text-sm text-slate-500'>กำหนดส่ง: ${thaiDate(h.dueDate)}</div>
          <div class='flex flex-wrap gap-2 pt-1'>
            ${h.status!=='completed'?`<button class='btn bg-emerald-600 text-white' onclick='markHomeworkDone(${h.id})'>ทำเสร็จแล้ว</button>`:'<span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs">เสร็จแล้ว</span>'}
            <button class='btn bg-sky-600 text-white' onclick='editHomework(${h.id})'>แก้ไข</button>
            <button class='btn bg-rose-600 text-white' onclick="openDeleteConfirm('homework', ${h.id})">ลบ</button>
          </div>
        </div>`;
      openModal('detail-modal');
    }
    function showActivityDetail(id){
      const a=activities.find(x=>x.id===id); if(!a) return;
      const titleEl=document.getElementById('detail-title'); if(titleEl) titleEl.textContent='รายละเอียดกิจกรรม';
      const body=document.getElementById('detail-body'); if(!body) return;
      body.innerHTML=`
        <div class='space-y-2'>
          <div class='text-lg font-bold'>${a.title}</div>
          <div class='text-slate-600'>${a.description||''}</div>
          <div class='text-sm text-slate-500'>${thaiDate(a.startDate)} - ${thaiDate(a.endDate)}</div>
          <div class='flex gap-2 pt-1'>
            ${a.status!=='completed'?`<button class='btn bg-emerald-600 text-white' onclick='markActivityDone(${a.id})'>ทำเสร็จแล้ว</button>`:'<span class="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs">เสร็จแล้ว</span>'}
            <button class='btn bg-sky-600 text-white' onclick='editActivity(${a.id})'>แก้ไข</button>
            <button class='btn bg-rose-600 text-white' onclick="openDeleteConfirm('activity', ${a.id})">ลบ</button>
          </div>
        </div>`;
      openModal('detail-modal');
    }

    // ===== CRUD (Homework) =====
    function populateSubjectDropdown(){ const dd=document.getElementById('homework-subject'); if(dd) dd.innerHTML=subjects.map(s=>`<option value='${s}'>${s}</option>`).join(''); }
    function showAddHomework(){ editingId=null; populateSubjectDropdown(); const f=document.getElementById('homework-form'); if(f) f.reset(); openModal('add-homework-modal'); }
    function closeAddHomework(){ closeModal('add-homework-modal'); }
    function saveHomework(e){ e.preventDefault(); const subject=document.getElementById('homework-subject').value; const title=document.getElementById('homework-title').value.trim(); const dueDate=document.getElementById('homework-date').value; const status=document.getElementById('homework-status').value; if(!subject||!title||!dueDate) return; if(editingId){ const i=homework.findIndex(h=>h.id===editingId); if(i>-1) homework[i]={...homework[i],subject,title,dueDate,status}; editingId=null; } else { homework.push({id:Date.now(),subject,title,dueDate,status}); } closeAddHomework(); displayHomework(); updateUpcoming(); updateCalendar(); }
    function editHomework(id){ const h=homework.find(x=>x.id===id); if(!h) return; editingId=id; populateSubjectDropdown(); document.getElementById('homework-subject').value=h.subject; document.getElementById('homework-title').value=h.title; document.getElementById('homework-date').value=h.dueDate; document.getElementById('homework-status').value=h.status; closeModal('detail-modal'); openModal('add-homework-modal'); }
    function markHomeworkDone(id){ const h=homework.find(x=>x.id===id); if(!h) return; h.status='completed'; displayHomework(); updateUpcoming(); updateCalendar(); showHomeworkDetail(id); }

    // ===== CRUD (Activity) =====
    function showAddActivity(){ editingId=null; const f=document.getElementById('activity-form'); if(f) f.reset(); openModal('add-activity-modal'); }
    function closeAddActivity(){ closeModal('add-activity-modal'); }
    function saveActivity(e){ e.preventDefault(); const title=document.getElementById('activity-title').value.trim(); const description=document.getElementById('activity-description').value.trim(); const startDate=document.getElementById('activity-start-date').value; const endDate=document.getElementById('activity-end-date').value; if(!title||!startDate||!endDate) return; if(editingId){ const i=activities.findIndex(a=>a.id===editingId); if(i>-1) activities[i]={...activities[i],title,description,startDate,endDate}; editingId=null; } else { activities.push({id:Date.now(),title,description,startDate,endDate,status:'planned'}); } closeAddActivity(); updateActivities(); updateUpcoming(); updateCalendar(); }
    function editActivity(id){ const a=activities.find(x=>x.id===id); if(!a) return; editingId=id; document.getElementById('activity-title').value=a.title; document.getElementById('activity-description').value=a.description; document.getElementById('activity-start-date').value=a.startDate; document.getElementById('activity-end-date').value=a.endDate; closeModal('detail-modal'); openModal('add-activity-modal'); }
    function markActivityDone(id){ const a=activities.find(x=>x.id===id); if(!a) return; a.status='completed'; updateActivities(); updateUpcoming(); updateCalendar(); showActivityDetail(id); }

    // ===== Subjects =====
    function showSubjectSettings(){ updateSubjectsList(); openModal('subject-settings-modal'); }
    function closeSubjectSettings(){ closeModal('subject-settings-modal'); }
    function addSubject(){ const v=document.getElementById('new-subject').value.trim(); if(v && !subjects.includes(v)){ subjects.push(v); document.getElementById('new-subject').value=''; updateSubjectsList(); populateSubjectDropdown(); } }
    function removeSubject(name){ subjects=subjects.filter(s=>s!==name); updateSubjectsList(); populateSubjectDropdown(); }
    function updateSubjectsList(){ const c=document.getElementById('subjects-list'); if(!c) return; c.innerHTML=subjects.map(s=>`<div class='flex justify-between items-center p-2 bg-gray-50 rounded-lg'><span class='text-sm'>${s}</span><button class='text-rose-600 hover:text-rose-700' onclick="removeSubject('${s.replace(/'/g,"\\'")}')">ลบ</button></div>`).join(''); }

    // ===== Delete confirm =====
    function openDeleteConfirm(type,id){ deleteTarget={type,id}; closeModal('add-homework-modal'); closeModal('add-activity-modal'); closeModal('detail-modal'); openModal('delete-modal'); }
    function closeDeleteConfirm(){ deleteTarget=null; closeModal('delete-modal'); }
    function confirmDelete(){ if(!deleteTarget) return; const {type,id}=deleteTarget; if(type==='homework'){ homework=homework.filter(h=>h.id!==id); displayHomework(); updateUpcoming(); updateCalendar(); } else { activities=activities.filter(a=>a.id!==id); updateActivities(); updateUpcoming(); updateCalendar(); } closeDeleteConfirm(); }

    // ===== Modal helpers with guards (fix classList null) =====
    function openModal(id){ const el=document.getElementById(id); if(!el) return; el.classList.remove('hidden'); document.body.classList.add('overflow-hidden'); }
    function closeModal(id){ const el=document.getElementById(id); if(!el) return; el.classList.add('hidden'); const ids=['day-modal','detail-modal','add-homework-modal','add-activity-modal','subject-settings-modal','delete-modal']; const anyOpen=ids.some(mid=>{ const m=document.getElementById(mid); return m && !m.classList.contains('hidden'); }); if(!anyOpen) document.body.classList.remove('overflow-hidden'); }
    function closeDetail(){ closeModal('detail-modal'); }
    function closeDayModal(){ closeModal('day-modal'); }

    // ===== Init =====
    document.addEventListener('DOMContentLoaded',()=>{
      // สร้าง Subject dropdown ถ้ามีฟอร์ม
      populateSubjectDropdown();
      updateCalendar(); updateUpcoming(); displayHomework(); updateActivities();
      // self test
      try{ const grid=document.getElementById('calendar-grid'); if(grid) console.assert(grid.children.length===42,'calendar should render 42 cells'); }catch{}
    });
  </script>
</body>
</html>
