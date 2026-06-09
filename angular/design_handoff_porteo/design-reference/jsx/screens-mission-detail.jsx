/* PORTÉO — Fiche détail Mission */

function MissionDetail({ missionId, navigate, openMission, openClient, openConsultant, role, onEdit, onDelete }) {
  const m = MISSIONS.find(x=>x.id===missionId);
  const [tab, setTab] = React.useState('infos');
  if (!m) return <EmptyState icon="missions" title="Mission introuvable"/>;
  const cl = clientById(m.client), co = consultantById(m.consultant);
  const invs = invoicesOfMission(m.id);
  const isConsultant = role==='consultant';
  const billed = invs.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0);
  const progress = Math.min(100, Math.round((billed/m.amount)*100));

  const timeline = [
    { ic:'plus', t:'Mission créée', d:'Brouillon initialisé', when:dateFR(m.start) },
    { ic:'check', t:'Mission validée', d:'Passée « En cours »', when:dateFR(m.start) },
    { ic:'invoices', t:'Première facture émise', d:invs[0]?invs[0].id:'—', when:invs[0]?dateFR(invs[0].issued):'—' },
    { ic:'clock', t:'Échéance prévue', d:'Fin de mission', when:dateFR(m.end) },
  ];

  const tabs = [
    { key:'infos', label:'Informations' },
    { key:'invoices', label:'Factures', count:invs.length },
    { key:'timeline', label:'Historique' },
  ];

  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:isConsultant?'Mes missions':'Missions', to:'missions'},{label:m.id}]} navigate={navigate}/>
      <div className="page-head">
        <div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:6}}>
            <span className="cell-mono" style={{fontSize:'var(--t-sm)'}}>{m.id}</span>
            <StatusBadge status={m.status}/>
          </div>
          <h1 className="page-title">{m.title}</h1>
          <p className="page-sub">{cl.name} · {co.name}</p>
        </div>
        {!isConsultant && (
          <div className="head-actions">
            <Btn variant="secondary" icon="edit" onClick={()=>onEdit(m)}>Modifier</Btn>
            <Btn variant="secondary" icon="trash" onClick={()=>onDelete(m)} style={{color:'var(--error-600)'}}>Supprimer</Btn>
          </div>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:'var(--sp-5)', alignItems:'start'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
          <Card noBody>
            <div style={{padding:'0 var(--sp-6)'}}><Tabs tabs={tabs} active={tab} onChange={setTab}/></div>
            <div className="card-pad">
              {tab==='infos' && (
                <div className="dl">
                  <dt>Intitulé</dt><dd>{m.title}</dd>
                  <dt>Statut</dt><dd><StatusBadge status={m.status}/></dd>
                  <dt>Période</dt><dd>{dateFR(m.start)} → {dateFR(m.end)}</dd>
                  <dt>TJM</dt><dd style={{fontFamily:'var(--font-mono)'}}>{euro(m.tjm)}</dd>
                  <dt>Jours vendus</dt><dd style={{fontFamily:'var(--font-mono)'}}>{m.days} jours</dd>
                  <dt>Montant total</dt><dd style={{fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--emerald-700)'}}>{euro(m.amount)}</dd>
                </div>
              )}
              {tab==='invoices' && (
                invs.length ? (
                  <div className="table-wrap" style={{margin:'calc(-1*var(--sp-6))'}}>
                    <table className="tbl">
                      <thead><tr><th>Facture</th><th>Émise le</th><th>Échéance</th><th>Statut</th><th style={{textAlign:'right'}}>Montant</th></tr></thead>
                      <tbody>{invs.map(i=>(
                        <tr key={i.id}><td className="cell-mono">{i.id}</td><td>{dateFR(i.issued)}</td><td>{dateFR(i.due)}</td><td><InvoiceBadge status={i.status}/></td><td className="cell-amount">{euro(i.amount)}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : <EmptyState icon="invoices" title="Aucune facture" message="Aucune facture n'a encore été émise pour cette mission."/>
              )}
              {tab==='timeline' && (
                <div className="timeline">
                  {timeline.map((r,i)=>(
                    <div className="tl-item" key={i}>
                      <div className="tl-dot"><Icon name={r.ic} size={15}/></div>
                      <div className="tl-content"><div className="tl-title">{r.t}</div><div className="tl-desc">{r.d}</div><div className="tl-meta">{r.when}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
          <Card title="Facturation">
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
              <span style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>Facturé / Total</span>
              <span style={{fontFamily:'var(--font-mono)', fontWeight:600, fontSize:'var(--t-sm)'}}>{progress}%</span>
            </div>
            <div style={{height:9, background:'var(--bg-sunken)', borderRadius:999, overflow:'hidden', marginBottom:14}}>
              <div style={{height:'100%', width:progress+'%', background:'linear-gradient(90deg,var(--emerald-700),var(--emerald-500))', borderRadius:999}}></div>
            </div>
            <div className="dl">
              <dt>Facturé</dt><dd style={{fontFamily:'var(--font-mono)'}}>{euro(billed)}</dd>
              <dt>Restant</dt><dd style={{fontFamily:'var(--font-mono)'}}>{euro(m.amount-billed)}</dd>
            </div>
          </Card>

          <Card title="Client">
            <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={()=>openClient(cl.id)}>
              <span style={{width:42, height:42, borderRadius:'var(--r-md)', background:'var(--bg-sunken)', display:'grid', placeItems:'center', color:'var(--text-muted)', flex:'none'}}><Icon name="building" size={20}/></span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700, color:'var(--text-strong)'}}>{cl.name}</div>
                <div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>{cl.sector}</div>
              </div>
              <Icon name="chevright" size={18} style={{color:'var(--text-subtle)'}}/>
            </div>
          </Card>

          <Card title="Consultant">
            <div style={{display:'flex', alignItems:'center', gap:12, cursor: isConsultant?'default':'pointer'}} onClick={()=>!isConsultant && openConsultant(co.id)}>
              <Avatar name={co.name} size={42}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700, color:'var(--text-strong)'}}>{co.name}</div>
                <div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>{co.role} · {co.city}</div>
              </div>
              {!isConsultant && <Icon name="chevright" size={18} style={{color:'var(--text-subtle)'}}/>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MissionDetail });
