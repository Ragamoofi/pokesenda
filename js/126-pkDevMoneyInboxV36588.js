
(()=>{'use strict';
const SUPABASE_URL='https://rkxbqpamksltyosulmut.supabase.co';
const SUPABASE_KEY='sb_publishable_Y7aNyG3ggvVxBa6GwGvpsw_eAWhjWwO';
const LINK_KEY='pokesenda_beta1_cloud_link_v1';
let busy=false,lastToastAt=0,activeGiftModal=null,giftPauseSnapshots=null,giftEnableTimer=null;
function readLink(){try{const v=JSON.parse(localStorage.getItem(LINK_KEY)||'null');return v&&v.slotId&&v.secret?v:null}catch(_){return null}}
async function rpc(fn,args){const c=new AbortController(),t=setTimeout(()=>c.abort(),12000);try{const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`,{method:'POST',signal:c.signal,headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(args)});const tx=await r.text();let b=null;try{b=tx?JSON.parse(tx):null}catch(_){b=tx}if(!r.ok)throw new Error(b?.message||b?.details||tx||`HTTP ${r.status}`);return b}finally{clearTimeout(t)}}
function bridge(region){return region==='johto'?window.PokeSendaJohtoBattleIsolated:window.PokeSendaKantoGlobalBridge}
function safeToast(msg){const now=Date.now();if(now-lastToastAt<600)return;lastToastAt=now;try{if(typeof window.toast==='function')window.toast(msg);else console.log(msg)}catch(_){console.log(msg)}}
function asRows(v){return Array.isArray(v)?v:(v?[v]:[])}
function pauseWorldForGift(){return {kanto:window.PokeSendaKantoGlobalBridge?.devPauseAll?.()||{run:false,gym:false},johto:window.PokeSendaJohtoBattleIsolated?.devPauseAll?.()||{run:false,gym:false}}}
function resumeWorldAfterGift(){const s=giftPauseSnapshots;giftPauseSnapshots=null;if(!s)return;try{window.PokeSendaKantoGlobalBridge?.devResumeAll?.(s.kanto||{})}catch(_){}try{window.PokeSendaJohtoBattleIsolated?.devResumeAll?.(s.johto||{})}catch(_){}}
function installGiftModal(){
 let o=document.getElementById('pkDevGiftModal');if(o)return o;
 const st=document.createElement('style');st.id='pkDevGiftModalStyle';st.textContent=`
 #pkDevGiftModal{position:fixed;inset:0;z-index:2147483000;background:rgba(3,7,14,.88);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:22px;font-family:inherit;color:#fff}
 #pkDevGiftModal.hidden{display:none!important}
 #pkDevGiftModal .pk-gift-card{width:min(590px,94vw);border:2px solid #f1cf58;border-radius:22px;background:linear-gradient(180deg,#17355c 0%,#102441 48%,#0b182d 100%);box-shadow:0 28px 90px rgba(0,0,0,.7),0 0 36px rgba(241,207,88,.20);padding:26px 28px 24px;text-align:center;position:relative;overflow:hidden}
 #pkDevGiftModal .pk-gift-card:before{content:'';position:absolute;inset:-45% -10% auto;height:230px;background:radial-gradient(circle,rgba(255,224,104,.24),transparent 66%);pointer-events:none}
 #pkDevGiftModal .pk-gift-icon{font-size:58px;line-height:1;margin-bottom:8px;filter:drop-shadow(0 5px 9px rgba(0,0,0,.35))}
 #pkDevGiftModal .pk-gift-kicker{font-size:12px;font-weight:1000;letter-spacing:1.8px;color:#ffe686;margin-bottom:5px}
 #pkDevGiftModal h2{font-size:28px;line-height:1.05;margin:0;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.45)}
 #pkDevGiftModal .pk-gift-amount{font-size:36px;font-weight:1000;color:#ffe26d;margin:16px 0 3px;font-variant-numeric:tabular-nums}
 #pkDevGiftModal .pk-gift-region{font-size:11px;color:#bcd3ef;font-weight:900;margin-bottom:16px}
 #pkDevGiftModal .pk-gift-message{margin:12px auto 18px;padding:16px 18px;max-width:500px;border:1px solid #426991;border-radius:14px;background:rgba(5,15,29,.74);font-size:14px;line-height:1.55;color:#f7fbff;white-space:pre-wrap;overflow-wrap:anywhere}
 #pkDevGiftModal .pk-gift-message.hidden{display:none!important}
 #pkDevGiftModal .pk-gift-message-label{display:block;font-size:9px;letter-spacing:1px;color:#8fb7dd;font-weight:1000;margin-bottom:7px;text-transform:uppercase}
 #pkDevGiftModal .pk-gift-btn{width:min(360px,100%);min-height:48px;border:1px solid #f7dc72;border-radius:12px;background:linear-gradient(180deg,#f0c948,#ba8f1e);color:#172033;font-family:inherit;font-size:12px;font-weight:1000;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.32)}
 #pkDevGiftModal .pk-gift-btn:disabled{opacity:.5;cursor:not-allowed;filter:grayscale(.35)}
 #pkDevGiftModal .pk-gift-foot{margin-top:10px;font-size:8px;color:#7896b4}
 html.pk-gift-modal-open,html.pk-gift-modal-open body{overflow:hidden!important}
 @media(max-width:520px){#pkDevGiftModal{padding:12px}#pkDevGiftModal .pk-gift-card{padding:22px 16px 18px;border-radius:17px}#pkDevGiftModal h2{font-size:22px}#pkDevGiftModal .pk-gift-amount{font-size:29px}#pkDevGiftModal .pk-gift-message{font-size:12px}}`;
 document.head.appendChild(st);
 o=document.createElement('div');o.id='pkDevGiftModal';o.className='hidden';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','pkDevGiftTitle');
 o.innerHTML='<div class="pk-gift-card"><div class="pk-gift-icon">🎁</div><div class="pk-gift-kicker">POKÉSENDA</div><h2 id="pkDevGiftTitle">REGALITO RECIBIDO</h2><div id="pkDevGiftAmount" class="pk-gift-amount"></div><div id="pkDevGiftRegion" class="pk-gift-region"></div><div id="pkDevGiftMessage" class="pk-gift-message hidden"><span class="pk-gift-message-label">💬 Mensaje</span><span id="pkDevGiftMessageText"></span></div><button id="pkDevGiftAccept" class="pk-gift-btn" type="button">🎁 Aceptar regalito</button><div class="pk-gift-foot">El juego está pausado hasta que cierres este mensaje.</div></div>';
 document.body.appendChild(o);
 document.getElementById('pkDevGiftAccept').addEventListener('click',closeGiftModal);
 return o;
}
function keyGuard(e){if(!activeGiftModal)return;const b=document.getElementById('pkDevGiftAccept');if((e.key==='Enter'||e.key===' ')&&!b?.disabled){e.preventDefault();e.stopImmediatePropagation();closeGiftModal();return}e.preventDefault();e.stopImmediatePropagation()}
function closeGiftModal(){if(!activeGiftModal)return;if(giftEnableTimer){clearTimeout(giftEnableTimer);giftEnableTimer=null}activeGiftModal.classList.add('hidden');activeGiftModal=null;document.documentElement.classList.remove('pk-gift-modal-open');resumeWorldAfterGift()}
function showGiftModal(applied){if(!applied?.length)return;const o=installGiftModal();giftPauseSnapshots=pauseWorldForGift();const total=applied.reduce((n,x)=>n+x.amount,0),regions=[...new Set(applied.map(x=>x.region==='johto'?'Johto':'Kanto'))].join(' + '),notes=[...new Set(applied.map(x=>String(x.note||'').trim()).filter(Boolean))];document.getElementById('pkDevGiftAmount').textContent=`+₽${total.toLocaleString('es-CL')}`;document.getElementById('pkDevGiftRegion').textContent=regions;const msgBox=document.getElementById('pkDevGiftMessage'),msg=document.getElementById('pkDevGiftMessageText');if(notes.length){msg.textContent=notes.join('\n\n');msgBox.classList.remove('hidden')}else{msg.textContent='';msgBox.classList.add('hidden')}const b=document.getElementById('pkDevGiftAccept');b.disabled=true;activeGiftModal=o;document.documentElement.classList.add('pk-gift-modal-open');o.classList.remove('hidden');giftEnableTimer=setTimeout(()=>{giftEnableTimer=null;if(activeGiftModal){b.disabled=false;b.focus()}},900)}
async function check(){
 if(busy||activeGiftModal||!navigator.onLine)return;const link=readLink();if(!link)return;busy=true;
 try{
  const pending=asRows(await rpc('pokesenda_list_pending_dev_money_grants',{p_slot_id:link.slotId,p_secret:link.secret}));
  if(!pending.length)return;
  const ack=[],applied=[];let kantoTouched=false;
  for(const g of pending){
   const id=String(g.grant_id||g.id||'');const region=String(g.region||'').toLowerCase(),amount=Math.trunc(Number(g.amount)||0);
   const noteCandidates=[g.note,g.grant_note,g.p_note,g.memo,g.message,g.description,g.details].filter(v=>typeof v==='string'&&v.trim()).map(v=>String(v).trim());
   const fullNote=noteCandidates[0]||'';let cmd=null;for(const candidate of noteCandidates){cmd=window.PokeSendaDevGachaGiftInbox?.parse?.(candidate);if(cmd)break;}
   if(cmd&&id){const q=window.PokeSendaDevGachaGiftInbox?.enqueue?.({...cmd,nonce:id,issuedAt:Date.parse(g.created_at||'')||Date.now()});if(q?.ok||q?.duplicate)ack.push(id);continue;}
   const giftish=noteCandidates.some(n=>window.PokeSendaDevGachaGiftInbox?.looksLikeGift?.(n));if(giftish){console.warn('[DEV Gacha Gift] Se detectó un regalo técnico que no se pudo interpretar; se deja pendiente y NO se acredita como dinero.',g);continue;}
   if(!id||!['kanto','johto'].includes(region)||amount<=0)continue;
   const b=bridge(region);if(!b?.applyDevGrant)continue;
   const res=b.applyDevGrant(amount,{nonce:id,issuedAt:Date.parse(g.created_at||'')||Date.now(),note:fullNote.slice(0,120)});
   if(res?.ok||/ya fue canjeado|ya fue aplicado|duplic/i.test(String(res?.msg||''))){ack.push(id);if(res?.ok){applied.push({region,amount,note:fullNote.slice(0,120)});if(region==='kanto')kantoTouched=true;}}
  }
  if(ack.length){
   if(applied.length)giftPauseSnapshots=pauseWorldForGift();
   await rpc('pokesenda_ack_dev_money_grants',{p_slot_id:link.slotId,p_secret:link.secret,p_grant_ids:ack});
   if(kantoTouched){try{await window.PKCloud?.sync?.()}catch(_){}}
   if(applied.length){resumeWorldAfterGift();showGiftModal(applied)}
  }
 }catch(e){console.warn('[DEV Money Inbox]',e?.message||e)}finally{busy=false}
}
function installCloudIdCopy(){
 const actions=document.querySelector('#pkCloudOverlay .pk-cloud-actions');if(!actions||document.getElementById('pkCloudCopyFullIdBtn'))return;
 const b=document.createElement('button');b.id='pkCloudCopyFullIdBtn';b.className='btn';b.type='button';b.textContent='📋 Copiar Cloud ID completo';
 b.onclick=async()=>{const id=String(readLink()?.slotId||'');if(!id)return safeToast('Activa Cloud Save primero');try{await navigator.clipboard.writeText(id);safeToast('📋 Cloud ID completo copiado')}catch(_){prompt('Copia tu Cloud ID completo:',id)}};actions.appendChild(b);
}
function boot(){installCloudIdCopy();setInterval(installCloudIdCopy,1600);setTimeout(check,3000);setInterval(check,60000);window.addEventListener('focus',check);window.addEventListener('online',check);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});window.addEventListener('keydown',keyGuard,true);window.addEventListener('keyup',keyGuard,true)}
window.PokeSendaDevMoneyInbox={check};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
