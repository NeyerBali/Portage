/* PORTÉO — Formulaires centralisés (Client, Consultant, Facture) + provider données */
const FormsCtx = React.createContext(null);
function useForms(){ return React.useContext(FormsCtx); }

const SECTORS = ['Banque / Finance','Énergie','Pharmaceutique','Industrie','Distribution','Assurance','Télécom','Conseil','Secteur public','Autre'];

/* ------- Client ------- */
function ClientFormModal({ open, onClose, onSave, editing }) {
  const blank = { name:'', sector:'', siret:'', contact:'', email:'', city:'' };
  const [f,setF] = React.useState(blank);
  const [err,setErr] = React.useState({});
  React.useEffect(()=>{ if(open){ setF(editing?{...editing}:blank); setErr({}); } }, [open, editing]);
  const set=(k,v)=>{ setF(s=>({...s,[k]:v})); setErr(e=>({...e,[k]:null})); };
  const submit=()=>{
    const e={};
    if(!f.name.trim()) e.name='Le nom du client est requis.';
    if(!f.sector) e.sector='Sélectionnez un secteur.';
    if(!f.contact.trim()) e.contact='Le contact est requis.';
    if(!f.email.trim()) e.email='L\'e-mail est requis.';
    else if(!/^[^@]+@[^@]+\.[^@]+$/.test(f.email)) e.email='Format d\'e-mail invalide.';
    if(!f.city.trim()) e.city='La ville est requise.';
    setErr(e); if(Object.keys(e).length) return;
    onSave(f);
  };
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="modal-head">
        <span className="modal-ic brand"><Icon name={editing?'edit':'building'} size={22}/></span>
        <div className="mh-text"><h3>{editing?'Modifier le client':'Nouveau client'}</h3><div className="mh-sub">{editing?editing.id:'Renseignez les informations de l\'entreprise cliente.'}</div></div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={20}/></button>
      </div>
      <div className="modal-body">
        <div className="form-grid">
          <div className="col-2"><Field label="Raison sociale" required error={err.name}><Input placeholder="Ex. Atlas Banque" value={f.name} onChange={e=>set('name',e.target.value)} icon="building"/></Field></div>
          <Field label="Secteur" required error={err.sector}><Select value={f.sector} onChange={e=>set('sector',e.target.value)}><option value="">— Sélectionner —</option>{SECTORS.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
          <Field label="SIRET" error={err.siret}><Input placeholder="552 081 317 00012" value={f.siret} onChange={e=>set('siret',e.target.value)}/></Field>
          <Field label="Contact principal" required error={err.contact}><Input placeholder="Marie Lefèvre" value={f.contact} onChange={e=>set('contact',e.target.value)} icon="user"/></Field>
          <Field label="Ville" required error={err.city}><Input placeholder="Paris" value={f.city} onChange={e=>set('city',e.target.value)}/></Field>
          <div className="col-2"><Field label="E-mail de contact" required error={err.email}><Input type="email" placeholder="contact@entreprise.fr" value={f.email} onChange={e=>set('email',e.target.value)} icon="mail"/></Field></div>
        </div>
      </div>
      <div className="modal-foot">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" icon="check" onClick={submit}>{editing?'Enregistrer':'Créer le client'}</Btn>
      </div>
    </Modal>
  );
}

