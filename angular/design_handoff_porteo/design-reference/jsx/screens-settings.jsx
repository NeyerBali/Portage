/* PORTÉO — Profil & Paramètres */

const PALETTES = [
  { key:'emerald', name:'Émeraude',           primary:'#0E5C4A', accent:'#3DDC97' },
  { key:'gold',    name:'Or & Blanc',         primary:'#5E430B', accent:'#F2B807' },
  { key:'azur',    name:'Bleu ciel & Jaune',  primary:'#134A8C', accent:'#F5C518' },
  { key:'violet',  name:'Améthyste',          primary:'#46199A', accent:'#8B5CF6' },
  { key:'coral',   name:'Corail',             primary:'#88271A', accent:'#FF8A3D' },
];

function Settings({ navigate, role, user, theme, setTheme, palette, setPalette, toast }) {
  const [tab, setTab] = React.useState('profil');
  const [notif, setNotif] = React.useState({ missions:true, factures:true, hebdo:false, retards:true });
  const [vitPalette, setVitPalette] = React.useState(()=>{ try { return localStorage.getItem('porteo-vitrine-palette')||'emerald'; } catch(e){ return 'emerald'; } });
  const applyVit = (key, name)=>{ setVitPalette(key); try{ localStorage.setItem('porteo-vitrine-palette', key); }catch(e){} toast.success('Palette du site vitrine', name+' sera appliquée au site public.'); };
  const tabs = [
    { key:'profil', label:'Profil' },
    { key:'prefs', label:'Préférences' },
    { key:'securite', label:'Sécurité' },
  ];
  return (
    <div className="screen-enter">
      <Breadcrumb items={[{label:'Portéo'},{label:role==='admin'?'Paramètres':'Mon profil'}]} navigate={navigate}/>
      <div className="page-head"><div><h1 className="page-title">{role==='admin'?'Paramètres':'Mon profil'}</h1><p className="page-sub">Gérez vos informations et préférences.</p></div></div>

      <div style={{marginBottom:'var(--sp-6)'}}><Tabs tabs={tabs} active={tab} onChange={setTab}/></div>

      {tab==='profil' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:'var(--sp-5)', alignItems:'start'}}>
          <Card title="Photo">
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:14, padding:'var(--sp-4) 0'}}>
              <Avatar name={user.name} size={96}/>
              <Btn variant="secondary" size="sm" icon="upload">Changer</Btn>
            </div>
          </Card>
          <Card title="Informations personnelles" action={<Btn variant="primary" size="sm" icon="check" onClick={()=>toast.success('Profil enregistré','Vos informations ont été mises à jour.')}>Enregistrer</Btn>}>
            <div className="form-grid">
              <Field label="Prénom"><Input defaultValue={user.name.split(' ')[0]}/></Field>
              <Field label="Nom"><Input defaultValue={user.name.split(' ').slice(1).join(' ')}/></Field>
              <Field label="Adresse e-mail"><Input type="email" icon="mail" defaultValue={user.email}/></Field>
              <Field label="Téléphone"><Input icon="phone" defaultValue="06 12 44 88 21"/></Field>
              <div className="col-2"><Field label="Fonction"><Input defaultValue={role==='admin'?'Responsable portage':'Data Scientist'}/></Field></div>
            </div>
          </Card>
        </div>
      )}

      {tab==='prefs' && (
        <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)', maxWidth:720}}>
          <Card title="Palette de couleurs" sub="S'applique à toute l'application, en clair comme en sombre">
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'var(--sp-3)'}}>
              {PALETTES.map(p=>{
                const on = palette===p.key;
                return (
                  <button key={p.key} onClick={()=>{ setPalette(p.key); toast.success('Palette appliquée', p.name+' est maintenant active.'); }}
                    style={{textAlign:'left', cursor:'pointer', padding:12, borderRadius:'var(--r-md)', background:'var(--bg-surface)',
                      border:'1.5px solid '+(on?'var(--border-brand)':'var(--border-default)'),
                      boxShadow: on?'var(--ring)':'none', transition:'all var(--dur-fast) var(--ease)'}}>
                    <div style={{display:'flex', gap:6, marginBottom:10}}>
                      <span style={{width:'100%', height:30, borderRadius:7, background:p.primary}}></span>
                      <span style={{width:30, height:30, borderRadius:7, background:p.accent, flex:'none'}}></span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                      <span style={{fontWeight:600, fontSize:'var(--t-sm)', color:'var(--text-strong)'}}>{p.name}</span>
                      {on && <span style={{color:'var(--emerald-600)', display:'grid', placeItems:'center'}}><Icon name="checkcircle" size={17}/></span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {role==='admin' && (
            <Card title="Palette du site vitrine" sub="Couleurs de la page marketing publique — indépendante de l'application"
              action={<a className="link" href="Vitrine Portéo.html" target="_blank" rel="noopener" style={{display:'inline-flex', alignItems:'center', gap:6}}><Icon name="external" size={15}/>Ouvrir le site</a>}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'var(--sp-3)'}}>
                {PALETTES.map(p=>{
                  const on = vitPalette===p.key;
                  return (
                    <button key={p.key} onClick={()=>applyVit(p.key, p.name)}
                      style={{textAlign:'left', cursor:'pointer', padding:12, borderRadius:'var(--r-md)', background:'var(--bg-surface)',
                        border:'1.5px solid '+(on?'var(--border-brand)':'var(--border-default)'),
                        boxShadow: on?'var(--ring)':'none', transition:'all var(--dur-fast) var(--ease)'}}>
                      <div style={{display:'flex', gap:6, marginBottom:10}}>
                        <span style={{width:'100%', height:30, borderRadius:7, background:p.primary}}></span>
                        <span style={{width:30, height:30, borderRadius:7, background:p.accent, flex:'none'}}></span>
                      </div>
                      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                        <span style={{fontWeight:600, fontSize:'var(--t-sm)', color:'var(--text-strong)'}}>{p.name}</span>
                        {on && <span style={{color:'var(--emerald-600)', display:'grid', placeItems:'center'}}><Icon name="checkcircle" size={17}/></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          <Card title="Apparence">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div><div style={{fontWeight:600, color:'var(--text-strong)'}}>Thème de l'interface</div><div style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>Choisissez entre le mode clair et sombre.</div></div>
              <div className="segmented">
                <button className={theme==='light'?'on':''} onClick={()=>setTheme('light')}>Clair</button>
                <button className={theme==='dark'?'on':''} onClick={()=>setTheme('dark')}>Sombre</button>
              </div>
            </div>
          </Card>
          <Card title="Notifications">
            {[['missions','Nouvelles missions','Être alerté à la création d\'une mission'],['factures','Factures','Émission et paiement de factures'],['retards','Factures en retard','Alertes sur les échéances dépassées'],['hebdo','Récapitulatif hebdomadaire','Un résumé chaque lundi matin']].map(([k,t,d],idx)=>(
              <div key={k} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderTop: idx>0?'1px solid var(--border-subtle)':'none'}}>
                <div><div style={{fontWeight:600, color:'var(--text-strong)'}}>{t}</div><div style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>{d}</div></div>
                <Toggle checked={notif[k]} onChange={v=>setNotif(n=>({...n,[k]:v}))}/>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==='securite' && (
        <div style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)', maxWidth:720}}>
          <Card title="Mot de passe" action={<Btn variant="secondary" size="sm" onClick={()=>toast.success('Mot de passe modifié')}>Mettre à jour</Btn>}>
            <div className="form-grid">
              <div className="col-2"><Field label="Mot de passe actuel"><Input type="password" icon="lock" placeholder="••••••••"/></Field></div>
              <Field label="Nouveau mot de passe"><Input type="password" icon="lock" placeholder="••••••••"/></Field>
              <Field label="Confirmer"><Input type="password" icon="lock" placeholder="••••••••"/></Field>
            </div>
          </Card>
          <Card title="Double authentification">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{maxWidth:'46ch'}}><div style={{fontWeight:600, color:'var(--text-strong)'}}>Vérification en deux étapes (2FA)</div><div style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>Un code à usage unique est demandé par SMS à chaque connexion.</div></div>
              <Toggle checked={true} onChange={()=>{}}/>
            </div>
          </Card>
          {role==='admin' && (
            <Card title="Zone sensible" className="" >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{maxWidth:'46ch'}}><div style={{fontWeight:600, color:'var(--error-600)'}}>Désactiver le compte</div><div style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>L'accès sera suspendu. Cette action peut être annulée par un administrateur.</div></div>
                <Btn variant="destructive" size="sm" icon="trash" onClick={()=>toast.warning('Action sensible','Cette démonstration ne désactive aucun compte.')}>Désactiver</Btn>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Settings });
