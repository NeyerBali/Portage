/* PORTÉO — Module Consultants : liste + fiche */

function ConsultantsList({ navigate, openConsultant }) {
  const forms = useForms();
  const [q, setQ] = React.useState('');
  const rows = CONSULTANTS.filter(c => !q || (c.name+c.role+c.city+c.skills.join(' ')).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:'Consultants'}]} navigate={navigate}/>
      <div className="page-head">
        <div><h1 className="page-title">Consultants</h1><p className="page-sub">{CONSULTANTS.filter(c=>c.status==='active').length} consultants actifs</p></div>
        <div className="head-actions"><Btn variant="primary" icon="plus" onClick={()=>forms.openConsultantForm()}>Nouveau consultant</Btn></div>
      </div>

      <div style={{marginBottom:'var(--sp-5)'}}>
        <div className="searchbar" style={{maxWidth:360}}><Icon name="search" size={18}/><input placeholder="Rechercher par nom, métier, compétence…" value={q} onChange={e=>setQ(e.target.value)}/></div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'var(--sp-5)'}}>
        {rows.map(c=>{
          const ms = missionsOfConsultant(c.id);
          const active = ms.filter(m=>m.status==='progress').length;
          return (
            <div key={c.id} className="card card-pad" style={{cursor:'pointer'}} onClick={()=>openConsultant(c.id)}>
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14}}>
                <Avatar name={c.name} size={48}/>
                {c.status==='active'
                  ? <span className="badge b-done"><span className="dot" style={{background:'currentColor'}}></span>Actif</span>
                  : <span className="badge b-draft"><span className="dot" style={{background:'currentColor'}}></span>En pause</span>}
              </div>
              <div style={{fontWeight:700, fontSize:'var(--t-h5)', color:'var(--text-strong)'}}>{c.name}</div>
              <div style={{color:'var(--text-muted)', fontSize:'var(--t-sm)'}}>{c.role} · {c.city}</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap', margin:'14px 0'}}>
                {c.skills.map(s=><span key={s} className="fchip" style={{padding:'4px 10px', fontSize:'var(--t-caption)', cursor:'default'}}>{s}</span>)}
              </div>
              <div style={{display:'flex', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid var(--border-subtle)'}}>
                <div><div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>TJM</div><div style={{fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--text-strong)'}}>{euro0(c.tjm)}</div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>Missions</div><div style={{fontWeight:600, color:'var(--text-strong)'}}>{ms.length} · {active} active{active>1?'s':''}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsultantDetail({ consultantId, navigate, openMission }) {
  const forms = useForms();
  const c = consultantById(consultantId);
  if (!c) return <EmptyState icon="consultants" title="Consultant introuvable"/>;
  const ms = missionsOfConsultant(c.id);
  const ca = ms.filter(m=>m.status!=='canceled' && m.status!=='draft').reduce((s,m)=>s+m.amount,0);
  const occ = Math.min(100, 60 + (ms.filter(m=>m.status==='progress').length*16));
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:'Consultants', to:'consultants'},{label:c.name}]} navigate={navigate}/>
      <div className="page-head">
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <Avatar name={c.name} size={64}/>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <h1 className="page-title">{c.name}</h1>
              {c.status==='active'?<span className="badge b-done"><span className="dot" style={{background:'currentColor'}}></span>Actif</span>:<span className="badge b-draft"><span className="dot" style={{background:'currentColor'}}></span>En pause</span>}
            </div>
            <p className="page-sub">{c.role} · {c.city}</p>
          </div>
        </div>
        <div className="head-actions"><Btn variant="secondary" icon="mail" onClick={()=>{ window.location.href='mailto:'+c.email; }}>Contacter</Btn><Btn variant="secondary" icon="edit" onClick={()=>forms.openConsultantForm(c)}>Modifier</Btn></div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 2.2fr', gap:'var(--sp-5)', alignItems:'start'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
          <Card title="Coordonnées">
            <div className="dl">
              <dt>E-mail</dt><dd><span className="link">{c.email}</span></dd>
              <dt>Téléphone</dt><dd style={{fontFamily:'var(--font-mono)', fontSize:'var(--t-sm)'}}>{c.phone}</dd>
              <dt>TJM</dt><dd style={{fontFamily:'var(--font-mono)', fontWeight:600}}>{euro0(c.tjm)}</dd>
              <dt>Depuis</dt><dd>{dateFR(c.since)}</dd>
            </div>
            <hr className="divider"/>
            <div style={{fontSize:'var(--t-sm)', fontWeight:600, color:'var(--text-default)', marginBottom:10}}>Compétences</div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>{c.skills.map(s=><span key={s} className="fchip" style={{cursor:'default'}}>{s}</span>)}</div>
          </Card>
          <Card title="Taux d'occupation">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>Charge actuelle</span><span style={{fontFamily:'var(--font-mono)', fontWeight:600}}>{occ}%</span></div>
            <div style={{height:9, background:'var(--bg-sunken)', borderRadius:999, overflow:'hidden'}}><div style={{height:'100%', width:occ+'%', background:'linear-gradient(90deg,var(--emerald-700),var(--emerald-400))', borderRadius:999}}></div></div>
          </Card>
        </div>

        <Card noBody>
          <div className="card-head"><div><h3>Missions assignées</h3><div className="sub">{ms.length} mission{ms.length>1?'s':''} · {euro0(ca)} de CA</div></div></div>
          {ms.length ? (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Mission</th><th>Client</th><th>Période</th><th>Statut</th><th style={{textAlign:'right'}}>Montant</th></tr></thead>
                <tbody>{ms.map(m=>(
                  <tr key={m.id} onClick={()=>openMission(m.id)}>
                    <td><div className="cell-strong">{m.title}</div><div className="cell-mono" style={{marginTop:2}}>{m.id}</div></td>
                    <td>{clientById(m.client).name}</td>
                    <td style={{fontSize:'var(--t-sm)', color:'var(--text-muted)', whiteSpace:'nowrap'}}>{dateFR(m.start)}</td>
                    <td><StatusBadge status={m.status}/></td>
                    <td className="cell-amount">{euro(m.amount)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState icon="missions" title="Aucune mission assignée"/>}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { ConsultantsList, ConsultantDetail });