/* ------- Consultant ------- */
function ConsultantFormModal({ open, onClose, onSave, editing }) {
  const blank = { name:'', role:'', email:'', phone:'', tjm:'', city:'', skills:'', status:'active' };
  const [f,setF] = React.useState(blank);
  const [err,setErr] = React.useState({});
  React.useEffect(()=>{ if(open){ setF(editing?{...editing, tjm:String(editing.tjm), skills:(editing.skills||[]).join(', ')}:blank); setErr({}); } }, [open, editing]);
  const set=(k,v)=>{ setF(s=>({...s,[k]:v})); setErr(e=>({...e,[k]:null})); };
  const submit=()=>{
    const e={};
    if(!f.name.trim()) e.name='Le nom est requis.';
    if(!f.role.trim()) e.role='Le métier est requis.';
    if(!f.email.trim()) e.email='L\'e-mail est requis.';
    else if(!/^[^@]+@[^@]+\.[^@]+$/.test(f.email)) e.email='Format d\'e-mail invalide.';
    if(!f.tjm || Number(f.tjm)<=0) e.tjm='TJM invalide.';
    if(!f.city.trim()) e.city='La ville est requise.';
    setErr(e); if(Object.keys(e).length) return;
    onSave({ ...f, tjm:Number(f.tjm), skills:f.skills.split(',').map(s=>s.trim()).filter(Boolean) });
  };
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="modal-head">
        <span className="modal-ic brand"><Icon name={editing?'edit':'consultants'} size={22}/></span>
        <div className="mh-text"><h3>{editing?'Modifier le consultant':'Nouveau consultant'}</h3><div className="mh-sub">{editing?editing.id:'Ajoutez un consultant au vivier Portéo.'}</div></div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={20}/></button>
      </div>
      <div className="modal-body">
        <div className="form-grid">
          <Field label="Nom complet" required error={err.name}><Input placeholder="Camille Rousseau" value={f.name} onChange={e=>set('name',e.target.value)} icon="user"/></Field>
          <Field label="Métier" required error={err.role}><Input placeholder="Data Scientist" value={f.role} onChange={e=>set('role',e.target.value)} icon="briefcase"/></Field>
          <Field label="E-mail" required error={err.email}><Input type="email" placeholder="c.rousseau@porteo.fr" value={f.email} onChange={e=>set('email',e.target.value)} icon="mail"/></Field>
          <Field label="Téléphone" error={err.phone}><Input placeholder="06 12 44 88 21" value={f.phone} onChange={e=>set('phone',e.target.value)} icon="phone"/></Field>
          <Field label="TJM (€)" required error={err.tjm}><Input type="number" placeholder="720" value={f.tjm} onChange={e=>set('tjm',e.target.value)}/></Field>
          <Field label="Ville" required error={err.city}><Input placeholder="Lyon" value={f.city} onChange={e=>set('city',e.target.value)}/></Field>
          <div className="col-2"><Field label="Compétences" hint="Séparées par des virgules" error={err.skills}><Input placeholder="Python, ML, SQL" value={f.skills} onChange={e=>set('skills',e.target.value)}/></Field></div>
          <Field label="Statut"><Select value={f.status} onChange={e=>set('status',e.target.value)}><option value="active">Actif</option><option value="paused">En pause</option></Select></Field>
        </div>
      </div>
      <div className="modal-foot">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" icon="check" onClick={submit}>{editing?'Enregistrer':'Ajouter le consultant'}</Btn>
      </div>
    </Modal>
  );
}

/* ------- Facture ------- */
function InvoiceFormModal({ open, onClose, onSave, editing }) {
  const blank = { mission:'', amount:'', issued:'', due:'', status:'draft' };
  const [f,setF] = React.useState(blank);
  const [err,setErr] = React.useState({});
  React.useEffect(()=>{ if(open){ setF(editing?{...editing, amount:String(editing.amount)}:blank); setErr({}); } }, [open, editing]);
  const set=(k,v)=>{ setF(s=>({...s,[k]:v})); setErr(e=>({...e,[k]:null})); };
  const mission = MISSIONS.find(m=>m.id===f.mission);
  const submit=()=>{
    const e={};
    if(!f.mission) e.mission='Sélectionnez une mission.';
    if(!f.amount || Number(f.amount)<=0) e.amount='Montant invalide.';
    if(!f.issued) e.issued='Date d\'émission requise.';
    if(!f.due) e.due='Échéance requise.';
    else if(f.issued && f.due < f.issued) e.due='L\'échéance doit suivre l\'émission.';
    setErr(e); if(Object.keys(e).length) return;
    onSave({ ...f, amount:Number(f.amount), client: mission?mission.client:null });
  };
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="modal-head">
        <span className="modal-ic brand"><Icon name={editing?'edit':'invoices'} size={22}/></span>
        <div className="mh-text"><h3>{editing?'Modifier la facture':'Nouvelle facture'}</h3><div className="mh-sub">{editing?editing.id:'Émettez une facture rattachée à une mission.'}</div></div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={20}/></button>
      </div>
      <div className="modal-body">
        <div className="form-grid">
          <div className="col-2"><Field label="Mission rattachée" required error={err.mission}><Select value={f.mission} onChange={e=>set('mission',e.target.value)}><option value="">— Sélectionner —</option>{MISSIONS.map(m=><option key={m.id} value={m.id}>{m.id} · {m.title}</option>)}</Select></Field></div>
          {mission && <div className="col-2"><div style={{background:'var(--bg-brand-soft)', border:'1px solid var(--border-brand)', borderRadius:'var(--r-sm)', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}><span style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>Client</span><span style={{fontWeight:600, color:'var(--text-strong)'}}>{clientById(mission.client).name}</span></div></div>}
          <Field label="Montant HT (€)" required error={err.amount}><Input type="number" placeholder="30720" value={f.amount} onChange={e=>set('amount',e.target.value)}/></Field>
          <Field label="Statut"><Select value={f.status} onChange={e=>set('status',e.target.value)}>{Object.keys(INVOICE_STATUS).map(k=><option key={k} value={k}>{INVOICE_STATUS[k].label}</option>)}</Select></Field>
          <Field label="Date d'émission" required error={err.issued}><Input type="date" value={f.issued} onChange={e=>set('issued',e.target.value)}/></Field>
          <Field label="Échéance" required error={err.due}><Input type="date" value={f.due} onChange={e=>set('due',e.target.value)}/></Field>
        </div>
      </div>
      <div className="modal-foot">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" icon="check" onClick={submit}>{editing?'Enregistrer':'Émettre la facture'}</Btn>
      </div>
    </Modal>
  );
}

