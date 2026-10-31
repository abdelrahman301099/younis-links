(() => {
  'use strict';
  const data = window.LIBRARY_CONTENT;
  const state = {type:'all', unit:'all', query:'', sort:'lesson'};
  const ar = value => Number(value).toLocaleString('ar-EG');
  const normalize = value => value.normalize('NFKC').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064B-\u065F\u0640]/g,'').toLowerCase().trim();
  const labels = {all:'كل الملفات', explanation:'شرح الدروس', questions:'الأسئلة', review:'المراجعات'};
  const cards = document.getElementById('cards');
  const empty = document.getElementById('empty');
  document.getElementById('year').textContent = new Date().getFullYear().toLocaleString('ar-EG',{useGrouping:false});
  document.getElementById('unit-count').textContent = ar(data.units.length);
  document.getElementById('file-count').textContent = ar(data.files.length);
  function unitButton(id, title, count) {
    const button = document.createElement('button');
    button.dataset.unit = id;
    button.append(document.createTextNode(title));
    const badge = document.createElement('span'); badge.textContent = ar(count); button.append(badge);
    button.addEventListener('click', () => {state.unit = id; render();});
    return button;
  }
  const filters = document.getElementById('unit-filters');
  filters.append(unitButton('all','كل الوحدات',data.files.length));
  data.units.forEach(unit => filters.append(unitButton(unit.id,unit.title,data.files.filter(f => f.unit === unit.id).length)));
  function render() {
    const query = normalize(state.query);
    let files = data.files.filter(file => (state.type === 'all' || file.type === state.type) && (state.unit === 'all' || file.unit === state.unit) && normalize([file.title,file.description, data.units.find(u => u.id === file.unit)?.title, labels[file.type]].join(' ')).includes(query));
    files.sort(state.sort === 'newest' ? (a,b) => (b.added || '').localeCompare(a.added || '') || b.order-a.order : (a,b) => a.order-b.order);
    cards.replaceChildren();
    files.forEach(file => {
      const article = document.createElement('article'); article.className = `card ${file.type}`;
      const top = document.createElement('div'); top.className = 'card-top';
      const icon = document.createElement('span'); icon.className = 'file-icon'; icon.textContent = 'PDF'; icon.setAttribute('aria-hidden','true');
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = data.units.find(u => u.id === file.unit)?.title || (file.type === 'review' ? 'مراجعة عامة' : 'الدروس الأساسية');
      top.append(icon,tag);
      const title = document.createElement('h4'); title.textContent = file.title;
      const description = document.createElement('p'); description.textContent = file.description;
      const meta = document.createElement('div'); meta.className = 'file-meta';
      [labels[file.type], 'PDF', file.size || ''].filter(Boolean).forEach(text => {const span = document.createElement('span');span.textContent=text;meta.append(span);});
      const actions = document.createElement('div'); actions.className = 'card-actions';
      const download = document.createElement('a'); download.className='download';download.textContent='تحميل الملف ↓';download.href=file.path;download.download=file.path.split('/').pop();download.setAttribute('aria-label',`تحميل ${file.title}`);
      const view = document.createElement('a');view.className='view';view.textContent='عرض ↗';view.href=file.path;view.target='_blank';view.rel='noopener noreferrer';view.setAttribute('aria-label',`عرض ${file.title} في نافذة جديدة`);
      actions.append(download,view);article.append(top,title,description,meta,actions);cards.append(article);
    });
    document.getElementById('results-title').textContent=labels[state.type];
    document.getElementById('result-count').textContent=`${ar(files.length)} ملف`;
    document.querySelectorAll('[data-type]').forEach(button => {const active=button.dataset.type===state.type;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('[data-unit]').forEach(button => {const active=button.dataset.unit===state.unit;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
    empty.hidden=files.length>0;
    const noReviews=state.type==='review'&&!data.files.some(file=>file.type==='review');
    document.getElementById('empty-title').textContent=noReviews?'المراجعات هتكون هنا':'لا توجد نتائج';
    document.getElementById('empty-text').textContent=noReviews?'بمجرد إضافة ملفات المراجعة، هتلاقيها في القسم ده للعرض والتحميل.':'جرّب اسمًا آخر أو غيّر اختيار الوحدة.';
  }
  document.querySelectorAll('[data-type]').forEach(button=>button.addEventListener('click',()=>{state.type=button.dataset.type;render();}));
  document.getElementById('search').addEventListener('input',event=>{state.query=event.target.value;render();});
  document.getElementById('sort').addEventListener('change',event=>{state.sort=event.target.value;render();});
  document.getElementById('reset').addEventListener('click',()=>{state.type='all';state.unit='all';state.query='';document.getElementById('search').value='';render();});
  document.querySelector('[data-nav-review]').addEventListener('click',()=>{state.type='review';state.unit='all';state.query='';document.getElementById('search').value='';render();});
  render();
})();
