
/* V36.67.4 · Arrastre de Formación fluido a 60/120 Hz.
   Render desacoplado de pointermove, interpolación temporal, hit-test por frame y snap suave. */
(()=>{
  'use strict';
  let activeSession=null;
  const boundHandles=new WeakSet();
  const rootConfigs=new WeakMap();
  const removeGhost=()=>document.querySelectorAll('.pk-formation-drag-ghost').forEach(x=>x.remove());
  const clearVisuals=root=>{
    try{root?.querySelectorAll?.('.formation-slot').forEach(x=>{x.classList.remove('formation-dragging','formation-drop-target');x.removeAttribute('aria-dropeffect');});}catch(_){}
    try{root?.querySelectorAll?.('.formation-drag-handle').forEach(x=>x.removeAttribute('aria-grabbed'));}catch(_){}
    document.documentElement.classList.remove('pk-formation-pointer-drag');
    removeGhost();
  };
  window.PokeSendaCancelFormationDrag=()=>{
    try{activeSession?.cancel?.(true);}catch(_){}
    activeSession=null;
    document.documentElement.classList.remove('pk-formation-pointer-drag');
    removeGhost();
  };

  window.PokeSendaBindSafeFormationDrag=({root,canEdit,onSwap}={})=>{
    if(!root||typeof onSwap!=='function')return;
    // V36.67.5 · la configuración vive en el root. Así un nodo de Formación que sobreviva
    // a pausas, renders parciales o clones siempre consulta el estado/callback MÁS reciente.
    rootConfigs.set(root,{canEdit,onSwap});
    if(!root.dataset.pkSafeFormationGuard){
      root.dataset.pkSafeFormationGuard='1';
      root.addEventListener('pointerdown',e=>{
        const handle=e.target?.closest?.('.formation-pokemon');
        if(!handle||!root.contains(handle))return;
        const cfg=rootConfigs.get(root)||{};
        if(typeof cfg.canEdit==='function'&&!cfg.canEdit())return;
        // Si quedó una sesión visual antigua, la limpiamos ANTES de empezar el nuevo gesto.
        const stale=document.documentElement.classList.contains('pk-formation-pointer-drag')||document.querySelector('.pk-formation-drag-ghost');
        if(stale)window.PokeSendaCancelFormationDrag?.();
        // Los runtimes regionales pueden recrear/clonar tarjetas sin sus listeners.
        // Recorremos el root en captura, antes de que el pointerdown llegue al handle.
        if(!boundHandles.has(handle))window.PokeSendaBindSafeFormationDrag?.({root,...cfg});
      },true);
    }
    const slots=[...root.querySelectorAll('.formation-slot')];
    slots.forEach((slot,index)=>{
      slot.dataset.pkSafeFormationIndex=String(index);
      const handle=slot.querySelector('.formation-pokemon');
      if(!handle||boundHandles.has(handle))return;
      boundHandles.add(handle);
      handle.dataset.pkSafeDragBound='1';
      handle.classList.add('formation-drag-handle');
      handle.draggable=false;
      handle.setAttribute('draggable','false');
      handle.querySelectorAll('img,[draggable]').forEach(n=>{try{n.draggable=false;n.setAttribute('draggable','false');}catch(_){}});
      handle.addEventListener('dragstart',e=>{e.preventDefault();e.stopImmediatePropagation();},true);

      let suppressClick=false;
      handle.addEventListener('click',e=>{
        if(!suppressClick)return;
        suppressClick=false;
        e.preventDefault();e.stopImmediatePropagation();
      },true);

      handle.addEventListener('pointerdown',e=>{
        if(e.pointerType==='mouse'&&e.button!==0)return;
        const startCfg=rootConfigs.get(root)||{canEdit,onSwap};
        if(typeof startCfg.canEdit==='function'&&!startCfg.canEdit())return;
        window.PokeSendaCancelFormationDrag?.();

        const sourceIndex=Number(slot.dataset.pkSafeFormationIndex);
        const pointerId=e.pointerId,startX=e.clientX,startY=e.clientY;
        const touchDrag=e.pointerType==='touch'||e.pointerType==='pen'||window.matchMedia?.('(pointer:coarse)')?.matches;
        const sourceRect=handle.getBoundingClientRect();
        const grabX=Math.max(0,Math.min(sourceRect.width,e.clientX-sourceRect.left));
        const grabY=Math.max(0,Math.min(sourceRect.height,e.clientY-sourceRect.top));
        let dragging=false,targetIndex=null,targetSlot=null,done=false,ghost=null,settleTimer=0,raf=0;
        let pointerX=e.clientX,pointerY=e.clientY;
        let targetLeft=sourceRect.left,targetTop=sourceRect.top;
        let renderLeft=sourceRect.left,renderTop=sourceRect.top,lastFrame=performance.now();
        const ac=new AbortController(),signal=ac.signal;

        const ghostAt=(left,top,scale=1.035,rot=-.35)=>{
          if(!ghost)return;
          ghost.style.transform=`translate3d(${left.toFixed(2)}px,${top.toFixed(2)}px,0) scale(${touchDrag?1:scale}) rotate(${touchDrag?0:rot}deg)`;
        };
        const setDropTarget=(nextSlot,nextIndex)=>{
          if(targetSlot===nextSlot&&targetIndex===nextIndex)return;
          if(targetSlot){targetSlot.classList.remove('formation-drop-target');targetSlot.removeAttribute('aria-dropeffect');}
          targetSlot=nextSlot||null;
          targetIndex=Number.isInteger(nextIndex)?nextIndex:null;
          if(targetSlot){targetSlot.classList.add('formation-drop-target');targetSlot.setAttribute('aria-dropeffect','move');}
        };
        const refreshTarget=()=>{
          if(!dragging||done)return;
          const hit=document.elementFromPoint(pointerX,pointerY);
          const target=hit?.closest?.('.formation-slot');
          if(!target||!root.contains(target)){setDropTarget(null,null);return;}
          const idx=Number(target.dataset.pkSafeFormationIndex);
          if(!Number.isInteger(idx)||idx===sourceIndex){setDropTarget(null,null);return;}
          setDropTarget(target,idx);
        };
        const frame=now=>{
          if(done||!dragging||!ghost){raf=0;return;}
          const dt=Math.max(1,Math.min(34,now-lastFrame));lastFrame=now;
          if(touchDrag){
            renderLeft=targetLeft;renderTop=targetTop;
          }else{
            // Escritorio conserva exactamente la interpolación suave de mouse.
            const alpha=1-Math.exp(-dt*0.040);
            renderLeft+=(targetLeft-renderLeft)*alpha;
            renderTop+=(targetTop-renderTop)*alpha;
            if(Math.abs(targetLeft-renderLeft)<.08)renderLeft=targetLeft;
            if(Math.abs(targetTop-renderTop)<.08)renderTop=targetTop;
          }
          ghostAt(renderLeft,renderTop);
          refreshTarget();
          raf=requestAnimationFrame(frame);
        };
        const makeGhost=()=>{
          if(ghost)return;
          ghost=handle.cloneNode(true);
          ghost.removeAttribute('id');
          ghost.removeAttribute('data-open-pokemon');
          ghost.removeAttribute('data-j-pokemon');
          ghost.removeAttribute('data-g-detail');
          ghost.removeAttribute('aria-grabbed');
          ghost.classList.remove('formation-drag-handle');
          ghost.classList.add('pk-formation-drag-ghost');
          ghost.style.width=sourceRect.width+'px';
          ghost.style.height=sourceRect.height+'px';
          ghost.style.setProperty('transform-origin',`${grabX.toFixed(2)}px ${grabY.toFixed(2)}px`,'important');
          targetLeft=pointerX-grabX;targetTop=pointerY-grabY;
          renderLeft=touchDrag?targetLeft:sourceRect.left;
          renderTop=touchDrag?targetTop:sourceRect.top;
          ghost.style.transform=`translate3d(${renderLeft}px,${renderTop}px,0) scale(${touchDrag?1:.985}) rotate(0deg)`;
          document.body.appendChild(ghost);
          lastFrame=performance.now();
          raf=requestAnimationFrame(frame);
        };
        const updatePointer=(x,y)=>{
          pointerX=x;pointerY=y;
          targetLeft=x-grabX;targetTop=y-grabY;
        };
        const hardCleanup=()=>{
          if(raf){cancelAnimationFrame(raf);raf=0;}
          if(settleTimer){clearTimeout(settleTimer);settleTimer=0;}
          try{ac.abort();}catch(_){}
          try{if(handle.hasPointerCapture?.(pointerId))handle.releasePointerCapture(pointerId);}catch(_){}
          setDropTarget(null,null);
          clearVisuals(root);
          if(activeSession===session)activeSession=null;
        };
        const settle=(commit,immediate=false)=>{
          if(done)return;done=true;
          try{ac.abort();}catch(_){}
          try{if(handle.hasPointerCapture?.(pointerId))handle.releasePointerCapture(pointerId);}catch(_){}
          if(raf){cancelAnimationFrame(raf);raf=0;}
          if(!dragging||!ghost){hardCleanup();return;}
          suppressClick=true;setTimeout(()=>{suppressClick=false;},200);
          const liveCfg=rootConfigs.get(root)||{canEdit,onSwap};
          const valid=!!(commit&&Number.isInteger(targetIndex)&&targetIndex!==sourceIndex&&(typeof liveCfg.canEdit!=='function'||liveCfg.canEdit()));
          if(immediate){hardCleanup();return;}
          const destination=valid?slots[targetIndex]:slot;
          const destVisual=destination?.querySelector?.('.formation-pokemon');
          const dr=(destVisual||destination)?.getBoundingClientRect?.()||sourceRect;
          const left=dr.left+(dr.width-sourceRect.width)/2;
          const top=dr.top+(dr.height-sourceRect.height)/2;
          const from=sourceIndex,to=targetIndex;
          ghost.classList.add('pk-settling');
          // Fuerza el frame actual antes del snap para que la transición siempre parta desde donde está el cursor.
          ghost.getBoundingClientRect();
          ghostAt(left,top,valid?.982:.99,0);
          settleTimer=setTimeout(()=>{
            settleTimer=0;
            hardCleanup();
            if(valid){try{const liveSwap=(rootConfigs.get(root)||{}).onSwap||onSwap;liveSwap(from,to);}catch(err){console.error('[PokéSenda] Error al reordenar Formación',err);}}
          },185);
        };
        const session={cancel:(immediate=false)=>settle(false,immediate)};
        activeSession=session;
        try{handle.setPointerCapture?.(pointerId);}catch(_){}

        const move=ev=>{
          if(done||ev.pointerId!==pointerId)return;
          const moveCfg=rootConfigs.get(root)||{canEdit,onSwap};if(typeof moveCfg.canEdit==='function'&&!moveCfg.canEdit()){settle(false,true);return;}
          const dx=ev.clientX-startX,dy=ev.clientY-startY;
          updatePointer(ev.clientX,ev.clientY);
          if(!dragging&&Math.hypot(dx,dy)>=5){
            dragging=true;makeGhost();
            slot.classList.add('formation-dragging');
            handle.setAttribute('aria-grabbed','true');
            document.documentElement.classList.add('pk-formation-pointer-drag');
          }
          if(!dragging)return;
          ev.preventDefault();
        };
        const up=ev=>{if(ev.pointerId===pointerId){updatePointer(ev.clientX,ev.clientY);refreshTarget();settle(true,false);}};
        const pcancel=ev=>{if(ev.pointerId===pointerId)settle(false,true);};
        window.addEventListener('pointermove',move,{capture:true,passive:false,signal});
        window.addEventListener('pointerup',up,{capture:true,signal});
        window.addEventListener('pointercancel',pcancel,{capture:true,signal});
        handle.addEventListener('lostpointercapture',ev=>{if(!done&&ev.pointerId===pointerId)settle(false,true);},{signal});
        window.addEventListener('blur',()=>settle(false,true),{signal});
        window.addEventListener('keydown',ev=>{if(ev.key==='Escape')settle(false,true);},{capture:true,signal});
        document.addEventListener('visibilitychange',()=>{if(document.hidden)settle(false,true);},{signal});
      });
    });
  };
  window.addEventListener('pagehide',()=>window.PokeSendaCancelFormationDrag?.());
})();