/* ------- Provider : gère ouverture, sauvegarde, et version des données ------- */
function FormsProvider({ children }) {
  const toast = useToast();
  const [version, setVersion] = React.useState(0);
  const bump = ()=> setVersion(v=>v+1);
  const [mission, setMission] = React.useState(null);   // {editing|prefill}
  const [client, setClient] = React.useState(null);
  const [consultant, setConsultant] = React.useState(null);
  const [invoice, setInvoice] = React.useState(null);

  const pad2 = n => String(n).padStart(2,'0');

  const closeAll = ()=>{ setMission(null); setClient(null); setConsultant(null); setInvoice(null); };
  const api = {
    version, bump,
    openMissionForm: (m)=>{ closeAll(); setMission({ editing: m && m.id ? m : null, prefill: m && !m.id ? m : null }); },
    openClientForm: (c)=>{ closeAll(); setClient({ editing: c || null }); },
    openConsultantForm: (c)=>{ closeAll(); setConsultant({ editing: c || null }); },
    openInvoiceForm: (i)=>{ closeAll(); setInvoice({ editing: i || null }); },
  };

  // saves
  const saveMission = (data)=>{
    const ed = mission.editing;
    if (ed) { const idx=MISSIONS.findIndex(m=>m.id===ed.id); if(idx>=0) MISSIONS[idx]={...MISSIONS[idx],...data}; toast.success('Mission modifiée', `${data.title} a été mise à jour.`); }
    else { const id=`MIS-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`; MISSIONS.unshift({...data, id}); toast.success('Mission créée', `${data.title} a été ajoutée.`); }
    setMission(null); bump();
  };
  const saveClient = (data)=>{
    if (client.editing) { const idx=CLIENTS.findIndex(c=>c.id===client.editing.id); if(idx>=0) CLIENTS[idx]={...CLIENTS[idx],...data}; toast.success('Client modifié', `${data.name} a été mis à jour.`); }
    else { const id='CL-'+pad2(CLIENTS.length+1); CLIENTS.push({...data, id, since:new Date().toISOString().slice(0,10)}); toast.success('Client créé', `${data.name} a été ajouté.`); }
    setClient(null); bump();
  };
  const saveConsultant = (data)=>{
    if (consultant.editing) { const idx=CONSULTANTS.findIndex(c=>c.id===consultant.editing.id); if(idx>=0) CONSULTANTS[idx]={...CONSULTANTS[idx],...data}; toast.success('Consultant modifié', `${data.name} a été mis à jour.`); }
    else { const id='C-'+pad2(CONSULTANTS.length+1); CONSULTANTS.push({...data, id, since:new Date().toISOString().slice(0,10)}); toast.success('Consultant ajouté', `${data.name} rejoint le vivier.`); }
    setConsultant(null); bump();
  };
  const saveInvoice = (data)=>{
    if (invoice.editing) { const idx=INVOICES.findIndex(i=>i.id===invoice.editing.id); if(idx>=0) INVOICES[idx]={...INVOICES[idx],...data}; toast.success('Facture modifiée'); }
    else { const id=`FAC-${new Date().getFullYear()}-0${String(Math.floor(Math.random()*900)+100)}`; INVOICES.unshift({...data, id}); toast.success('Facture émise', `${euro(data.amount)} — ${clientById(data.client).name}.`); }
    setInvoice(null); bump();
  };

  return (
    <FormsCtx.Provider value={api}>
      {children}
      <MissionFormModal open={!!mission} onClose={()=>setMission(null)} onSave={saveMission} editing={mission&&mission.editing} prefill={mission&&mission.prefill} toast={toast}/>
      <ClientFormModal open={!!client} onClose={()=>setClient(null)} onSave={saveClient} editing={client&&client.editing}/>
      <ConsultantFormModal open={!!consultant} onClose={()=>setConsultant(null)} onSave={saveConsultant} editing={consultant&&consultant.editing}/>
      <InvoiceFormModal open={!!invoice} onClose={()=>setInvoice(null)} onSave={saveInvoice} editing={invoice&&invoice.editing}/>
    </FormsCtx.Provider>
  );
}

Object.assign(window, { FormsProvider, useForms, ClientFormModal, ConsultantFormModal, InvoiceFormModal });
