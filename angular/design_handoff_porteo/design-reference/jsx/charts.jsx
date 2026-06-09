/* PORTÉO — Graphiques SVG (sans dépendance) */

/* ---- Courbe d'aire : CA par mois ---- */
function RevenueChart({ data, height=240 }) {
  const W = 720, H = height, padL = 8, padR = 8, padT = 18, padB = 28;
  const max = Math.max(...data.map(d=>d.v)) * 1.12;
  const min = Math.min(...data.map(d=>d.v)) * 0.84;
  const iw = W - padL - padR, ih = H - padT - padB;
  const x = i => padL + (i/(data.length-1))*iw;
  const y = v => padT + ih - ((v-min)/(max-min))*ih;
  const [hover, setHover] = React.useState(null);
  const pts = data.map((d,i)=>[x(i), y(d.v)]);
  // smooth path
  const line = pts.map((p,i)=>{
    if(i===0) return `M${p[0]},${p[1]}`;
    const prev = pts[i-1]; const cx = (prev[0]+p[0])/2;
    return `C${cx},${prev[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }).join(' ');
  const area = line + ` L${pts[pts.length-1][0]},${padT+ih} L${pts[0][0]},${padT+ih} Z`;
  const gridVals = [min, (min+max)/2, max];
  return (
    <div style={{position:'relative'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}} onMouseLeave={()=>setHover(null)}>
        <defs>
          <linearGradient id="revgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.34"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {gridVals.map((g,i)=>(
          <line key={i} x1={padL} x2={W-padR} y1={y(g)} y2={y(g)} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray={i===0?'0':'3 4'}/>
        ))}
        <path d={area} fill="url(#revgrad)"/>
        <path d={line} fill="none" stroke="var(--emerald-600)" strokeWidth="2.5" strokeLinecap="round"/>
        {data.map((d,i)=>(
          <g key={i}>
            <rect x={x(i)-iw/data.length/2} y={padT} width={iw/data.length} height={ih} fill="transparent"
                  onMouseEnter={()=>setHover(i)} style={{cursor:'pointer'}}/>
            <circle cx={x(i)} cy={y(d.v)} r={hover===i?5:0} fill="var(--bg-surface)" stroke="var(--emerald-600)" strokeWidth="2.5"/>
            <text x={x(i)} y={H-8} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-subtle)">{d.m}</text>
          </g>
        ))}
        {hover!=null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT+ih} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3"/>}
      </svg>
      {hover!=null && (
        <div style={{position:'absolute', left:`${(x(hover)/W)*100}%`, top:0, transform:'translate(-50%,-4px)', background:'var(--bg-inverse)', color:'var(--bg-surface)', padding:'6px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:600, whiteSpace:'nowrap', pointerEvents:'none', boxShadow:'var(--shadow-md)'}}>
          <span style={{opacity:0.7, fontFamily:'var(--font-mono)'}}>{data[hover].m} · </span>{euro0(data[hover].v)}
        </div>
      )}
    </div>
  );
}

/* ---- Donut : missions par statut ---- */
function DonutChart({ segments, size=180, thickness=26 }) {
  const total = segments.reduce((s,x)=>s+x.value,0);
  const r = (size - thickness)/2, cx = size/2, cy = size/2, C = 2*Math.PI*r;
  let offset = 0;
  const [hover, setHover] = React.useState(null);
  return (
    <div style={{display:'flex', alignItems:'center', gap:'var(--sp-6)', flexWrap:'wrap'}}>
      <div style={{position:'relative', width:size, height:size, flex:'none'}}>
        <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-sunken)" strokeWidth={thickness}/>
          {segments.map((s,i)=>{
            const len = (s.value/total)*C;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hover===i?thickness+4:thickness}
                strokeDasharray={`${len} ${C-len}`} strokeDashoffset={-offset} strokeLinecap="butt"
                onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} style={{transition:'stroke-width .15s', cursor:'pointer'}}/>
            );
            offset += len; return el;
          })}
        </svg>
        <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', textAlign:'center'}}>
          <div>
            <div style={{fontFamily:'var(--font-display)', fontSize:28, fontWeight:500, color:'var(--text-strong)', lineHeight:1}}>{hover!=null?segments[hover].value:total}</div>
            <div style={{fontSize:11, color:'var(--text-subtle)', marginTop:2}}>{hover!=null?segments[hover].label:'missions'}</div>
          </div>
        </div>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:9, flex:1, minWidth:140}}>
        {segments.map((s,i)=>(
          <div key={i} style={{display:'flex', alignItems:'center', gap:9, opacity:hover==null||hover===i?1:0.5, transition:'opacity .15s', cursor:'pointer'}}
               onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}>
            <span style={{width:10, height:10, borderRadius:3, background:s.color, flex:'none'}}></span>
            <span style={{fontSize:'var(--t-sm)', color:'var(--text-default)', flex:1}}>{s.label}</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:'var(--t-sm)', fontWeight:600, color:'var(--text-strong)'}}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Barres horizontales : top clients ---- */
function BarList({ items }) {
  const max = Math.max(...items.map(i=>i.value));
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-4)'}}>
      {items.map((it,i)=>(
        <div key={i}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
            <span style={{fontSize:'var(--t-sm)', fontWeight:600, color:'var(--text-strong)'}}>{it.label}</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:'var(--t-sm)', color:'var(--text-muted)', fontWeight:500}}>{euro0(it.value)}</span>
          </div>
          <div style={{height:9, background:'var(--bg-sunken)', borderRadius:999, overflow:'hidden'}}>
            <div style={{height:'100%', width:`${(it.value/max)*100}%`, borderRadius:999, background:`linear-gradient(90deg, var(--emerald-700), var(--emerald-500))`, transition:'width .6s var(--ease-out)'}}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Mini sparkline ---- */
function Spark({ data, color='var(--emerald-600)', w=92, h=30 }) {
  const max=Math.max(...data), min=Math.min(...data);
  const pts = data.map((v,i)=>`${(i/(data.length-1))*w},${h - ((v-min)/(max-min||1))*(h-4) - 2}`).join(' ');
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

Object.assign(window, { RevenueChart, DonutChart, BarList, Spark });
