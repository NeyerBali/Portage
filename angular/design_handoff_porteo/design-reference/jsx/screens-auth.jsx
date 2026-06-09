/* PORTÉO — Écrans publics (auth) */

function AuthAside() {
  return (
    <div className="auth-aside">
      <div className="ribbon"></div>
      <div style={{position:'relative', display:'flex', alignItems:'center', gap:12}}>
        <span style={{width:38, height:38, borderRadius:11, background:'var(--emerald-600)', display:'grid', placeItems:'center'}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 19V7.5C6 6.4 6.9 5.5 8 5.5h5.2c3 0 5.3 2.2 5.3 5s-2.3 5-5.3 5H10" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/><circle cx="9.6" cy="18.6" r="1.7" fill="var(--accent)"/></svg>
        </span>
        <span style={{fontFamily:'var(--font-display)', fontWeight:600, fontSize:22, color:'#fff'}}>Portéo</span>
      </div>
      <div style={{position:'relative'}}>
        <p style={{fontFamily:'var(--font-mono)', fontSize:11.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--emerald-400)', fontWeight:600, marginBottom:16}}>Portage salarial</p>
        <h2 style={{fontFamily:'var(--font-display)', fontWeight:500, fontSize:38, lineHeight:1.1, color:'#fff', letterSpacing:'-0.02em', maxWidth:'14ch'}}>
          Pilotez vos missions, <em style={{color:'var(--emerald-400)', fontStyle:'italic'}}>en toute clarté.</em>
        </h2>
        <p style={{color:'rgba(255,255,255,0.7)', marginTop:20, fontSize:16, lineHeight:1.6, maxWidth:'42ch'}}>
          Consultants, clients, missions et factures réunis dans une plateforme unique, pensée pour le portage salarial.
        </p>
      </div>
      <div style={{position:'relative', display:'flex', gap:28}}>
        {[['480','Missions gérées'],['96 %','Taux d\'occupation'],['2,8 M€','CA annuel']].map(([n,l])=>(
          <div key={l}>
            <div style={{fontFamily:'var(--font-display)', fontSize:26, fontWeight:500, color:'#fff'}}>{n}</div>
            <div style={{fontSize:12.5, color:'rgba(255,255,255,0.6)', marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({ go, onLogin }) {
  const [email, setEmail] = React.useState('admin@porteo.fr');
  const [pw, setPw] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [err, setErr] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!email) er.email = 'L\'adresse e-mail est requise';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) er.email = 'Format d\'e-mail invalide';
    if (!pw) er.pw = 'Le mot de passe est requis';
    setErr(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(()=>{ setLoading(false); go('2fa'); }, 700);
  };

  return (
    <div className="auth">
      <AuthAside/>
      <div className="auth-main">
        <div className="auth-card screen-enter">
          <h1>Connexion</h1>
          <p className="sub">Accédez à votre espace Portéo.</p>
          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
            <Field label="Adresse e-mail" required error={err.email}>
              <Input type="email" icon="mail" placeholder="vous@entreprise.fr" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
            </Field>
            <Field label="Mot de passe" required error={err.pw}>
              <div className="input-wrap">
                <span className="lead-ic"><Icon name="lock" size={17}/></span>
                <input className="input" type={showPw?'text':'password'} placeholder="••••••••••" value={pw} onChange={e=>setPw(e.target.value)} style={{paddingLeft:40}}/>
                <button type="button" className="trail" onClick={()=>setShowPw(s=>!s)} aria-label="Afficher"><Icon name={showPw?'eyeoff':'eye'} size={18}/></button>
              </div>
            </Field>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'var(--t-sm)', color:'var(--text-muted)'}}>
                <Checkbox checked={true} onChange={()=>{}}/> Se souvenir de moi
              </label>
              <span className="link" onClick={()=>go('forgot')}>Mot de passe oublié ?</span>
            </div>
            <Btn variant="primary" size="lg" className="btn-block" type="submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Btn>
          </form>
          <p style={{textAlign:'center', marginTop:'var(--sp-6)', fontSize:'var(--t-sm)', color:'var(--text-subtle)'}}>
            Première connexion ? <span className="link" onClick={()=>go('first')}>Définir mon mot de passe</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function TwoFAScreen({ go, onLogin }) {
  const [code, setCode] = React.useState(['','','','','','']);
  const [err, setErr] = React.useState('');
  const refs = React.useRef([]);
  const set = (i,v) => {
    if (!/^\d?$/.test(v)) return;
    const c = [...code]; c[i] = v; setCode(c); setErr('');
    if (v && i<5) refs.current[i+1]?.focus();
  };
  const key = (i,e) => { if (e.key==='Backspace' && !code[i] && i>0) refs.current[i-1]?.focus(); };
  const verify = () => {
    if (code.join('').length < 6) { setErr('Saisissez les 6 chiffres du code.'); return; }
    onLogin();
  };
  return (
    <div className="auth">
      <AuthAside/>
      <div className="auth-main">
        <div className="auth-card screen-enter">
          <span className="modal-ic brand" style={{marginBottom:18}}><Icon name="shield" size={24}/></span>
          <h1>Vérification en deux étapes</h1>
          <p className="sub">Saisissez le code à 6 chiffres envoyé au <b style={{color:'var(--text-default)'}}>06 •• •• •• 21</b>.</p>
          <div className="otp" style={{marginBottom: err?10:24}}>
            {code.map((d,i)=>(
              <input key={i} ref={el=>refs.current[i]=el} value={d} className={d?'filled':''} maxLength={1} inputMode="numeric"
                     onChange={e=>set(i,e.target.value)} onKeyDown={e=>key(i,e)} aria-label={'Chiffre '+(i+1)}/>
            ))}
          </div>
          {err && <p className="err-msg" style={{marginBottom:18}}><Icon name="alert" size={14}/>{err}</p>}
          <Btn variant="primary" size="lg" className="btn-block" onClick={verify}>Vérifier et continuer</Btn>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:'var(--sp-6)', fontSize:'var(--t-sm)'}}>
            <span className="link" onClick={()=>go('login')}>← Retour</span>
            <span style={{color:'var(--text-subtle)'}}>Renvoyer le code dans <b style={{color:'var(--text-default)', fontFamily:'var(--font-mono)'}}>0:42</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotScreen({ go }) {
  const [sent, setSent] = React.useState(false);
  const [email, setEmail] = React.useState('');
  return (
    <div className="auth">
      <AuthAside/>
      <div className="auth-main">
        <div className="auth-card screen-enter">
          {!sent ? (
            <>
              <h1>Mot de passe oublié</h1>
              <p className="sub">Indiquez votre e-mail, nous vous enverrons un lien de réinitialisation.</p>
              <form onSubmit={e=>{e.preventDefault(); setSent(true);}} style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
                <Field label="Adresse e-mail" required>
                  <Input type="email" icon="mail" placeholder="vous@entreprise.fr" value={email} onChange={e=>setEmail(e.target.value)} autoFocus required/>
                </Field>
                <Btn variant="primary" size="lg" className="btn-block" type="submit">Envoyer le lien</Btn>
              </form>
            </>
          ) : (
            <>
              <span className="modal-ic brand" style={{marginBottom:18}}><Icon name="mail" size={24}/></span>
              <h1>Vérifiez votre boîte mail</h1>
              <p className="sub">Un lien de réinitialisation a été envoyé à <b style={{color:'var(--text-default)'}}>{email||'votre adresse'}</b>. Il expire dans 30 minutes.</p>
              <Btn variant="secondary" size="lg" className="btn-block" onClick={()=>go('reset')}>Simuler le clic sur le lien →</Btn>
            </>
          )}
          <p style={{textAlign:'center', marginTop:'var(--sp-6)'}}><span className="link" onClick={()=>go('login')}>← Retour à la connexion</span></p>
        </div>
      </div>
    </div>
  );
}

function strength(pw){
  let s=0; if(pw.length>=8) s++; if(/[A-Z]/.test(pw)) s++; if(/[0-9]/.test(pw)) s++; if(/[^A-Za-z0-9]/.test(pw)) s++; return s;
}
function SetPasswordScreen({ go, first }) {
  const [pw, setPw] = React.useState('');
  const [pw2, setPw2] = React.useState('');
  const [err, setErr] = React.useState({});
  const s = strength(pw);
  const colors = ['var(--error-500)','var(--warning-500)','var(--info-500)','var(--success-500)'];
  const labels = ['Faible','Moyen','Bon','Robuste'];
  const submit = (e) => {
    e.preventDefault();
    const er={};
    if(s<2) er.pw='Choisissez un mot de passe plus robuste (8+ caractères, majuscule, chiffre).';
    if(pw!==pw2) er.pw2='Les mots de passe ne correspondent pas.';
    setErr(er); if(Object.keys(er).length) return;
    go('login');
  };
  return (
    <div className="auth">
      <AuthAside/>
      <div className="auth-main">
        <div className="auth-card screen-enter">
          <h1>{first?'Bienvenue chez Portéo':'Nouveau mot de passe'}</h1>
          <p className="sub">{first?'Définissez le mot de passe de votre compte pour commencer.':'Choisissez un nouveau mot de passe sécurisé.'}</p>
          <form onSubmit={submit} style={{display:'flex', flexDirection:'column', gap:'var(--sp-5)'}}>
            <Field label="Mot de passe" required error={err.pw} hint={!err.pw ? '8 caractères minimum, avec majuscule et chiffre' : null}>
              <Input type="password" icon="lock" placeholder="••••••••••" value={pw} onChange={e=>setPw(e.target.value)} autoFocus/>
              {pw && (
                <div style={{marginTop:8}}>
                  <div className="pw-meter">{[0,1,2,3].map(i=><span key={i} style={{background:i<s?colors[s-1]:'var(--border-default)'}}/>)}</div>
                  <div style={{fontSize:'var(--t-caption)', color:colors[Math.max(0,s-1)], fontWeight:600, marginTop:5}}>{pw?labels[Math.max(0,s-1)]:''}</div>
                </div>
              )}
            </Field>
            <Field label="Confirmer le mot de passe" required error={err.pw2}>
              <Input type="password" icon="lock" placeholder="••••••••••" value={pw2} onChange={e=>setPw2(e.target.value)}/>
            </Field>
            <Btn variant="primary" size="lg" className="btn-block" type="submit">{first?'Activer mon compte':'Réinitialiser'}</Btn>
          </form>
          <p style={{textAlign:'center', marginTop:'var(--sp-6)'}}><span className="link" onClick={()=>go('login')}>← Retour à la connexion</span></p>
        </div>
      </div>
    </div>
  );
}

function AuthFlow({ sub, go, onLogin }) {
  if (sub==='2fa') return <TwoFAScreen go={go} onLogin={onLogin}/>;
  if (sub==='forgot') return <ForgotScreen go={go}/>;
  if (sub==='reset') return <SetPasswordScreen go={go} first={false}/>;
  if (sub==='first') return <SetPasswordScreen go={go} first={true}/>;
  return <LoginScreen go={go} onLogin={onLogin}/>;
}

Object.assign(window, { AuthFlow });
