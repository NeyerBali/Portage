/* PORTÉO — Application principale (routeur + état global) */
const { useState: uS, useEffect: uE } = React;

function NotificationsPanel({ open, onClose }) {
  if (!open) return null;
  const items = [
    { type:'error', ic:'alert', t:'Facture en retard', d:'FAC-2026-0260 · 51 000 € — Helios Énergie', when:'Il y a 2 h' },
    { type:'info', ic:'plus', t:'Nouvelle mission', d:'MIS-2026-0163 créée — Architecture micro-services', when:'Il y a 5 h' },
    { type:'success', ic:'checkcircle', t:'Facture payée', d:'FAC-2026-0244 · 43 200 € — Atlas Banque', when:'Hier' },
    { type:'warning', ic:'clock', t:'CRA en attente', d:'2 consultants n\'ont pas validé leur CRA', when:'Hier' },
  ];
  const col = { error:'var(--error-600)', info:'var(--info-600)', success:'var(--success-600)', warning:'var(--warning-600)' };
  return (
    <>
      <div style={{position:'fixed', inset:0, zIndex:90}} onClick={onClose}></div>
      <div style={{position:'fixed', top:'calc(var(--topbar-h) + 8px)', right:'var(--sp-6)', width:380, maxWidth:'calc(100vw - 32px)', background:'var(--bg-surface-2)', border:'1px solid var(--border-default)', borderRadius:'var(--r-lg)', boxShadow:'var(--shadow-xl)', zIndex:95, overflow:'hidden'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', borderBottom:'1px solid var(--border-subtle)'}}>
          <strong style={{fontSize:'var(--t-h5)', color:'var(--text-strong)'}}>Notifications</strong>
          <span className="link" style={{fontSize:'var(--t-sm)'}} onClick={onClose}>Tout marquer lu</span>
        </div>
        <div style={{maxHeight:380, overflowY:'auto'}}>
          {items.map((n,i)=>(
            <div key={i} style={{display:'flex', gap:12, padding:'14px 18px', borderBottom:'1px solid var(--border-subtle)', cursor:'pointer'}} className="notif-row">
              <span style={{color:col[n.type], flex:'none', marginTop:1}}><Icon name={n.ic} size={20}/></span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, fontSize:'var(--t-sm)', color:'var(--text-strong)'}}>{n.t}</div>
                <div style={{fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>{n.d}</div>
                <div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)', marginTop:3}}>{n.when}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AppInner() {
  const toast = useToast();
  const forms = useForms();
  const dataVersion = forms.version; // re-render lists when data mutates
  const [authed, setAuthed] = uS(()=>{ try { return localStorage.getItem('porteo-authed')==='1'; } catch(e){ return false; } });
  const [authSub, setAuthSub] = uS('login');
  const [theme, setThemeState] = uS(()=>{ try { return localStorage.getItem('porteo-theme')||'light'; } catch(e){ return 'light'; } });
  const [palette, setPaletteState] = uS(()=>{ try { return localStorage.getItem('porteo-palette')||'emerald'; } catch(e){ return 'emerald'; } });
  const [role, setRole] = uS(()=>{ try { return localStorage.getItem('porteo-role')||'admin'; } catch(e){ return 'admin'; } });
  const [collapsed, setCollapsed] = uS(false);
  const [screen, setScreen] = uS('dashboard');
  const [sel, setSel] = uS({});
  const [bell, setBell] = uS(false);

  const [del, setDel] = uS(null);

  const setTheme = (t)=>{ setThemeState(t); document.documentElement.setAttribute('data-theme', t); try{ localStorage.setItem('porteo-theme', t); }catch(e){} };
  const setPalette = (p)=>{ setPaletteState(p); document.documentElement.setAttribute('data-palette', p); try{ localStorage.setItem('porteo-palette', p); }catch(e){} };
  uE(()=>{ document.documentElement.setAttribute('data-theme', theme); document.documentElement.setAttribute('data-palette', palette); }, []);
  uE(()=>{ window.scrollTo(0,0); }, [screen, sel]);

  const user = role==='admin' ? { name:'Élise Marchand', email:'elise.marchand@porteo.fr' } : { name:'Camille Rousseau', email:'c.rousseau@porteo.fr' };

  const navigate = (s)=>{ setScreen(s); setSel({}); };
  const openMission = (id)=>{ setScreen('mission'); setSel({mission:id}); };
  const openClient = (id)=>{ setScreen('client'); setSel({client:id}); };
  const openConsultant = (id)=>{ setScreen('consultant'); setSel({consultant:id}); };
  const openInvoice = (id)=>{ setScreen('invoice'); setSel({invoice:id}); };

  // role change resets to dashboard
  const changeRole = (r)=>{ setRole(r); setScreen('dashboard'); setSel({}); try{ localStorage.setItem('porteo-role', r); }catch(e){} toast.info('Rôle changé', r==='admin'?'Vue Administrateur — accès complet.':'Vue Consultant — vos données uniquement.'); };

  const onCreate = ()=> forms.openMissionForm();
  const onEdit = (m)=> forms.openMissionForm(m);
  const onDelete = (m)=> setDel(m);
  const confirmDelete = ()=>{
    if (del.bulk) { del.bulk.forEach(id=>{ const i=MISSIONS.findIndex(m=>m.id===id); if(i>=0) MISSIONS.splice(i,1); }); toast.success('Missions supprimées', `${del.bulk.length} missions supprimées.`); }
    else { const i=MISSIONS.findIndex(m=>m.id===del.id); if(i>=0) MISSIONS.splice(i,1); toast.success('Mission supprimée', `${del.title} a été supprimée.`); if(screen==='mission') navigate('missions'); }
    forms.bump(); setDel(null);
  };

  if (!authed) {
    return <AuthFlow sub={authSub} go={setAuthSub} onLogin={()=>{ setAuthed(true); setAuthSub('login'); try{ localStorage.setItem('porteo-authed','1'); }catch(e){} toast.success('Bienvenue','Connexion réussie.'); }}/>;
  }

  let content;
  if (screen==='dashboard') content = role==='admin' ? <AdminDashboard navigate={navigate} openMission={openMission}/> : <ConsultantDashboard navigate={navigate} openMission={openMission} user={user}/>;
  else if (screen==='missions') content = <MissionsList navigate={navigate} openMission={openMission} role={role} missions={role==='consultant'?MISSIONS.filter(m=>m.consultant==='C-01'):MISSIONS} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete}/>;
  else if (screen==='mission') content = <MissionDetail missionId={sel.mission} navigate={navigate} openMission={openMission} openClient={openClient} openConsultant={openConsultant} role={role} onEdit={onEdit} onDelete={onDelete}/>;
  else if (screen==='clients') content = <ClientsList navigate={navigate} openClient={openClient}/>;
  else if (screen==='client') content = <ClientDetail clientId={sel.client} navigate={navigate} openClient={openClient} openMission={openMission} openConsultant={openConsultant}/>;
  else if (screen==='consultants') content = <ConsultantsList navigate={navigate} openConsultant={openConsultant}/>;
  else if (screen==='consultant') content = <ConsultantDetail consultantId={sel.consultant} navigate={navigate} openMission={openMission}/>;
  else if (screen==='invoices') content = <InvoicesList navigate={navigate} openInvoice={openInvoice} role={role}/>;
  else if (screen==='invoice') content = <InvoiceDetail invoiceId={sel.invoice} navigate={navigate} openMission={openMission} openClient={openClient} role={role}/>;
  else if (screen==='settings') content = <Settings navigate={navigate} role={role} user={user} theme={theme} setTheme={setTheme} palette={palette} setPalette={setPalette} toast={toast}/>;

  const navKey = ['mission'].includes(screen)?'missions':['client'].includes(screen)?'clients':['consultant'].includes(screen)?'consultants':['invoice'].includes(screen)?'invoices':screen;

  return (
    <div className={'app '+(collapsed?'collapsed':'')}>
      <Sidebar role={role} screen={navKey} navigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} user={user}/>
      <div className="main">
        <Topbar role={role} setRole={changeRole} theme={theme} setTheme={setTheme} user={user} onBell={()=>setBell(b=>!b)} onLogout={()=>{ setAuthed(false); setScreen('dashboard'); try{ localStorage.removeItem('porteo-authed'); }catch(e){} }}/>
        <NotificationsPanel open={bell} onClose={()=>setBell(false)}/>
        <div className="content">{content}</div>
      </div>

      <Dialog open={!!del} onClose={()=>setDel(null)} icon="trash" tone="danger" destructive
        title={del&&del.bulk?`Supprimer ${del.bulk.length} missions ?`:'Supprimer cette mission ?'}
        message={del&&del.bulk?'Cette action est irréversible. Les missions sélectionnées seront définitivement supprimées.':`« ${del?del.title:''} » sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer" onConfirm={confirmDelete}/>
    </div>
  );
}

function App(){ return <ToastProvider><FormsProvider><AppInner/></FormsProvider></ToastProvider>; }

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
