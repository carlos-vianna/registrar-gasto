const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const DEFAULT_CATS=['Mercado','Restaurante','Transporte','Farmácia','Lazer','Assinaturas','Casa','Axé','Outros'];
const DEFAULT_CARDS=[
{id:'nubank',name:'Nubank',limit:0,closeDay:24,dueDay:1},
{id:'itau',name:'Itaú',limit:0,closeDay:20,dueDay:1},
{id:'picpay',name:'PicPay',limit:0,closeDay:20,dueDay:1},
{id:'mercado-pago',name:'Mercado Pago',limit:0,closeDay:20,dueDay:1}
];
const db={
 get expenses(){return JSON.parse(localStorage.getItem('v2_expenses')||'[]')},
 set expenses(v){localStorage.setItem('v2_expenses',JSON.stringify(v))},
 get cards(){return JSON.parse(localStorage.getItem('v2_cards')||JSON.stringify(DEFAULT_CARDS))},
 set cards(v){localStorage.setItem('v2_cards',JSON.stringify(v))},
 get goal(){return Number(localStorage.getItem('v2_goal')||700)},
 set goal(v){localStorage.setItem('v2_goal',String(v))},
 get endpoint(){return localStorage.getItem('v2_endpoint')||''},
 set endpoint(v){localStorage.setItem('v2_endpoint',v)},
 get theme(){return localStorage.getItem('v2_theme')||'light'},
 set theme(v){localStorage.setItem('v2_theme',v)}
};
let selectedMonth=monthKey(new Date());
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random()}
function parseBRL(v){const n=Number(String(v).replace(/\./g,'').replace(',','.').replace(/[^\d.-]/g,''));return Number.isFinite(n)?n:0}
function monthKey(d){d=new Date(d);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function alertBox(el,text,type='ok'){el.innerHTML=`<div class="alert ${type}">${esc(text)}</div>`;setTimeout(()=>el.innerHTML='',3500)}
function cardName(id){return db.cards.find(c=>c.id===id)?.name||'Outro'}
function expensesOf(month){return db.expenses.filter(e=>monthKey(e.date)===month)}
function goTo(view){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(view).classList.add('active');document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));if(view==='history')renderHistory();if(view==='cards')renderCards();if(view==='settings')renderSettings()}
window.goTo=goTo;
function applyTheme(){document.documentElement.dataset.theme=db.theme;$('themeBtn').textContent=db.theme==='dark'?'☀':'☾'}
function renderSelects(){const cards=db.cards;const options=cards.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');$('expenseCard').innerHTML=options;$('filterCard').innerHTML='<option value="">Todos os cartões</option>'+options;$('expenseCategory').innerHTML=DEFAULT_CATS.map(c=>`<option>${c}</option>`).join('')}
function renderHome(){
 const xs=expensesOf(monthKey(new Date())),spent=xs.reduce((s,e)=>s+e.value,0),goal=db.goal,avail=goal-spent;
 $('availableTxt').textContent=fmt.format(avail);$('goalTxt').textContent=fmt.format(goal);$('spentTxt').textContent=fmt.format(spent);
 const pct=goal?Math.min(spent/goal*100,100):0;$('progressBar').style.width=pct+'%';
 const now=new Date(),day=Math.max(now.getDate(),1),days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate(),avg=spent/day;
 $('dailyAvg').textContent=fmt.format(avg);$('forecast').textContent=fmt.format(avg*days);
 if(spent>=goal)$('budgetAlert').innerHTML='<div class="alert err">Meta mensal atingida ou ultrapassada.</div>';
 else if(spent>=goal*.9)$('budgetAlert').innerHTML='<div class="alert warn">Você já usou 90% da meta.</div>';
 else $('budgetAlert').innerHTML='';
 drawBarChart('cardChart',groupSum(xs,e=>cardName(e.cardId)));
 drawBarChart('categoryChart',groupSum(xs,e=>e.category));
 renderTxList('recentList',xs.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6),true);
}
function groupSum(xs,keyFn){const m={};xs.forEach(x=>{const k=keyFn(x);m[k]=(m[k]||0)+x.value});return m}
function drawBarChart(id,data){
 const c=$(id),ctx=c.getContext('2d'),dpr=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
 const entries=Object.entries(data).sort((a,b)=>b[1]-a[1]).slice(0,6);if(!entries.length){ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted');ctx.font='14px -apple-system';ctx.fillText('Sem dados neste mês.',12,28);return}
 const max=Math.max(...entries.map(e=>e[1])),barH=22,gap=14,labelW=Math.min(120,w*.32);
 ctx.font='13px -apple-system';entries.forEach(([k,v],i)=>{const y=12+i*(barH+gap);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted');ctx.fillText(k.slice(0,16),8,y+15);ctx.fillStyle='#dbeeff';ctx.fillRect(labelW,y,w-labelW-64,barH);ctx.fillStyle='#0a84ff';ctx.fillRect(labelW,y,(w-labelW-64)*(v/max),barH);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text');ctx.fillText(fmt.format(v),w-58,y+15)})
}
function renderTxList(id,xs,compact=false){
 const el=$(id);if(!xs.length){el.innerHTML='<div class="empty">Nenhum gasto encontrado.</div>';return}
 el.innerHTML=xs.map(e=>`<div class="tx" onclick="editExpense('${e.id}')"><div class="tx-left"><b>${esc(e.description)}</b><span>${esc(cardName(e.cardId))} · ${esc(e.category)} · ${new Date(e.date+'T12:00:00').toLocaleDateString('pt-BR')}</span>${compact?'':`<div class="badge ${e.synced?'synced':'pending'}">${e.synced?'Sincronizado':'Pendente'}</div>`}</div><div class="tx-right"><b>${fmt.format(e.value)}</b></div></div>`).join('')
}
function renderHistory(){
 const months=[...new Set(db.expenses.map(e=>monthKey(e.date)))].sort().reverse();if(!months.includes(selectedMonth))months.unshift(selectedMonth);
 $('monthChips').innerHTML=months.map(m=>`<button class="chip ${m===selectedMonth?'active':''}" onclick="selectMonth('${m}')">${new Date(m+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'short',year:'numeric'})}</button>`).join('');
 const q=$('search').value.toLowerCase(),fc=$('filterCard').value;
 let xs=expensesOf(selectedMonth).filter(e=>(!q||e.description.toLowerCase().includes(q))&&(!fc||e.cardId===fc)).sort((a,b)=>new Date(b.date)-new Date(a.date));
 renderTxList('historyList',xs,false)
}
window.selectMonth=m=>{selectedMonth=m;renderHistory()};
function renderCards(){
 const month=monthKey(new Date()),xs=expensesOf(month);
 $('cardsList').innerHTML=db.cards.length?db.cards.map(c=>{const spent=xs.filter(e=>e.cardId===c.id).reduce((s,e)=>s+e.value,0);return `<div class="tx" onclick="editCard('${c.id}')"><div class="tx-left"><b>${esc(c.name)}</b><span>Fecha dia ${c.closeDay||'-'} · vence dia ${c.dueDay||'-'}</span></div><div class="tx-right"><b>${fmt.format(spent)}</b><span>${c.limit?`de ${fmt.format(c.limit)}`:'sem limite cadastrado'}</span></div></div>`}).join(''):'<div class="empty">Nenhum cartão cadastrado.</div>'
}
function renderSettings(){$('settingGoal').value=db.goal.toFixed(2).replace('.',',');$('settingEndpoint').value=db.endpoint}
function openExpense(id=null){
 $('expenseForm').reset();$('expenseId').value='';$('deleteExpense').style.display='none';$('expenseTitle').textContent='Novo gasto';$('expenseDate').value=new Date().toISOString().slice(0,10);
 if(id){const e=db.expenses.find(x=>x.id===id);if(!e)return;$('expenseTitle').textContent='Editar gasto';$('expenseId').value=e.id;$('expenseCard').value=e.cardId;$('expenseValue').value=e.value.toFixed(2).replace('.',',');$('expenseDescription').value=e.description;$('expenseCategory').value=e.category;$('expenseDate').value=e.date;$('expenseNote').value=e.note||'';$('deleteExpense').style.display='block'}
 $('expenseModal').classList.add('open')
}
window.editExpense=openExpense;
function openCard(id=null){
 $('cardForm').reset();$('cardId').value='';
 if(id){const c=db.cards.find(x=>x.id===id);$('cardId').value=c.id;$('cardName').value=c.name;$('cardLimit').value=c.limit?c.limit.toFixed(2).replace('.',','):'';$('cardCloseDay').value=c.closeDay||'';$('cardDueDay').value=c.dueDay||''}
 $('cardModal').classList.add('open')
}
window.editCard=openCard;
async function sendExpense(e){
 if(!db.endpoint)return false;
 const r=await fetch(db.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'upsert',expense:e})});
 const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||'Falha ao sincronizar');return true
}
async function syncAll(){
 if(!db.endpoint)throw new Error('Informe a URL do Apps Script.');
 const xs=db.expenses;for(const e of xs){if(e.synced)continue;await sendExpense(e);e.synced=true}db.expenses=xs;renderAll()
}
function renderAll(){renderSelects();renderHome();if($('history').classList.contains('active'))renderHistory();if($('cards').classList.contains('active'))renderCards()}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>goTo(b.dataset.view));
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$($(b).dataset?.close||b.dataset.close).classList.remove('open'));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
$('openExpense').onclick=()=>openExpense();$('addCardBtn').onclick=()=>openCard();
$('expenseForm').onsubmit=async e=>{e.preventDefault();const value=parseBRL($('expenseValue').value);if(value<=0){alertBox($('expenseMsg'),'Digite um valor válido.','err');return}const id=$('expenseId').value||uid(),old=db.expenses.find(x=>x.id===id);const obj={id,cardId:$('expenseCard').value,value,description:$('expenseDescription').value.trim(),category:$('expenseCategory').value,date:$('expenseDate').value,note:$('expenseNote').value.trim(),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now(),synced:false};let xs=db.expenses.filter(x=>x.id!==id);xs.push(obj);db.expenses=xs;renderAll();$('expenseModal').classList.remove('open');if(db.endpoint){try{await sendExpense(obj);db.expenses=db.expenses.map(x=>x.id===id?{...x,synced:true}:x);renderAll()}catch{}}};
$('deleteExpense').onclick=()=>{const id=$('expenseId').value;if(confirm('Excluir este gasto?')){db.expenses=db.expenses.filter(x=>x.id!==id);$('expenseModal').classList.remove('open');renderAll()}};
$('cardForm').onsubmit=e=>{e.preventDefault();const id=$('cardId').value||uid(),obj={id,name:$('cardName').value.trim(),limit:parseBRL($('cardLimit').value),closeDay:Number($('cardCloseDay').value)||0,dueDay:Number($('cardDueDay').value)||0};db.cards=[...db.cards.filter(c=>c.id!==id),obj];$('cardModal').classList.remove('open');renderAll()};
$('search').oninput=renderHistory;$('filterCard').onchange=renderHistory;
$('themeBtn').onclick=()=>{db.theme=db.theme==='dark'?'light':'dark';applyTheme();renderHome()};
$('saveSettings').onclick=()=>{const g=parseBRL($('settingGoal').value);if(g<=0){alertBox($('settingsMsg'),'Meta inválida.','err');return}db.goal=g;db.endpoint=$('settingEndpoint').value.trim();renderAll();alertBox($('settingsMsg'),'Configurações salvas.')};
$('syncBtn').onclick=async()=>{try{await syncAll();alertBox($('settingsMsg'),'Sincronização concluída.')}catch(e){alertBox($('settingsMsg'),e.message,'err')}};
$('exportBtn').onclick=()=>{const rows=[['Data','Cartão','Descrição','Categoria','Valor','Observação'],...db.expenses.map(e=>[e.date,cardName(e.cardId),e.description,e.category,e.value,e.note||''])];const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gastos.csv';a.click();URL.revokeObjectURL(a.href)};
$('clearBtn').onclick=()=>{if(confirm('Apagar todos os dados locais?')){localStorage.clear();location.reload()}};
window.addEventListener('resize',()=>renderHome());window.addEventListener('online',()=>syncAll().catch(()=>{}));
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
applyTheme();renderAll();