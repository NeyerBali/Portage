/* PORTÉO — Page Composants (bibliothèque vivante) */
const { useState: useS } = React;

function Sec({ id, n, title, desc, children }) {
  return (
    <section id={id} style={{padding:'var(--sp-8) 0', borderTop:'1px solid var(--border-subtle)'}}>
      <div style={{display:'flex', alignItems:'baseline', gap:14, marginBottom:6}}>
        <span style={{fontFamily:'var(--font-mono)', fontSize:'var(--t-sm)', color:'var(--emerald-600)', fontWeight:600}}>{n}</span>
        <h2 style={{fontFamily:'var(--font-display)', fontWeight:500, fontSize:'var(--t-h3)', color:'var(--text-strong)', letterSpacing:'-0.01em'}}>{title}</h2>
      </div>
      {desc && <p style={{color:'var(--text-muted)', maxWidth:'64ch', marginBottom:'var(--sp-6)'}}>{desc}</p>}
      {children}
    </section>
  );
}
function Demo({ children, label, col }) {
  return (
    <div className="card" style={{padding:'var(--sp-6)'}}>
      {label && <div style={{fontFamily:'var(--font-mono)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-subtle)', marginBottom:'var(--sp-4)'}}>{label}</div>}
      <div style={{display:'flex', gap:'var(--sp-4)', flexWrap:'wrap', alignItems:'center', flexDirection: col?'column':'row', alignItems: col?'stretch':'center'}}>{children}</div>
    </div>
  );
}
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-5)' };

