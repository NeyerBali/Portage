/* PORTÉO — CRUD Missions : liste, filtres, tri, pagination, modale form */

const STATUS_OPTIONS = [
  { key:'all', label:'Toutes' },
  { key:'draft', label:'Brouillon' },
  { key:'progress', label:'En cours' },
  { key:'done', label:'Terminée' },
  { key:'invoiced', label:'Facturée' },
  { key:'canceled', label:'Annulée' },
];

function MissionsList({ navigate, openMission, role, missions, onCreate, onEdit, onDelete }) {
  const isConsultant = role==='consultant';
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [client, setClient] = React.useState('all');
  const [consultant, setConsultant] = React.useState('all');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [sort, setSort] = React.useState({ col:'start', dir:'desc' });
  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(8);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState([]);
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(()=>{ setLoading(true); const t=setTimeout(()=>setLoading(false), 650); return ()=>clearTimeout(t); }, []);
  React.useEffect(()=>{ setPage(1); }, [q,status,client,consultant,from,to]);

  let rows = missions.filter(m=>{
    if (status!=='all' && m.status!==status) return false;
    if (client!=='all' && m.client!==client) return false;
    if (consultant!=='all' && m.consultant!==consultant) return false;
    if (from && m.start < from) return false;
    if (to && m.start > to) return false;
    if (q) {
      const blob = (m.id+' '+m.title+' '+clientById(m.client).name+' '+consultantById(m.consultant).name).toLowerCase();
      if (!blob.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  rows = [...rows].sort((a,b)=>{
    let av, bv;
    switch(sort.col){
      case 'title': av=a.title; bv=b.title; break;
      case 'client': av=clientById(a.client).name; bv=clientById(b.client).name; break;
      case 'consultant': av=consultantById(a.consultant).name; bv=consultantById(b.consultant).name; break;
      case 'amount': av=a.amount; bv=b.amount; break;
      case 'status': av=a.status; bv=b.status; break;
      default: av=a.start; bv=b.start;
    }
    if(av<bv) return sort.dir==='asc'?-1:1;
    if(av>bv) return sort.dir==='asc'?1:-1;
    return 0;
  });

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total/perPage));
  const pageRows = rows.slice((page-1)*perPage, page*perPage);

  const toggleSort = (col) => setSort(s => s.col===col ? { col, dir: s.dir==='asc'?'desc':'asc' } : { col, dir:'asc' });
  const activeFilters = [status!=='all', client!=='all', consultant!=='all', from, to].filter(Boolean).length;
  const clearFilters = ()=>{ setStatus('all'); setClient('all'); setConsultant('all'); setFrom(''); setTo(''); };

  const Th = ({col, children, align}) => (
    <th className={'sortable '+(sort.col===col?'sorted':'')} style={align?{textAlign:align}:null} onClick={()=>toggleSort(col)}>
      {children}<span className="sort-ic"><Icon name={sort.col===col?(sort.dir==='asc'?'chevup':'chevdown'):'chevdown'} size={14}/></span>
    </th>
  );

  const allOnPageSelected = pageRows.length>0 && pageRows.every(r=>selected.includes(r.id));
  const toggleAll = ()=> setSelected(allOnPageSelected ? selected.filter(id=>!pageRows.find(r=>r.id===id)) : [...new Set([...selected, ...pageRows.map(r=>r.id)])]);

  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label: isConsultant?'Mes missions':'Missions'}]} navigate={navigate}/>
      <div className="page-head">
        <div>
          <h1 className="page-title">{isConsultant?'Mes missions':'Missions'}</h1>
          <p className="page-sub">{isConsultant?'Les missions qui vous sont assignées.':'Gérez l\'ensemble des missions de portage.'}</p>
        </div>
        {!isConsultant && (
          <div className="head-actions">
            <Btn variant="secondary" icon="download">Exporter</Btn>
            <Btn variant="primary" icon="plus" onClick={onCreate}>Nouvelle mission</Btn>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <Card noBody>
        <div style={{padding:'var(--sp-4) var(--sp-5)', display:'flex', gap:'var(--sp-3)', alignItems:'center', flexWrap:'wrap', borderBottom:'1px solid var(--border-subtle)'}}>
          <div className="searchbar" style={{flex:'1 1 280px', minWidth:200}}>
            <Icon name="search" size={18}/>
            <input placeholder="Rechercher par référence, titre, client…" value={q} onChange={e=>setQ(e.target.value)}/>
          </div>
          <div className="segmented" style={{flexWrap:'wrap'}}>
            {STATUS_OPTIONS.slice(0,4).map(o=>(
              <button key={o.key} className={status===o.key?'on':''} onClick={()=>setStatus(o.key)}>{o.label}</button>
            ))}
          </div>
          <Btn variant={showFilters||activeFilters?'primary':'secondary'} icon="filter" onClick={()=>setShowFilters(s=>!s)}>
            Filtres{activeFilters?` · ${activeFilters}`:''}
          </Btn>
        </div>

        {showFilters && (
          <div style={{padding:'var(--sp-5)', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'var(--sp-4)', borderBottom:'1px solid var(--border-subtle)', background:'var(--bg-sunken)'}}>
            <Field label="Statut"><Select value={status} onChange={e=>setStatus(e.target.value)}>{STATUS_OPTIONS.map(o=><option key={o.key} value={o.key}>{o.label}</option>)}</Select></Field>
            {!isConsultant && <Field label="Client"><Select value={client} onChange={e=>setClient(e.target.value)}><option value="all">Tous les clients</option>{CLIENTS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>}
            {!isConsultant && <Field label="Consultant"><Select value={consultant} onChange={e=>setConsultant(e.target.value)}><option value="all">Tous les consultants</option>{CONSULTANTS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>}
            <Field label="Démarrage après"><Input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></Field>
            <Field label="Démarrage avant"><Input type="date" value={to} onChange={e=>setTo(e.target.value)}/></Field>
            <div style={{display:'flex', alignItems:'flex-end'}}><Btn variant="ghost" icon="x" onClick={clearFilters} disabled={!activeFilters}>Réinitialiser</Btn></div>
          </div>
        )}

        {/* Selection bar */}
        {selected.length>0 && (
          <div style={{padding:'10px var(--sp-5)', background:'var(--bg-brand-soft)', display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid var(--border-brand)'}}>
            <span style={{fontSize:'var(--t-sm)', fontWeight:600, color:'var(--emerald-700)'}}>{selected.length} sélectionnée(s)</span>
            <Btn variant="ghost" size="sm" icon="download">Exporter</Btn>
            {!isConsultant && <Btn variant="ghost" size="sm" icon="trash" style={{color:'var(--error-600)'}} onClick={()=>onDelete(selected.length>1?{bulk:selected}:missions.find(m=>m.id===selected[0]))}>Supprimer</Btn>}
            <button className="link" style={{marginLeft:'auto'}} onClick={()=>setSelected([])}>Tout désélectionner</button>
          </div>
        )}

        {/* Table */}
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {!isConsultant && <th style={{width:44}}><Checkbox checked={allOnPageSelected} onChange={toggleAll}/></th>}
                <Th col="title">Mission</Th>
                {!isConsultant && <Th col="client">Client</Th>}
                {!isConsultant && <Th col="consultant">Consultant</Th>}
                <Th col="start">Période</Th>
                <Th col="status">Statut</Th>
                <Th col="amount" align="right">Montant</Th>
                <th style={{width:56}}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:6}).map((_,i)=>(
                  <tr key={i}>
                    {!isConsultant && <td><Skeleton w={18} h={18} r={5}/></td>}
                    <td><Skeleton w="70%" h={14}/><Skeleton w="40%" h={10} style={{marginTop:6}}/></td>
                    {!isConsultant && <td><Skeleton w="80%" h={14}/></td>}
                    {!isConsultant && <td><div style={{display:'flex',gap:9,alignItems:'center'}}><Skeleton w={28} h={28} r={999}/><Skeleton w={90} h={12}/></div></td>}
                    <td><Skeleton w="70%" h={12}/></td>
                    <td><Skeleton w={84} h={22} r={999}/></td>
                    <td><Skeleton w="60%" h={14} style={{marginLeft:'auto'}}/></td>
                    <td></td>
                  </tr>
                ))
              ) : pageRows.length===0 ? (
                <tr><td colSpan={isConsultant?5:8} style={{padding:0}}>
                  <EmptyState icon="missions" title="Aucune mission trouvée" message={activeFilters||q?'Aucune mission ne correspond à vos critères. Essayez d\'élargir la recherche.':'Commencez par créer votre première mission.'}
                    action={activeFilters||q ? <Btn variant="secondary" icon="x" onClick={()=>{clearFilters(); setQ('');}}>Réinitialiser les filtres</Btn> : (!isConsultant && <Btn variant="primary" icon="plus" onClick={onCreate}>Nouvelle mission</Btn>)}/>
                </td></tr>
              ) : pageRows.map(m=>{
                const cl=clientById(m.client), co=consultantById(m.consultant);
                const sel = selected.includes(m.id);
                return (
                  <tr key={m.id} onClick={()=>openMission(m.id)} style={sel?{background:'var(--bg-brand-soft)'}:null}>
                    {!isConsultant && <td onClick={e=>e.stopPropagation()}><Checkbox checked={sel} onChange={()=>setSelected(s=>sel?s.filter(x=>x!==m.id):[...s,m.id])}/></td>}
                    <td>
                      <div className="cell-strong">{m.title}</div>
                      <div className="cell-mono" style={{marginTop:2}}>{m.id}</div>
                    </td>
                    {!isConsultant && <td>{cl.name}</td>}
                    {!isConsultant && <td><Person name={co.name} sub={co.role}/></td>}
                    <td style={{fontSize:'var(--t-sm)', color:'var(--text-muted)', whiteSpace:'nowrap'}}>{dateFR(m.start)}<br/><span style={{color:'var(--text-subtle)'}}>→ {dateFR(m.end)}</span></td>
                    <td><StatusBadge status={m.status}/></td>
                    <td className="cell-amount">{euro(m.amount)}</td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="ra-btn" title="Voir" onClick={()=>openMission(m.id)}><Icon name="eye" size={17}/></button>
                        {!isConsultant && <button className="ra-btn" title="Éditer" onClick={()=>onEdit(m)}><Icon name="edit" size={16}/></button>}
                        {!isConsultant && <button className="ra-btn danger" title="Supprimer" onClick={()=>onDelete(m)}><Icon name="trash" size={16}/></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total>0 && (
          <div className="pager">
            <div className="pager-info">{(page-1)*perPage+1}–{Math.min(page*perPage,total)} sur <b>{total}</b> mission{total>1?'s':''}</div>
            <div className="pager-ctrls">
              <button className="pg" disabled={page===1} onClick={()=>setPage(p=>p-1)}><Icon name="chevleft" size={16}/></button>
              {Array.from({length:pages}).map((_,i)=>(
                <button key={i} className={'pg '+(page===i+1?'on':'')} onClick={()=>setPage(i+1)}>{i+1}</button>
              ))}
              <button className="pg" disabled={page===pages} onClick={()=>setPage(p=>p+1)}><Icon name="chevright" size={16}/></button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------- Modale création / édition ---------- */
function MissionFormModal({ open, onClose, onSave, editing, prefill, toast }) {
  const blank = { title:'', client:'', consultant:'', status:'draft', start:'', end:'', tjm:'', days:'' };
  const [f, setF] = React.useState(blank);
  const [err, setErr] = React.useState({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(()=>{
    if (open) {
      setF(editing ? { ...editing, tjm:String(editing.tjm), days:String(editing.days) } : { ...blank, ...(prefill||{}) });
      setErr({});
    }
  }, [open, editing, prefill]);

  const set = (k,v) => { setF(s=>({...s,[k]:v})); setErr(e=>({...e,[k]:null})); };
  const amount = (Number(f.tjm)||0) * (Number(f.days)||0);

  const submit = () => {
    const e={};
    if(!f.title.trim()) e.title='L\'intitulé est requis.';
    if(!f.client) e.client='Sélectionnez un client.';
    if(!f.consultant) e.consultant='Sélectionnez un consultant.';
    if(!f.start) e.start='Date de début requise.';
    if(!f.end) e.end='Date de fin requise.';
    else if(f.start && f.end < f.start) e.end='La date de fin doit suivre le début.';
    if(!f.tjm || Number(f.tjm)<=0) e.tjm='TJM invalide.';
    if(!f.days || Number(f.days)<=0) e.days='Nombre de jours invalide.';
    setErr(e);
    if(Object.keys(e).length){ toast.error('Formulaire incomplet','Corrigez les champs en rouge.'); return; }
    setSaving(true);
    setTimeout(()=>{
      setSaving(false);
      onSave({ ...f, tjm:Number(f.tjm), days:Number(f.days), amount });
    }, 600);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="modal-head">
        <span className="modal-ic brand"><Icon name={editing?'edit':'plus'} size={22}/></span>
        <div className="mh-text">
          <h3>{editing?'Modifier la mission':'Nouvelle mission'}</h3>
          <div className="mh-sub">{editing?editing.id:'Renseignez les informations de la mission.'}</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={20}/></button>
      </div>
      <div className="modal-body">
        <div className="form-grid">
          <Field label="Intitulé de la mission" required error={err.title} >
            <div className="col-2"><Input placeholder="Ex. Migration Data Lake" value={f.title} onChange={e=>set('title',e.target.value)}/></div>
          </Field>
          <div className="col-2"></div>
          <Field label="Client" required error={err.client}>
            <Select value={f.client} onChange={e=>set('client',e.target.value)}><option value="">— Sélectionner —</option>{CLIENTS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          </Field>
          <Field label="Consultant" required error={err.consultant}>
            <Select value={f.consultant} onChange={e=>set('consultant',e.target.value)}><option value="">— Sélectionner —</option>{CONSULTANTS.map(c=><option key={c.id} value={c.id}>{c.name} · {c.role}</option>)}</Select>
          </Field>
          <Field label="Date de début" required error={err.start}><Input type="date" value={f.start} onChange={e=>set('start',e.target.value)}/></Field>
          <Field label="Date de fin" required error={err.end}><Input type="date" value={f.end} onChange={e=>set('end',e.target.value)}/></Field>
          <Field label="TJM (€)" required error={err.tjm}><Input type="number" placeholder="720" value={f.tjm} onChange={e=>set('tjm',e.target.value)}/></Field>
          <Field label="Nombre de jours" required error={err.days}><Input type="number" placeholder="120" value={f.days} onChange={e=>set('days',e.target.value)}/></Field>
          <Field label="Statut">
            <Select value={f.status} onChange={e=>set('status',e.target.value)}>{Object.keys(STATUS).map(k=><option key={k} value={k}>{STATUS[k].label}</option>)}</Select>
          </Field>
          <div className="field" style={{justifyContent:'flex-end'}}>
            <div style={{background:'var(--bg-brand-soft)', border:'1px solid var(--border-brand)', borderRadius:'var(--r-sm)', padding:'10px 14px'}}>
              <div style={{fontSize:'var(--t-caption)', color:'var(--text-muted)'}}>Montant total estimé</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:24, fontWeight:500, color:'var(--emerald-700)', fontVariantNumeric:'tabular-nums'}}>{euro(amount)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" icon={saving?null:'check'} onClick={submit} disabled={saving}>{saving?'Enregistrement…':(editing?'Enregistrer les modifications':'Créer la mission')}</Btn>
      </div>
    </Modal>
  );
}

Object.assign(window, { MissionsList, MissionFormModal });
