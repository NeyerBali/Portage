/* PORTÉO — Module Factures : liste + détail */

function InvoicesList({ navigate, openInvoice, role }) {
  const forms = useForms();
  const isConsultant = role==='consultant';
  const source = isConsultant ? INVOICES.filter(i=>{ const m=MISSIONS.find(x=>x.id===i.mission); return m && m.consultant==='C-01'; }) : INVOICES;
  const [status, setStatus] = React.useState('all');
  const [q, setQ] = React.useState('');
  let rows = source.filter(i=>{
    if (status!=='all' && i.status!==status) return false;
    if (q) { const blob=(i.id+' '+clientById(i.client).name).toLowerCase(); if(!blob.includes(q.toLowerCase())) return false; }
    return true;
  });
  const totals = {
    paid: source.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0),
    issued: source.filter(i=>i.status==='issued').reduce((s,i)=>s+i.amount,0),
    overdue: source.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.amount,0),
  };
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:isConsultant?'Mes factures':'Factures'}]} navigate={navigate}/>
      <div className="page-head">
        <div><h1 className="page-title">{isConsultant?'Mes factures':'Factures'}</h1><p className="page-sub">{source.length} factures</p></div>
        {!isConsultant && <div className="head-actions"><Btn variant="secondary" icon="download">Exporter</Btn><Btn variant="primary" icon="plus" onClick={()=>forms.openInvoiceForm()}>Nouvelle facture</Btn></div>}
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)', marginBottom:'var(--sp-5)'}}>
        <Kpi icon="checkcircle" tone="brand" label="Encaissé" value={euro0(totals.paid)}/>
        <Kpi icon="clock" tone="info" label="Émis (en attente)" value={euro0(totals.issued)}/>
        <Kpi icon="alert" tone="error" label="En retard" value={euro0(totals.overdue)}/>
      </div>

      <Card noBody>
        <div style={{padding:'var(--sp-4) var(--sp-5)', display:'flex', gap:'var(--sp-3)', alignItems:'center', flexWrap:'wrap', borderBottom:'1px solid var(--border-subtle)'}}>
          <div className="searchbar" style={{flex:'1 1 240px'}}><Icon name="search" size={18}/><input placeholder="Rechercher une facture…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <div className="segmented">
            {[['all','Toutes'],['draft','Brouillon'],['issued','Émise'],['paid','Payée'],['overdue','En retard']].map(([k,l])=>(
              <button key={k} className={status===k?'on':''} onClick={()=>setStatus(k)}>{l}</button>
            ))}
          </div>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Facture</th><th>Mission</th>{!isConsultant&&<th>Client</th>}<th>Émise le</th><th>Échéance</th><th>Statut</th><th style={{textAlign:'right'}}>Montant</th></tr></thead>
              <tbody>
                {rows.map(i=>{
                  const m = MISSIONS.find(x=>x.id===i.mission);
                  return (
                    <tr key={i.id} onClick={()=>openInvoice(i.id)}>
                      <td className="cell-mono cell-strong" style={{color:'var(--text-strong)'}}>{i.id}</td>
                      <td>{m?m.title:'—'}</td>
                      {!isConsultant && <td>{clientById(i.client).name}</td>}
                      <td style={{color:'var(--text-muted)'}}>{dateFR(i.issued)}</td>
                      <td style={{color:i.status==='overdue'?'var(--error-600)':'var(--text-muted)', fontWeight:i.status==='overdue'?600:400}}>{dateFR(i.due)}</td>
                      <td><InvoiceBadge status={i.status}/></td>
                      <td className="cell-amount">{euro(i.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon="invoices" title="Aucune facture" message="Aucune facture ne correspond à ce filtre."/>}
      </Card>
    </div>
  );
}

function InvoiceDetail({ invoiceId, navigate, openMission, openClient, role }) {
  const forms = useForms();
  const toast = useToast();
  const i = INVOICES.find(x=>x.id===invoiceId);
  if (!i) return <EmptyState icon="invoices" title="Facture introuvable"/>;
  const m = MISSIONS.find(x=>x.id===i.mission);
  const c = clientById(i.client);
  const ht = i.amount, tva = ht*0.2, ttc = ht*1.2;
  const isConsultant = role==='consultant';
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:isConsultant?'Mes factures':'Factures', to:'invoices'},{label:i.id}]} navigate={navigate}/>
      <div className="page-head">
        <div>
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:6}}><span className="cell-mono" style={{fontSize:'var(--t-sm)'}}>{i.id}</span><InvoiceBadge status={i.status}/></div>
          <h1 className="page-title">{euro(i.amount)}</h1>
          <p className="page-sub">{c.name} · échéance {dateFR(i.due)}</p>
        </div>
        <div className="head-actions">
          <Btn variant="secondary" icon="download" onClick={()=>toast.info('Export PDF','La facture '+i.id+' a été générée.')}>PDF</Btn>
          {!isConsultant && i.status!=='paid' && <Btn variant="primary" icon="check" onClick={()=>{ const idx=INVOICES.findIndex(x=>x.id===i.id); if(idx>=0) INVOICES[idx]={...INVOICES[idx], status:'paid'}; forms.bump(); toast.success('Facture encaissée', i.id+' marquée comme payée.'); }}>Marquer payée</Btn>}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:'var(--sp-5)', alignItems:'start'}}>
        <Card title="Détail de la facture">
          <div className="table-wrap" style={{margin:'calc(-1*var(--sp-6))', marginBottom:0}}>
            <table className="tbl">
              <thead><tr><th>Prestation</th><th style={{textAlign:'right'}}>Jours</th><th style={{textAlign:'right'}}>TJM</th><th style={{textAlign:'right'}}>Total HT</th></tr></thead>
              <tbody>
                <tr style={{cursor:'default'}}><td className="cell-strong">{m?m.title:'Prestation'}</td><td style={{textAlign:'right', fontFamily:'var(--font-mono)'}}>{m?Math.round(i.amount/m.tjm):'—'}</td><td style={{textAlign:'right', fontFamily:'var(--font-mono)'}}>{m?euro0(m.tjm):'—'}</td><td className="cell-amount">{euro(ht)}</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{marginTop:'var(--sp-6)', marginLeft:'auto', maxWidth:280, display:'flex', flexDirection:'column', gap:8}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'var(--t-sm)', color:'var(--text-muted)'}}><span>Total HT</span><span style={{fontFamily:'var(--font-mono)'}}>{euro(ht)}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'var(--t-sm)', color:'var(--text-muted)'}}><span>TVA (20 %)</span><span style={{fontFamily:'var(--font-mono)'}}>{euro(tva)}</span></div>
            <div style={{display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid var(--border-default)', fontWeight:700, color:'var(--text-strong)'}}><span>Total TTC</span><span style={{fontFamily:'var(--font-mono)', color:'var(--emerald-700)'}}>{euro(ttc)}</span></div>
          </div>
        </Card>

        <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
          <Card title="Informations">
            <div className="dl">
              <dt>Statut</dt><dd><InvoiceBadge status={i.status}/></dd>
              <dt>Émise le</dt><dd>{dateFR(i.issued)}</dd>
              <dt>Échéance</dt><dd>{dateFR(i.due)}</dd>
            </div>
          </Card>
          <Card title="Mission liée">
            <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={()=>m&&openMission(m.id)}>
              <span style={{width:42, height:42, borderRadius:'var(--r-md)', background:'var(--bg-brand-soft)', display:'grid', placeItems:'center', color:'var(--emerald-700)', flex:'none'}}><Icon name="missions" size={20}/></span>
              <div style={{flex:1}}><div style={{fontWeight:700, color:'var(--text-strong)'}}>{m?m.title:'—'}</div><div className="cell-mono">{i.mission}</div></div>
              <Icon name="chevright" size={18} style={{color:'var(--text-subtle)'}}/>
            </div>
          </Card>
          {!isConsultant && (
            <Card title="Client">
              <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={()=>openClient(c.id)}>
                <span style={{width:42, height:42, borderRadius:'var(--r-md)', background:'var(--bg-sunken)', display:'grid', placeItems:'center', color:'var(--text-muted)', flex:'none'}}><Icon name="building" size={20}/></span>
                <div style={{flex:1}}><div style={{fontWeight:700, color:'var(--text-strong)'}}>{c.name}</div><div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>{c.sector}</div></div>
                <Icon name="chevright" size={18} style={{color:'var(--text-subtle)'}}/>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InvoicesList, InvoiceDetail });