function Showcase() {
  const toast = useToast();
  const [dialog, setDialog] = useS(null);
  const [tab, setTab] = useS('a');
  const [tog, setTog] = useS(true);
  const [cbx, setCbx] = useS(true);
  const [seg, setSeg] = useS('m');
  const [chips, setChips] = useS(['progress']);
  const toggleChip = (k)=> setChips(c=>c.includes(k)?c.filter(x=>x!==k):[...c,k]);

  return (
    <div style={{maxWidth:1140, margin:'0 auto', padding:'0 var(--sp-7) var(--sp-12)'}}>
      <header style={{padding:'var(--sp-11) 0 var(--sp-7)'}}>
        <p className="eyebrow" style={{fontFamily:'var(--font-mono)', fontSize:11.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--emerald-600)', fontWeight:600}}>Système de design · Portéo</p>
        <h1 style={{fontFamily:'var(--font-display)', fontWeight:500, fontSize:'var(--t-h1)', color:'var(--text-strong)', letterSpacing:'-0.02em', margin:'12px 0 10px'}}>Bibliothèque de composants</h1>
        <p style={{color:'var(--text-muted)', fontSize:'var(--t-body-lg)', maxWidth:'60ch'}}>Tous les éléments d'interface réutilisables, dans leurs états. Chaque composant correspond à un futur composant Angular + Material.</p>
      </header>

      {/* BUTTONS */}
      <Sec id="btn" n="01" title="Boutons" desc="Cinq variantes, trois tailles, états icône, chargement et désactivé.">
        <div style={grid2}>
          <Demo label="Variantes">
            <Btn variant="primary" icon="plus">Primaire</Btn>
            <Btn variant="secondary" icon="download">Secondaire</Btn>
            <Btn variant="ghost">Ghost</Btn>
            <Btn variant="destructive" icon="trash">Destructif</Btn>
          </Demo>
          <Demo label="Tailles & icône">
            <Btn variant="primary" size="sm">Petit</Btn>
            <Btn variant="primary">Normal</Btn>
            <Btn variant="primary" size="lg">Grand</Btn>
            <Btn variant="secondary"><Icon name="more" size={18}/></Btn>
            <Btn variant="primary" disabled>Désactivé</Btn>
          </Demo>
        </div>
      </Sec>

      {/* FORMS */}
      <Sec id="forms" n="02" title="Champs de formulaire" desc="Input, select, date, textarea, toggle, checkbox, segmenté — avec libellés, aides et erreurs.">
        <div style={grid2}>
          <Demo label="Saisie" col>
            <Field label="Intitulé" required hint="Visible par le client"><Input placeholder="Migration Data Lake" icon="missions"/></Field>
            <Field label="Client" required><Select><option>Atlas Banque</option><option>Helios Énergie</option></Select></Field>
            <Field label="Date de début"><Input type="date" defaultValue="2026-03-01"/></Field>
          </Demo>
          <Demo label="États & contrôles" col>
            <Field label="E-mail" error="Format d'e-mail invalide"><Input icon="mail" defaultValue="invalide@"/></Field>
            <Field label="Note"><Textarea placeholder="Ajouter une note…"/></Field>
            <div style={{display:'flex', gap:24, alignItems:'center', flexWrap:'wrap'}}>
              <label style={{display:'flex', gap:8, alignItems:'center', fontSize:'var(--t-sm)'}}><Toggle checked={tog} onChange={setTog}/> Notifications</label>
              <label style={{display:'flex', gap:8, alignItems:'center', fontSize:'var(--t-sm)'}} onClick={()=>setCbx(!cbx)}><Checkbox checked={cbx} onChange={setCbx}/> J'accepte</label>
              <div className="segmented">{[['s','Jour'],['m','Semaine'],['l','Mois']].map(([k,l])=><button key={k} className={seg===k?'on':''} onClick={()=>setSeg(k)}>{l}</button>)}</div>
            </div>
          </Demo>
        </div>
      </Sec>

      {/* BADGES */}
      <Sec id="badges" n="03" title="Badges de statut" desc="Statuts de mission et de facture, code couleur cohérent (clair + sombre).">
        <div style={grid2}>
          <Demo label="Missions">
            {['draft','progress','done','invoiced','canceled'].map(s=><StatusBadge key={s} status={s}/>)}
          </Demo>
          <Demo label="Factures">
            {['draft','issued','paid','overdue'].map(s=><InvoiceBadge key={s} status={s}/>)}
          </Demo>
        </div>
        <div style={{marginTop:'var(--sp-5)'}}>
          <Demo label="Chips de filtre (cliquables)">
            {[['draft','Brouillon'],['progress','En cours'],['done','Terminée'],['invoiced','Facturée']].map(([k,l])=>(
              <button key={k} className={'fchip '+(chips.includes(k)?'on':'')} onClick={()=>toggleChip(k)}>
                {chips.includes(k) && <Icon name="check" size={14}/>}{l}
              </button>
            ))}
          </Demo>
        </div>
      </Sec>

      {/* TABS */}
      <Sec id="tabs" n="04" title="Onglets">
        <div className="card" style={{padding:'0 var(--sp-6)'}}>
          <Tabs tabs={[{key:'a',label:'Informations'},{key:'b',label:'Factures',count:3},{key:'c',label:'Historique'}]} active={tab} onChange={setTab}/>
          <div style={{padding:'var(--sp-6) 0', color:'var(--text-muted)'}}>Contenu de l'onglet « {tab==='a'?'Informations':tab==='b'?'Factures':'Historique'} ».</div>
        </div>
      </Sec>

      {/* POPUPS */}
      <Sec id="popups" n="05" title="Popups & dialogues" desc="Quatre dialogues réutilisables : confirmation, suppression destructive, générique, erreur.">
        <Demo label="Ouvrir un dialogue">
          <Btn variant="secondary" onClick={()=>setDialog('confirm')}>Confirmation</Btn>
          <Btn variant="secondary" onClick={()=>setDialog('delete')}>Suppression</Btn>
          <Btn variant="secondary" onClick={()=>setDialog('generic')}>Générique</Btn>
          <Btn variant="secondary" onClick={()=>setDialog('error')}>Erreur</Btn>
        </Demo>
        <Dialog open={dialog==='confirm'} onClose={()=>setDialog(null)} icon="checkcircle" tone="brand" title="Valider la mission ?" message="La mission passera au statut « En cours » et le consultant sera notifié." confirmLabel="Valider" onConfirm={()=>{setDialog(null); toast.success('Mission validée');}}/>
        <Dialog open={dialog==='delete'} onClose={()=>setDialog(null)} icon="trash" tone="danger" destructive title="Supprimer cette mission ?" message="« Migration Data Lake » sera définitivement supprimée. Cette action est irréversible." confirmLabel="Supprimer" onConfirm={()=>{setDialog(null); toast.success('Mission supprimée');}}/>
        <Dialog open={dialog==='generic'} onClose={()=>setDialog(null)} icon="info" tone="info" title="Exporter les données" message="Choisissez le format d'export. Le fichier sera téléchargé immédiatement." confirmLabel="Exporter en CSV" onConfirm={()=>{setDialog(null); toast.info('Export lancé');}}/>
        <Dialog open={dialog==='error'} onClose={()=>setDialog(null)} icon="alert" tone="danger" title="Une erreur est survenue" message="Impossible de contacter le serveur. Vérifiez votre connexion et réessayez." confirmLabel="Réessayer" cancelLabel="Fermer" onConfirm={()=>{setDialog(null); toast.error('Nouvelle tentative…');}}/>
      </Sec>

      {/* TOASTS */}
      <Sec id="toasts" n="06" title="Toasts / notifications" desc="Quatre tonalités, auto-disparition, fermeture manuelle.">
        <Demo label="Déclencher un toast">
          <Btn variant="secondary" icon="checkcircle" onClick={()=>toast.success('Mission créée','MIS-2026-0164 a été ajoutée.')}>Succès</Btn>
          <Btn variant="secondary" icon="info" onClick={()=>toast.info('Synchronisation','Données mises à jour.')}>Info</Btn>
          <Btn variant="secondary" icon="alert" onClick={()=>toast.warning('CRA en attente','2 consultants doivent valider.')}>Avertissement</Btn>
          <Btn variant="secondary" icon="alert" onClick={()=>toast.error('Échec','La facture n\'a pas pu être émise.')}>Erreur</Btn>
        </Demo>
      </Sec>

      {/* TABLE */}
      <Sec id="table" n="07" title="Tableau & pagination">
        <Card noBody>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Mission</th><th>Client</th><th>Statut</th><th style={{textAlign:'right'}}>Montant</th></tr></thead>
              <tbody>
                {MISSIONS.slice(0,4).map(m=>(
                  <tr key={m.id} style={{cursor:'default'}}>
                    <td><div className="cell-strong">{m.title}</div><div className="cell-mono" style={{marginTop:2}}>{m.id}</div></td>
                    <td>{clientById(m.client).name}</td>
                    <td><StatusBadge status={m.status}/></td>
                    <td className="cell-amount">{euro(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pager">
            <div className="pager-info">1–4 sur <b>15</b> missions</div>
            <div className="pager-ctrls">
              <button className="pg" disabled><Icon name="chevleft" size={16}/></button>
              <button className="pg on">1</button><button className="pg">2</button><button className="pg">3</button>
              <button className="pg"><Icon name="chevright" size={16}/></button>
            </div>
          </div>
        </Card>
      </Sec>

      {/* EMPTY + SKELETON */}
      <Sec id="states" n="08" title="États vides & chargement" desc="Empty states illustrés et skeletons de chargement pour tableaux et cartes.">
        <div style={grid2}>
          <Card noBody><EmptyState icon="missions" title="Aucune mission" message="Commencez par créer votre première mission de portage." action={<Btn variant="primary" icon="plus">Nouvelle mission</Btn>}/></Card>
          <Card title="Chargement…">
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{display:'flex', gap:12, alignItems:'center'}}>
                  <Skeleton w={40} h={40} r={999}/>
                  <div style={{flex:1}}><Skeleton w="60%" h={13}/><Skeleton w="35%" h={10} style={{marginTop:7}}/></div>
                  <Skeleton w={70} h={22} r={999}/>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Sec>
    </div>
  );
}

function ShowcaseApp(){ return <ToastProvider><Showcase/></ToastProvider>; }
ReactDOM.createRoot(document.getElementById('root')).render(<ShowcaseApp/>);
