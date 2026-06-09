/* PORTÉO — Module Clients : liste + fiche (relation 1-N missions) */

function ClientsList({ navigate, openClient }) {
  const forms = useForms();
  const [q, setQ] = React.useState('');
  const rows = CLIENTS.filter(c => !q || (c.name+c.sector+c.city).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:'Clients'}]} navigate={navigate}/>
      <div className="page-head">
        <div><h1 className="page-title">Clients</h1><p className="page-sub">{CLIENTS.length} entreprises clientes</p></div>
        <div className="head-actions"><Btn variant="primary" icon="plus" onClick={()=>forms.openClientForm()}>Nouveau client</Btn></div>
      </div>

      <Card noBody>
        <div style={{padding:'var(--sp-4) var(--sp-5)', borderBottom:'1px solid var(--border-subtle)'}}>
          <div className="searchbar" style={{maxWidth:360}}><Icon name="search" size={18}/><input placeholder="Rechercher un client…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Client</th><th>Secteur</th><th>Ville</th><th>Missions</th><th style={{textAlign:'right'}}>CA cumulé</th><th></th></tr></thead>
            <tbody>
              {rows.map(c=>{
                const ms = missionsOfClient(c.id);
                const ca = ms.filter(m=>m.status!=='canceled').reduce((s,m)=>s+m.amount,0);
                const active = ms.filter(m=>m.status==='progress').length;
                return (
                  <tr key={c.id} onClick={()=>openClient(c.id)}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:11}}>
                        <span style={{width:38, height:38, borderRadius:'var(--r-md)', background:'var(--bg-sunken)', display:'grid', placeItems:'center', color:'var(--text-muted)', flex:'none'}}><Icon name="building" size={19}/></span>
                        <div><div className="cell-strong">{c.name}</div><div className="cell-mono" style={{marginTop:2}}>{c.siret}</div></div>
                      </div>
                    </td>
                    <td>{c.sector}</td>
                    <td style={{color:'var(--text-muted)'}}>{c.city}</td>
                    <td><span className="stat-pill">{ms.length} mission{ms.length>1?'s':''}{active?` · ${active} active${active>1?'s':''}`:''}</span></td>
                    <td className="cell-amount">{euro0(ca)}</td>
                    <td><div className="row-actions"><button className="ra-btn"><Icon name="chevright" size={18}/></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ClientDetail({ clientId, navigate, openClient, openMission, openConsultant }) {
  const forms = useForms();
  const c = clientById(clientId);
  if (!c) return <EmptyState icon="clients" title="Client introuvable"/>;
  const ms = missionsOfClient(c.id);
  const invs = invoicesOfClient(c.id);
  const ca = ms.filter(m=>m.status!=='canceled').reduce((s,m)=>s+m.amount,0);
  const active = ms.filter(m=>m.status==='progress').length;
  const unpaid = invs.filter(i=>i.status!=='paid').reduce((s,i)=>s+i.amount,0);
  const [status, setStatus] = React.useState('all');
  const filtered = ms.filter(m=>status==='all'||m.status===status);

  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:'Clients', to:'clients'},{label:c.name}]} navigate={navigate}/>
      <div className="page-head">
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <span style={{width:60, height:60, borderRadius:'var(--r-lg)', background:'var(--bg-brand-soft)', border:'1px solid var(--border-brand)', display:'grid', placeItems:'center', color:'var(--emerald-700)', flex:'none'}}><Icon name="building" size={28}/></span>
          <div>
            <h1 className="page-title">{c.name}</h1>
            <p className="page-sub">{c.sector} · {c.city}</p>
          </div>
        </div>
        <div className="head-actions"><Btn variant="secondary" icon="edit" onClick={()=>forms.openClientForm(c)}>Modifier</Btn><Btn variant="primary" icon="plus" onClick={()=>forms.openMissionForm({client:c.id})}>Nouvelle mission</Btn></div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)', marginBottom:'var(--sp-5)'}}>
        <Kpi icon="missions" tone="brand" label="Missions totales" value={ms.length}/>
        <Kpi icon="briefcase" tone="info" label="Missions actives" value={active}/>
        <Kpi icon="euro" tone="warn" label="CA cumulé" value={euro0(ca)}/>
        <Kpi icon="alert" tone="error" label="Encours impayé" value={euro0(unpaid)}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 2.2fr', gap:'var(--sp-5)', alignItems:'start'}}>
        <Card title="Coordonnées">
          <div className="dl">
            <dt>SIRET</dt><dd style={{fontFamily:'var(--font-mono)', fontSize:'var(--t-sm)'}}>{c.siret}</dd>
            <dt>Contact</dt><dd>{c.contact}</dd>
            <dt>E-mail</dt><dd><span className="link">{c.email}</span></dd>
            <dt>Ville</dt><dd>{c.city}</dd>
            <dt>Client depuis</dt><dd>{dateFR(c.since)}</dd>
          </div>
        </Card>

        {/* Relation 1-N : missions du client */}
        <Card noBody>
          <div className="card-head">
            <div>
              <h3>Missions du client</h3>
              <div className="sub">Relation 1 client → {ms.length} mission{ms.length>1?'s':''}</div>
            </div>
            <div className="segmented">
              {[['all','Toutes'],['progress','En cours'],['invoiced','Facturées'],['done','Terminées']].map(([k,l])=>(
                <button key={k} className={status===k?'on':''} onClick={()=>setStatus(k)}>{l}</button>
              ))}
            </div>
          </div>
          {filtered.length ? (
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Mission</th><th>Consultant</th><th>Statut</th><th style={{textAlign:'right'}}>Montant</th></tr></thead>
                <tbody>
                  {filtered.map(m=>{
                    const co=consultantById(m.consultant);
                    return (
                      <tr key={m.id} onClick={()=>openMission(m.id)}>
                        <td><div className="cell-strong">{m.title}</div><div className="cell-mono" style={{marginTop:2}}>{m.id}</div></td>
                        <td><Person name={co.name} sub={co.role}/></td>
                        <td><StatusBadge status={m.status}/></td>
                        <td className="cell-amount">{euro(m.amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <EmptyState icon="missions" title="Aucune mission" message="Aucune mission ne correspond à ce filtre pour ce client."/>}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { ClientsList, ClientDetail });
