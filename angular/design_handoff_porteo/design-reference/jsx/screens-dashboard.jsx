/* PORTÉO — Dashboards Admin & Consultant */

function Kpi({ icon, tone, label, value, delta, deltaDir, spark }) {
  const toneBg = { brand:'var(--bg-brand-soft)', info:'var(--info-50)', warn:'var(--warning-50)', error:'var(--error-50)' }[tone] || 'var(--bg-brand-soft)';
  const toneFg = { brand:'var(--emerald-700)', info:'var(--info-600)', warn:'var(--warning-600)', error:'var(--error-600)' }[tone] || 'var(--emerald-700)';
  return (
    <div className="card kpi">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <span className="kpi-ic" style={{background:toneBg, color:toneFg}}><Icon name={icon} size={20}/></span>
        {spark && <Spark data={spark} color={toneFg}/>}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val">{value}</div>
      {delta && <div className={'kpi-delta '+(deltaDir||'up')}><Icon name={deltaDir==='down'?'arrowdown':'arrowup'} size={13}/>{delta}<span style={{color:'var(--text-subtle)', fontWeight:500}}> vs mois préc.</span></div>}
    </div>
  );
}

function AdminDashboard({ navigate, openMission }) {
  const forms = useForms();
  const activeMissions = MISSIONS.filter(m=>m.status==='progress').length;
  const totalCA = MISSIONS.filter(m=>m.status!=='canceled' && m.status!=='draft').reduce((s,m)=>s+m.amount,0);
  const unpaid = INVOICES.filter(i=>i.status==='overdue' || i.status==='issued').reduce((s,i)=>s+i.amount,0);
  const statusCounts = Object.keys(STATUS).map(k=>({ key:k, label:STATUS[k].label, value:MISSIONS.filter(m=>m.status===k).length,
    color:{draft:'#64748B',progress:'#2D7FF9',done:'#15A66A',invoiced:'#8B5CF6',canceled:'#B0443A'}[k] }));
  const topClients = CLIENTS.map(c=>({ label:c.name, value:missionsOfClient(c.id).filter(m=>m.status!=='canceled').reduce((s,m)=>s+m.amount,0) }))
    .sort((a,b)=>b.value-a.value).slice(0,5);
  const recent = [
    { ic:'plus', t:'Nouvelle mission créée', d:'MIS-2026-0163 · Architecture micro-services — Helios Énergie', when:'Il y a 2 h' },
    { ic:'checkcircle', t:'Mission terminée', d:'MIS-2025-0097 · Audit sécurité SI — Quanta Assurances', when:'Il y a 5 h' },
    { ic:'invoices', t:'Facture émise', d:'FAC-2026-0263 · 43 200,00 € — Atlas Banque', when:'Hier' },
    { ic:'alert', t:'Facture en retard', d:'FAC-2026-0260 · 51 000,00 € — Helios Énergie', when:'Il y a 2 j' },
    { ic:'user', t:'Consultant intégré', d:'Yanis Dubois · Dév. Mobile', when:'Il y a 3 j' },
  ];
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:'Tableau de bord'}]} navigate={navigate}/>
      <div className="page-head">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-sub">Vue d'ensemble de l'activité — Mars 2026</p>
        </div>
        <div className="head-actions">
          <Btn variant="secondary" icon="download">Exporter</Btn>
          <Btn variant="primary" icon="plus" onClick={()=>forms.openMissionForm()}>Nouvelle mission</Btn>
        </div>
      </div>

      <div className="kpi-grid" style={{marginBottom:'var(--sp-5)'}}>
        <Kpi icon="euro" tone="brand" label="Chiffre d'affaires" value={euro0(totalCA)} delta="+12,4 %" deltaDir="up" spark={[120,140,135,168,160,189,212,234]}/>
        <Kpi icon="briefcase" tone="info" label="Missions actives" value={activeMissions} delta="+3" deltaDir="up" spark={[4,5,5,6,5,6,7,6]}/>
        <Kpi icon="consultants" tone="warn" label="Consultants" value={CONSULTANTS.filter(c=>c.status==='active').length} delta="+1" deltaDir="up" spark={[5,5,6,6,6,7,7,7]}/>
        <Kpi icon="alert" tone="error" label="Factures impayées" value={euro0(unpaid)} delta="+2 retards" deltaDir="down" spark={[2,3,2,4,3,5,4,5]}/>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.7fr 1fr', gap:'var(--sp-5)', marginBottom:'var(--sp-5)'}}>
        <Card title="Chiffre d'affaires" sub="12 derniers mois" action={<span className="stat-pill"><Icon name="trending" size={14} style={{color:'var(--success-600)'}}/>+18 % sur l'année</span>}>
          <RevenueChart data={REVENUE_BY_MONTH}/>
        </Card>
        <Card title="Missions par statut" sub={MISSIONS.length+' missions au total'}>
          <DonutChart segments={statusCounts}/>
        </Card>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:'var(--sp-5)'}}>
        <Card title="Top 5 clients" sub="par chiffre d'affaires">
          <BarList items={topClients}/>
        </Card>
        <Card title="Dernières activités" action={<span className="link" onClick={()=>navigate('missions')}>Tout voir</span>}>
          <div className="timeline">
            {recent.map((r,i)=>(
              <div className="tl-item" key={i}>
                <div className="tl-dot"><Icon name={r.ic} size={15}/></div>
                <div className="tl-content">
                  <div className="tl-title">{r.t}</div>
                  <div className="tl-desc">{r.d}</div>
                  <div className="tl-meta">{r.when}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ConsultantDashboard({ navigate, openMission, user }) {
  // Camille Rousseau = C-01
  const myId = 'C-01';
  const me = consultantById(myId);
  const myMissions = missionsOfConsultant(myId);
  const active = myMissions.filter(m=>m.status==='progress');
  const myCA = myMissions.filter(m=>m.status!=='canceled' && m.status!=='draft').reduce((s,m)=>s+m.amount,0);
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:'Mon tableau de bord'}]} navigate={navigate}/>
      <div className="page-head">
        <div>
          <h1 className="page-title">Bonjour, {me.name.split(' ')[0]}</h1>
          <p className="page-sub">Voici l'essentiel de vos missions cette semaine.</p>
        </div>
        <div className="head-actions">
          <Btn variant="primary" icon="calendar">Compléter mon CRA</Btn>
        </div>
      </div>

      <div style={{background:'var(--warning-50)', border:'1px solid color-mix(in srgb, var(--warning-500) 30%, transparent)', borderRadius:'var(--r-md)', padding:'14px 18px', display:'flex', alignItems:'center', gap:14, marginBottom:'var(--sp-5)'}}>
        <span style={{color:'var(--warning-600)', flex:'none'}}><Icon name="clock" size={22}/></span>
        <div style={{flex:1}}>
          <div style={{fontWeight:700, fontSize:'var(--t-sm)', color:'var(--text-strong)'}}>Compte rendu d'activité à compléter</div>
          <div style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>Votre CRA de février 2026 est en attente — échéance le 5 mars.</div>
        </div>
        <Btn variant="secondary" size="sm">Compléter</Btn>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)', marginBottom:'var(--sp-5)'}}>
        <Kpi icon="briefcase" tone="brand" label="Missions en cours" value={active.length}/>
        <Kpi icon="euro" tone="info" label="Mon CA cumulé" value={euro0(myCA)} delta="+8,2 %" deltaDir="up"/>
        <Kpi icon="calendar" tone="warn" label="Jours facturés (2026)" value="312 j"/>
      </div>

      <Card title="Mes missions" sub={myMissions.length+' missions au total'} noBody>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Référence</th><th>Mission</th><th>Client</th><th>Statut</th><th style={{textAlign:'right'}}>Montant</th></tr></thead>
            <tbody>
              {myMissions.map(m=>{
                const cl = clientById(m.client);
                return (
                  <tr key={m.id} onClick={()=>openMission(m.id)}>
                    <td className="cell-mono">{m.id}</td>
                    <td className="cell-strong">{m.title}</td>
                    <td>{cl.name}</td>
                    <td><StatusBadge status={m.status}/></td>
                    <td className="cell-amount">{euro(m.amount)}</td>
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

Object.assign(window, { AdminDashboard, ConsultantDashboard, Kpi });
