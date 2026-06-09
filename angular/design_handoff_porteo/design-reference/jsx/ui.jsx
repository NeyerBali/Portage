/* PORTÉO — Primitives UI réutilisables */
const { useState, useEffect, useRef, createContext, useContext, useCallback } = React;

/* ---------- Avatar / Person ---------- */
function Avatar({ name, size = 28, className = '' }) {
  return (
    <span className={'av '+className} style={{ width:size, height:size, background:avatarColor(name), fontSize:size*0.38 }}>
      {initials(name)}
    </span>
  );
}
function Person({ name, sub, size = 28 }) {
  return (
    <div className="person">
      <Avatar name={name} size={size} />
      <div style={{minWidth:0}}>
        <div className="nm" style={{lineHeight:1.2}}>{name}</div>
        {sub && <div style={{fontSize:'var(--t-caption)', color:'var(--text-subtle)'}}>{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Buttons ---------- */
function Btn({ variant='secondary', size, icon, iconRight, children, className='', ...rest }) {
  const cls = ['btn','btn-'+variant, size?('btn-'+size):'', !children?'btn-icon':'', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size==='sm'?16:18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size==='sm'?16:18} />}
    </button>
  );
}

/* ---------- Badges ---------- */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.draft;
  return <span className={'badge '+s.cls}><span className="dot" style={{background:'currentColor'}}></span>{s.label}</span>;
}
function InvoiceBadge({ status }) {
  const s = INVOICE_STATUS[status] || INVOICE_STATUS.draft;
  return <span className={'badge '+s.cls}><span className="dot" style={{background:'currentColor'}}></span>{s.label}</span>;
}

/* ---------- Toggle / Checkbox ---------- */
function Toggle({ checked, onChange, size }) {
  return <button type="button" className={'toggle '+(size==='sm'?'sm':'')} aria-checked={!!checked} role="switch" onClick={()=>onChange(!checked)} />;
}
function Checkbox({ checked, onChange }) {
  return (
    <button type="button" className={'cbx '+(checked?'on':'')} role="checkbox" aria-checked={!!checked} onClick={(e)=>{e.stopPropagation(); onChange(!checked);}}>
      <Icon name="check" size={13} stroke={3} style={{color:'#fff'}} />
    </button>
  );
}

/* ---------- Fields ---------- */
function Field({ label, required, hint, error, children }) {
  return (
    <div className={'field '+(error?'error':'')}>
      {label && <label className="label">{label}{required && <span className="req">*</span>}</label>}
      {children}
      {error ? <span className="err-msg"><Icon name="alert" size={13}/>{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}
function Input({ icon, ...rest }) {
  if (icon) return (
    <div className="input-wrap"><span className="lead-ic"><Icon name={icon} size={17}/></span><input className="input" {...rest}/></div>
  );
  return <input className="input" {...rest}/>;
}
function Select({ children, ...rest }) { return <select className="select" {...rest}>{children}</select>; }
function Textarea(props){ return <textarea className="textarea" {...props}/>; }

/* ---------- Card ---------- */
function Card({ title, sub, action, children, className='', bodyClass='card-pad', noBody }) {
  return (
    <div className={'card '+className}>
      {(title||action) && (
        <div className="card-head">
          <div><h3>{title}</h3>{sub && <div className="sub">{sub}</div>}</div>
          {action}
        </div>
      )}
      {noBody ? children : <div className={bodyClass}>{children}</div>}
    </div>
  );
}

/* ---------- Tabs ---------- */
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.key} className={'tab '+(active===t.key?'active':'')} onClick={()=>onChange(t.key)}>
          {t.label}{t.count!=null && <span style={{marginLeft:7, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-subtle)'}}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ open, onClose, children, size='', closeOnScrim=true }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onMouseDown={(e)=>{ if(closeOnScrim && e.target===e.currentTarget) onClose(); }}>
      <div className={'modal '+size} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

/* Generic confirm / alert dialog */
function Dialog({ open, onClose, icon='info', tone='info', title, message, confirmLabel='Confirmer', cancelLabel='Annuler', onConfirm, destructive, hideCancel }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="modal-head">
        <span className={'modal-ic '+tone}><Icon name={icon} size={24}/></span>
        <div className="mh-text">
          <h3>{title}</h3>
          {message && <div className="mh-sub">{message}</div>}
        </div>
      </div>
      <div className="modal-foot">
        {!hideCancel && <Btn variant="ghost" onClick={onClose}>{cancelLabel}</Btn>}
        <Btn variant={destructive?'destructive':'primary'} onClick={()=>{ onConfirm && onConfirm(); }}>
          {confirmLabel}
        </Btn>
      </div>
    </Modal>
  );
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(null);
function useToast(){ return useContext(ToastCtx); }
const TOAST_META = {
  success: { icon:'checkcircle', title:'Succès' },
  error:   { icon:'alert', title:'Erreur' },
  warning: { icon:'alert', title:'Avertissement' },
  info:    { icon:'info', title:'Information' },
};
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, title, msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, title, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4800);
  }, []);
  const api = {
    success:(t,m)=>push('success',t,m), error:(t,m)=>push('error',t,m),
    warning:(t,m)=>push('warning',t,m), info:(t,m)=>push('info',t,m),
  };
  const remove = (id)=> setToasts(t=>t.filter(x=>x.id!==id));
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => {
          const meta = TOAST_META[t.type];
          return (
            <div key={t.id} className={'toast t-'+t.type}>
              <span className="t-ic"><Icon name={meta.icon} size={20}/></span>
              <div className="t-body">
                <div className="t-title">{t.title || meta.title}</div>
                {t.msg && <div className="t-msg">{t.msg}</div>}
              </div>
              <button className="t-close" onClick={()=>remove(t.id)}><Icon name="x" size={15}/></button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ icon='inbox', title, message, action }) {
  return (
    <div className="empty">
      <div className="ill" style={{position:'relative', width:92, height:92}}>
        <svg width="92" height="92" viewBox="0 0 92 92" fill="none" style={{position:'absolute', inset:0}}>
          <circle cx="46" cy="46" r="44" fill="var(--bg-brand-soft)"/>
          <circle cx="46" cy="46" r="30" stroke="var(--border-brand)" strokeWidth="1.5" strokeDasharray="4 5"/>
        </svg>
        <span style={{position:'absolute', inset:0, display:'grid', placeItems:'center', color:'var(--emerald-600)'}}>
          <Icon name={icon} size={34} stroke={1.8}/>
        </span>
      </div>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

/* ---------- Skeleton ---------- */
function Skeleton({ w='100%', h=14, r, style={} }) {
  return <div className="sk" style={{ width:w, height:h, borderRadius:r||'var(--r-xs)', ...style }} />;
}

Object.assign(window, {
  Avatar, Person, Btn, StatusBadge, InvoiceBadge, Toggle, Checkbox,
  Field, Input, Select, Textarea, Card, Tabs, Modal, Dialog,
  ToastProvider, useToast, EmptyState, Skeleton,
});
