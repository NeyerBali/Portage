/* PORTÉO — Layout : Sidebar, Topbar, Breadcrumb */

const NAV = {
  admin: [
    { section:'Pilotage', items:[
      { key:'dashboard', label:'Tableau de bord', icon:'dashboard' },
    ]},
    { section:'Gestion', items:[
      { key:'missions', label:'Missions', icon:'missions' },
      { key:'clients', label:'Clients', icon:'clients' },
      { key:'consultants', label:'Consultants', icon:'consultants' },
      { key:'invoices', label:'Factures', icon:'invoices', badge:'3' },
    ]},
    { section:'Compte', items:[
      { key:'settings', label:'Paramètres', icon:'settings' },
    ]},
  ],
  consultant: [
    { section:'Mon espace', items:[
      { key:'dashboard', label:'Mon tableau de bord', icon:'dashboard' },
      { key:'missions', label:'Mes missions', icon:'missions' },
      { key:'invoices', label:'Mes factures', icon:'invoices' },
    ]},
    { section:'Compte', items:[
      { key:'settings', label:'Mon profil', icon:'settings' },
    ]},
  ],
};

function Sidebar({ role, screen, navigate, collapsed, setCollapsed, user }) {
  const groups = NAV[role];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span className="sb-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 19V7.5C6 6.4 6.9 5.5 8 5.5h5.2c3 0 5.3 2.2 5.3 5s-2.3 5-5.3 5H10" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/><circle cx="9.6" cy="18.6" r="1.7" fill="var(--accent)"/></svg>
        </span>
        <span className="sb-word">Portéo</span>
      </div>

      <div className="sb-role">
        <span className="avatar" style={{background:avatarColor(user.name)}}>{initials(user.name)}</span>
        <div className="who">
          <b>{user.name}</b>
          <small>{role==='admin'?'Administrateur':'Consultant'}</small>
        </div>
      </div>

      <nav className="nav">
        {groups.map(g => (
          <React.Fragment key={g.section}>
            <div className="sb-section-label">{g.section}</div>
            {g.items.map(it => (
              <button key={it.key} className={'nav-item '+(screen===it.key?'active':'')} onClick={()=>navigate(it.key)} title={it.label}>
                <Icon name={it.icon} size={20} stroke={screen===it.key?2.2:2}/>
                <span>{it.label}</span>
                {it.badge && <span className="nav-badge">{it.badge}</span>}
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="sb-foot">
        <button className="nav-item" onClick={()=>setCollapsed(!collapsed)} title="Replier le menu">
          <Icon name="panel" size={20}/>
          <span className="sb-foot-text">Replier le menu</span>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ role, setRole, theme, setTheme, user, onBell, onLogout }) {
  const [menu, setMenu] = React.useState(false);
  return (
    <header className="topbar">
      <div className="searchbar" style={{flex:'0 1 360px'}}>
        <Icon name="search" size={18}/>
        <input placeholder="Rechercher une mission, un client, un consultant…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="tb-spacer"></div>

      <div className="role-switch" role="group" aria-label="Rôle">
        <button aria-pressed={role==='admin'} onClick={()=>setRole('admin')}><Icon name="shield" size={15}/>Admin</button>
        <button aria-pressed={role==='consultant'} onClick={()=>setRole('consultant')}><Icon name="user" size={15}/>Consultant</button>
      </div>

      <button className="icon-btn ring" title={theme==='dark'?'Mode clair':'Mode sombre'} onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
        <Icon name={theme==='dark'?'sun':'moon'} size={18}/>
      </button>

      <button className="icon-btn ring" title="Notifications" onClick={onBell} style={{position:'relative'}}>
        <Icon name="bell" size={18}/>
        <span style={{position:'absolute', top:7, right:8, width:7, height:7, borderRadius:999, background:'var(--error-500)', border:'1.5px solid var(--bg-surface)'}}></span>
      </button>

      <div style={{position:'relative'}}>
        <button className="tb-user" onClick={()=>setMenu(m=>!m)}>
          <span className="avatar" style={{background:avatarColor(user.name)}}>{initials(user.name)}</span>
          <div style={{textAlign:'left'}}>
            <div className="nm">{user.name}</div>
            <div className="rl">{role==='admin'?'Administrateur':'Consultant'}</div>
          </div>
          <Icon name="chevdown" size={16} style={{color:'var(--text-subtle)'}}/>
        </button>
        {menu && (
          <>
            <div style={{position:'fixed', inset:0, zIndex:40}} onClick={()=>setMenu(false)}></div>
            <div style={{position:'absolute', right:0, top:'calc(100% + 8px)', width:220, background:'var(--bg-surface-2)', border:'1px solid var(--border-default)', borderRadius:'var(--r-md)', boxShadow:'var(--shadow-lg)', padding:6, zIndex:50}}>
              <div style={{padding:'10px 12px', borderBottom:'1px solid var(--border-subtle)', marginBottom:4}}>
                <div style={{fontWeight:700, fontSize:'var(--t-sm)', color:'var(--text-strong)'}}>{user.name}</div>
                <div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>{user.email}</div>
              </div>
              {[['user','Mon profil'],['settings','Paramètres'],['helpcircle','Aide']].map(([ic,lb])=>(
                <button key={lb} className="nav-item" style={{padding:'9px 12px'}} onClick={()=>setMenu(false)}><Icon name={ic} size={18}/><span>{lb}</span></button>
              ))}
              <div style={{height:1, background:'var(--border-subtle)', margin:'4px 0'}}></div>
              <button className="nav-item" style={{padding:'9px 12px', color:'var(--error-600)'}} onClick={()=>{setMenu(false); onLogout&&onLogout();}}><Icon name="logout" size={18}/><span>Se déconnecter</span></button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function Breadcrumb({ items, navigate }) {
  return (
    <nav className="crumbs">
      {items.map((c,i) => (
        <React.Fragment key={i}>
          {i>0 && <Icon name="chevright" size={14} style={{opacity:0.5}}/>}
          {c.to ? <a onClick={()=>navigate(c.to)}>{c.label}</a> : <b>{c.label}</b>}
        </React.Fragment>
      ))}
    </nav>
  );
}

Object.assign(window, { Sidebar, Topbar, Breadcrumb, NAV });
