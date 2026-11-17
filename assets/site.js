'use strict';
(() => {
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const icon=(name,cls='')=>`<svg class="icon ${cls}" aria-hidden="true"><use href="#${name}"/></svg>`;
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const val=(id,def=0)=>{const n=Number(($(id)?.value||'').replace(',','.'));return Number.isFinite(n)&&n>0?n:def;};
  const selected=(name)=>$(`input[name="${name}"]:checked`)?.value||'';
  const toast=$('#toast'); let toastTimeout;
  function notify(text){if(!toast)return;toast.textContent=text;toast.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('show'),3500)}
  async function copyText(content){try{if(navigator.clipboard?.writeText && window.isSecureContext){await navigator.clipboard.writeText(content);notify('Текст заявки скопирован. Откройте VK и вставьте его в сообщение.');return true}}
    catch(_){/* try local fallback */}
    const t=document.createElement('textarea');t.value=content;t.style.cssText='position:fixed;top:-9999px;opacity:0';document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}t.remove();
    if(ok){notify('Текст заявки скопирован. Теперь его можно отправить через VK.');return true}
    window.prompt('Скопируйте подготовленный запрос:',content);notify('Вы можете вручную скопировать текст заявки.');return false;
  }
  // Navigation
  const menu=$('.menu-btn'), mobile=$('#mobile-nav');
  if(menu&&mobile){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));mobile.hidden=open;menu.innerHTML=icon(open?'menu':'x')});
  $$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.innerHTML=icon('menu')}));}
  // reveal animation: support reduced motion / no observer
  const reveal=$$('.reveal');if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.06,rootMargin:'0px 0px 80px 0px'});reveal.forEach(el=>observer.observe(el))}else reveal.forEach(el=>el.classList.add('visible'));

  // source-grounded descriptive portfolio, artwork explicitly illustrative
  const works={
    bathroom:{title:'Парящий потолок и теневой профиль',kind:'Потолки',date:'16 ноября 2026',place:'Ванная и туалет',src:'work-bathroom.svg',detail:'Публикация о завершении ремонта ванной комнаты и туалета по дизайн-проекту. В числе работ названы теневой профиль и парящий потолок.',note:'Упомянутые в публикации 70 000 ₽ — стоимость комплекса ремонтных работ, а не тариф на установку потолка.',link:'potolki.html#calculator'},
    balcony:{title:'Натяжной потолок на балконе',kind:'Потолки',date:'12 ноября 2026',place:'Балкон',src:'work-balcony.svg',detail:'В сообществе показана выполненная работа по натяжному потолку на балконе. Подробные характеристики материала и стоимость не названы.',note:'Иллюстрация демонстрационная, точные параметры уточняются у компании.',link:'potolki.html#calculator'},
    workplace:{title:'Мебель для рабочего места школьника',kind:'Корпусная мебель',date:'9 ноября 2026',place:'Рабочее место',src:'work-study.svg',detail:'Компания предлагает изготовление мебели для рабочего места школьника по индивидуальным размерам.',note:'Источник не доказывает завершённый заказ именно этого рабочего места. На сайте это направление услуг, а не выдуманный выполненный проект.',link:'mebel.html#calculator'},
    interior:{title:'Мебель в готовом интерьере',kind:'Корпусная мебель',date:'5 ноября 2026',place:'Мебельный проект',src:'work-cabinet.svg',detail:'Опубликованы фотографии установленной мебели в готовом интерьере.',note:'Размеры, материалы и стоимость данного объекта не подтверждены; визуализация авторская.',link:'mebel.html#calculator'},
    trousers:{title:'Дополнение шкафа брючницей',kind:'Корпусная мебель',date:'2 ноября 2026',place:'Внутреннее наполнение',src:'work-wardrobe.svg',detail:'В ранее изготовленный компанией шкаф клиенту установили дополнительный элемент — брючницу.',note:'Показываем пример решения по хранению, не конкретный шкаф с оригинальной фотографии.',link:'mebel.html#calculator'},
    level:{title:'Двухуровневый потолок с подсветкой',kind:'Потолки',date:'22 октября 2026',place:'Ул. Ивана Франко, 46',src:'work-ceiling-level.svg',detail:'Двухуровневый натяжной потолок с подсветкой; в публикации указан адрес объекта на улице Ивана Франко.',note:'Это адрес объекта, а не подтверждённый адрес офиса компании. Изображение выполнено как иллюстративный эскиз.',link:'potolki.html#calculator'},
    partition:{title:'Перегородка, карниз и свет',kind:'Комплексное решение',date:'21 октября 2026',place:'ЖК «Погода»',src:'work-partition.svg',detail:'В публикации показаны стеклянная перегородка, потолочный карниз и точечные светильники.',note:'Техническая спецификация и состав услуги подлежат уточнению у исполнителя.',link:'potolki.html#calculator'}
  };
  // Portfolio tabs / modal
  const filters=$$('.filter-btn'), cards=$$('.portfolio-grid .work-card');
  function setFilter(filter){filters.forEach(btn=>{const active=btn.dataset.filter===filter;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});cards.forEach(card=>card.hidden=filter!=='all'&&card.dataset.category!==filter);}
  filters.forEach(btn=>btn.addEventListener('click',()=>{setFilter(btn.dataset.filter);const url=new URL(location.href);if(btn.dataset.filter==='all')url.searchParams.delete('filter');else url.searchParams.set('filter',btn.dataset.filter);history.replaceState({},'',url)}));
  if(filters.length){const fromUrl=new URLSearchParams(location.search).get('filter');if(['potolki','mebel'].includes(fromUrl))setFilter(fromUrl)}
  const modal=$('#work-modal');let previousFocus;
  function openModal(id){if(!modal||!works[id])return;const w=works[id];previousFocus=document.activeElement;$('#modal-title').textContent=w.title;$('#modal-kind').textContent=w.kind.toUpperCase();$('#modal-meta').textContent=`${w.date} · ${w.place}`;$('#modal-detail').textContent=w.detail;$('#modal-note').textContent=w.note;$('#modal-img').src='assets/'+w.src;$('#modal-img').alt='Авторская иллюстрация: '+w.title;$('#modal-cta').href=w.link;modal.hidden=false;document.body.classList.add('modal-open');$('.modal-close',modal).focus()}
  function closeModal(){if(!modal)return;modal.hidden=true;document.body.classList.remove('modal-open');previousFocus?.focus?.()}
  $$('.work-card[data-work]').forEach(card=>{if(card.tagName==='BUTTON')card.addEventListener('click',()=>openModal(card.dataset.work))});
  if(modal){const requested=new URLSearchParams(location.search).get('project');if(requested&&works[requested])openModal(requested)}
  $('.modal-close',modal||document)?.addEventListener('click',closeModal);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  document.addEventListener('keydown',e=>{if(!modal||modal.hidden)return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){const items=$$('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',modal).filter(x=>!x.hidden);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});

  // Photo previews are client-only, never uploaded, object URLs are revoked
  const uploads=new Map();
  $$('.photo-drop').forEach(drop=>{
    const input=$('.photo-input',drop), output=$('.photo-thumbs',drop.parentElement), key=input;
    let files=[];
    const draw=()=>{output.replaceChildren();files.forEach((obj,i)=>{const node=document.createElement('div');node.className='photo-thumb';const img=document.createElement('img');img.src=obj.url;img.alt='Фото помещения '+(i+1);const btn=document.createElement('button');btn.type='button';btn.textContent='×';btn.setAttribute('aria-label','Удалить фото '+(i+1));btn.addEventListener('click',()=>{URL.revokeObjectURL(obj.url);files.splice(i,1);draw()});node.append(img,btn);output.append(node)})};
    uploads.set(key,{getFiles:()=>files.map(o=>o.file),clear:()=>{files.forEach(o=>URL.revokeObjectURL(o.url));files=[];draw()}});
    input.addEventListener('change',()=>{const list=Array.from(input.files||[]);let added=0;for(const f of list){if(!f.type.startsWith('image/'))continue;if(f.size>12*1024*1024){notify('Фото больше 12 МБ пропущено.');continue}if(files.length>=3)break;files.push({file:f,url:URL.createObjectURL(f)});added++}if(list.length>added&&files.length===3)notify('Можно добавить максимум три фотографии.');input.value='';draw()});
  });
  window.addEventListener('pagehide',()=>{uploads.forEach(o=>o.clear())});

  // Ceiling visual constructor
  const cf=$('#ceiling-form');
  const ceilSvg=$('#ceiling-dynamic');
  function ceilingValues(){return {shape:selected('ceiling-shape'),length:val('#ceil-length',4.2),width:val('#ceil-width',3.5),finish:selected('ceiling-finish'),profile:selected('ceiling-profile'),spots:$('#ceil-spots')?.checked,spotCount:Math.round(val('#ceil-spots-range',6)),line:$('#ceil-line')?.checked,track:$('#ceil-track')?.checked,comment:$('#ceil-comment')?.value.trim()||''}}
  function drawCeiling(){if(!cf)return;const v=ceilingValues();const g=$('#spot-count-group');if(g)g.hidden=!v.spots;$('#ceil-spots-num').textContent=v.spotCount+' шт.';
    const pts=v.shape==='Г-образная'?'15,130 310,18 530,130 422,179 314,145 200,199 230,263':v.shape==='Сложная'?'15,130 180,65 254,92 310,18 530,130 230,263':'15,130 310,18 530,130 230,263';
    const surface=v.finish==='Матовая'?'#f8f5ed':v.finish==='Сатиновая'?'#e8e8e1':'#dbe7e6';
    const edge=v.profile==='Парящий контур'?'#e9bb78':v.profile==='Теневой профиль'?'#263631':'#a2a39a';
    let out=`<defs><filter id="glow-c"><feGaussianBlur stdDeviation="7"/></filter></defs><polygon points="${pts}" fill="${surface}" stroke="${edge}" stroke-width="${v.profile==='Парящий контур'?13:8}" stroke-linejoin="round"/>`;
    if(v.profile==='Парящий контур')out+=`<polygon points="${pts}" fill="none" stroke="#ffe4ab" stroke-width="22" opacity=".65" filter="url(#glow-c)"/>`;
    if(v.finish==='Глянцевая')out+='<path d="M70 145 302 55 454 133 219 232Z" fill="#fff" opacity=".4"/>';
    if(v.track)out+='<path d="M45 140 250 253" stroke="#52625d" stroke-width="8" stroke-linecap="round"/><path d="M48 136 245 247" stroke="#e9e9e3" stroke-width="3"/>';
    if(v.line){out+='<path d="M156 115 343 51" stroke="#fff4d9" stroke-width="15" filter="url(#glow-c)" opacity=".95"/><path d="M156 115 343 51" stroke="#eeb976" stroke-width="6" stroke-linecap="round"/>'}
    if(v.spots){const points=[[120,139],[205,96],[291,64],[240,202],[322,163],[401,122],[177,175],[350,104],[281,139],[365,146],[221,133],[300,180]];for(const [x,y] of points.slice(0,v.spotCount)){out+=`<circle cx="${x}" cy="${y}" r="21" fill="#f9dd9f" opacity=".68" filter="url(#glow-c)"/><circle cx="${x}" cy="${y}" r="6" fill="#edc990" stroke="#fff7e4" stroke-width="3"/>`}}
    ceilSvg.innerHTML=out;
    $('#ceil-area').textContent=v.shape==='Прямоугольная'?`Габариты: ${(v.length*v.width).toFixed(1).replace('.',',')} м² (прибл.)`:'Площадь уточняется после замера';
    const chips=[v.shape,`${v.length} × ${v.width} м`,v.finish,v.profile];if(v.spots)chips.push(`${v.spotCount} светильников`);if(v.line)chips.push('Световая линия');if(v.track)chips.push('Карниз');$('#ceil-chips').replaceChildren(...chips.map(t=>{let span=document.createElement('span');span.textContent=t;return span}));
  }
  if(cf){cf.addEventListener('input',drawCeiling);cf.addEventListener('change',drawCeiling);drawCeiling()}
  function ceilingText(){const v=ceilingValues();const photos=uploads.get($('.photo-input',cf))?.getFiles().length||0;return `Здравствуйте! Хочу получить предварительный расчёт натяжного потолка в «Союз-Пермь».\nФорма помещения: ${v.shape}\nПримерные габариты: ${v.length} × ${v.width} м\nФактура: ${v.finish}\nПримыкание: ${v.profile}\nТочечные светильники: ${v.spots?`${v.spotCount} шт.`:'не планируются'}\nСветовая линия: ${v.line?'нужна':'не нужна'}\nПотолочный карниз: ${v.track?'нужен':'не нужен'}\nПожелания: ${v.comment||'нет'}\nФото помещения: ${photos?'подготовлю '+photos+' шт.':'не выбраны'}\nПодскажите стоимость, условия замера и реализации.`}

  // Furniture live preview
  const ff=$('#furniture-form'), furnitureSvg=$('#furniture-dynamic');
  function furnitureValues(){return {kind:selected('furniture-kind'),w:val('#fur-width',2400),h:val('#fur-height',2600),d:val('#fur-depth',600),color:selected('fur-color'),shelves:$('#fur-shelves')?.checked,drawers:$('#fur-drawers')?.checked,rail:$('#fur-rail')?.checked,light:$('#fur-light')?.checked,budget:$('#fur-budget')?.value||'Нужна консультация',comment:$('#fur-comment')?.value.trim()||''}}
  const paint={'Светлый':'#d6cfbf','Дуб':'#b48a67','Графит':'#596560','Шалфей':'#90a496'};
  function drawFurniture(){if(!ff)return;const v=furnitureValues(),c=paint[v.color]||paint['Светлый'];const scaleX=clamp(v.w/2400,.62,1.28),scaleY=clamp(v.h/2600,.62,1.1);let out='';
    if(v.kind==='Встроенный шкаф'||v.kind==='Система хранения'){
      const x=135,y=104,w=340*scaleX,h=270*scaleY;out+=`<rect x="${x-12}" y="${y-12}" width="${w+24}" height="${h+24}" fill="#5b594d" opacity=".2"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><rect x="${x+7}" y="${y+8}" width="${w-14}" height="${h-16}" fill="${c}" stroke="#ffffff" stroke-opacity=".5" stroke-width="2"/>`;
      if(v.kind==='Система хранения'){
        const sw=(w-21)/3;for(let col=0;col<3;col++){out+=`<rect x="${x+8+col*(sw+2)}" y="${y+9}" width="${sw}" height="${h-18}" fill="${c}" stroke="#847260" stroke-width="2"/>`;if(v.shelves)for(let j=1;j<=3;j++)out+=`<path d="M${x+8+col*(sw+2)} ${y+9+j*(h-18)/4}h${sw}" stroke="#6a6054" stroke-width="5"/>`}
      }else{const sw=w/3;for(let i=1;i<3;i++)out+=`<path d="M${x+i*sw} ${y}v${h}" stroke="#807766" stroke-width="2"/>`;for(let i=0;i<3;i++)out+=`<path d="M${x+(i+1)*sw-12} ${y+h*.5-21}v42" stroke="#f2eadf" stroke-width="4" stroke-linecap="round"/>`;
        if(v.shelves)for(let j=0;j<3;j++)out+=`<path d="M${x+14} ${y+28+j*36}h${sw-28}" stroke="#5a6158" stroke-opacity=".5" stroke-width="4"/>`}
      if(v.drawers)for(let i=0;i<2;i++){out+=`<rect x="${x+20}" y="${y+h-77+i*35}" width="${Math.min(112,w*.32)}" height="31" fill="#c3ab8d" fill-opacity=".38" stroke="#6f6458" stroke-opacity=".55"/><path d="M${x+52} ${y+h-60+i*35}h48" stroke="#6e5c4c" stroke-width="3"/>`}
      if(v.rail)out+=`<path d="M${x+w*.45} ${y+50}h${w*.45}" stroke="#686a64" stroke-width="5" stroke-linecap="round"/><path d="M${x+w*.67} ${y+50}v65" stroke="#b2a28a" stroke-width="2"/>`;
      if(v.light)out+=`<rect x="${x+3}" y="${y+3}" width="${w-6}" height="5" fill="#ffe5af"/><rect x="${x+3}" y="${y+3}" width="${w-6}" height="19" fill="#ffe5af" opacity=".25"/>`;
    }else{
      out+=`<rect x="150" y="122" width="270" height="255" fill="${c}"/><rect x="167" y="143" width="234" height="83" fill="#f5f0e6"/><rect x="167" y="234" width="234" height="99" fill="#f5f0e6"/>`;
      if(v.kind==='Рабочее место')out+=`<rect x="118" y="293" width="380" height="19" fill="${c}"/><path d="M135 311v74M479 311v74" stroke="#4d594f" stroke-width="12"/><rect x="181" y="245" width="140" height="45" rx="4" fill="#394c4b"/><rect x="189" y="250" width="123" height="34" fill="#94afa8"/><path d="M235 291h32" stroke="#dddcd2" stroke-width="6"/>`;
      else out+=`<rect x="130" y="306" width="360" height="27" fill="${c}"/><path d="M160 333v56M468 333v56" stroke="#4f544c" stroke-width="11"/>`;
      if(v.shelves)for(let i=0;i<3;i++)out+=`<path d="M${174} ${162+i*23}h220" stroke="#b5a593" stroke-width="6"/>`;
      if(v.drawers)for(let i=0;i<2;i++)out+=`<rect x="${340}" y="${320+i*27}" width="${110}" height="24" fill="${c}" stroke="#6a6055"/><path d="M380 ${333+i*27}h29" stroke="#eae3d3" stroke-width="3"/>`;
      if(v.light)out+='<path d="M162 133h236" stroke="#ffdda2" stroke-width="12" opacity=".8"/>';
      if(v.rail)out+='<path d="M201 157h159" stroke="#4e5e58" stroke-width="6"/>';
    }
    furnitureSvg.innerHTML=out;$('#fur-dimensions').textContent=`${v.w} × ${v.h} × ${v.d} мм`;
    let chips=[v.kind,v.color,`${v.w} × ${v.h} × ${v.d} мм`];if(v.shelves)chips.push('Полки');if(v.drawers)chips.push('Ящики');if(v.rail)chips.push('Штанга');if(v.light)chips.push('Подсветка');$('#fur-chips').replaceChildren(...chips.map(t=>{const span=document.createElement('span');span.textContent=t;return span}));
  }
  if(ff){ff.addEventListener('input',drawFurniture);ff.addEventListener('change',drawFurniture);drawFurniture()}
  function furnitureText(){const v=furnitureValues(),photos=uploads.get($('.photo-input',ff))?.getFiles().length||0;return `Здравствуйте! Хотелось бы обсудить мебель на заказ в «Союз-Пермь».\nТип: ${v.kind}\nПримерные габариты: ${v.w} × ${v.h} × ${v.d} мм\nЦветовое направление: ${v.color}\nПолки: ${v.shelves?'да':'нет'}\nВыдвижные ящики: ${v.drawers?'да':'нет'}\nШтанга для одежды: ${v.rail?'да':'нет'}\nПодсветка: ${v.light?'да':'нет'}\nБюджет: ${v.budget}\nПожелания: ${v.comment||'нет'}\nФото помещения: ${photos?'подготовлю '+photos+' шт.':'не выбраны'}\nПодскажите, пожалуйста, возможность изготовления, примерную стоимость и условия замера.`}
  $$('.copy-inquiry').forEach(btn=>btn.addEventListener('click',()=>{
    const isCeil=btn.dataset.type==='ceiling',form=isCeil?cf:ff;
    if(!form)return;
    const w=isCeil?$('#ceil-width'):$('#fur-width'),h=isCeil?$('#ceil-length'):$('#fur-height');
    if(!(Number(w.value)>0&&Number(h.value)>0)){notify('Проверьте размеры: они должны быть больше нуля.');w.focus();return}
    const text=isCeil?ceilingText():furnitureText();copyText(text);
    const m=$('.form-message',form);m.textContent='Заявка подготовлена. Откройте сообщения ВКонтакте и вставьте скопированный текст. Фотографии прикрепите вручную.';m.classList.add('is-visible');
  }));
})();
