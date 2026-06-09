/* PORTÉO — Données de démonstration (françaises, relationnelles) */

const AVATAR_COLORS = ['#0E5C4A','#169070','#2D7FF9','#8B5CF6','#E29215','#B0443A','#15A66A','#586860'];
function initials(name){ return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function avatarColor(seed){ let s=0; for(const c of seed) s+=c.charCodeAt(0); return AVATAR_COLORS[s % AVATAR_COLORS.length]; }
function euro(n){ return n.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+'\u00A0€'; }
function euro0(n){ return n.toLocaleString('fr-FR')+'\u00A0€'; }
function dateFR(s){ const d=new Date(s); return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); }

const CONSULTANTS = [
  { id:'C-01', name:'Camille Rousseau', role:'Data Scientist', email:'c.rousseau@porteo.fr', phone:'06 12 44 88 21', tjm:720, since:'2023-02-01', city:'Lyon', skills:['Python','ML','SQL'], status:'active' },
  { id:'C-02', name:'Antoine Mercier', role:'Architecte Cloud', email:'a.mercier@porteo.fr', phone:'06 78 11 90 03', tjm:850, since:'2022-09-12', city:'Paris', skills:['AWS','Kubernetes','Terraform'], status:'active' },
  { id:'C-03', name:'Léa Fontaine', role:'Designer Produit', email:'l.fontaine@porteo.fr', phone:'06 33 27 65 40', tjm:640, since:'2023-06-20', city:'Nantes', skills:['Figma','UX','Design System'], status:'active' },
  { id:'C-04', name:'Hugo Lemoine', role:'Dév. Full-Stack', email:'h.lemoine@porteo.fr', phone:'06 90 55 12 78', tjm:680, since:'2021-11-05', city:'Bordeaux', skills:['Angular','Node','PostgreSQL'], status:'active' },
  { id:'C-05', name:'Sofia Bensaïd', role:'Cheffe de projet', email:'s.bensaid@porteo.fr', phone:'06 44 88 23 91', tjm:700, since:'2024-01-15', city:'Paris', skills:['Agile','Scrum','PMO'], status:'active' },
  { id:'C-06', name:'Thomas Girard', role:'Consultant SAP', email:'t.girard@porteo.fr', phone:'06 71 09 34 56', tjm:780, since:'2022-03-28', city:'Lille', skills:['SAP','FI/CO','ABAP'], status:'paused' },
  { id:'C-07', name:'Inès Moreau', role:'Cybersécurité', email:'i.moreau@porteo.fr', phone:'06 25 67 88 14', tjm:820, since:'2023-09-01', city:'Toulouse', skills:['Pentest','SOC','ISO 27001'], status:'active' },
  { id:'C-08', name:'Yanis Dubois', role:'Dév. Mobile', email:'y.dubois@porteo.fr', phone:'06 88 12 45 67', tjm:660, since:'2024-04-10', city:'Lyon', skills:['Flutter','iOS','Kotlin'], status:'active' },
];

const CLIENTS = [
  { id:'CL-01', name:'Atlas Banque', sector:'Banque / Finance', siret:'552 081 317 00012', contact:'Marie Lefèvre', email:'m.lefevre@atlasbanque.fr', city:'Paris', since:'2022-01-10' },
  { id:'CL-02', name:'Helios Énergie', sector:'Énergie', siret:'441 027 893 00034', contact:'Paul Garnier', email:'p.garnier@helios-energie.fr', city:'Lyon', since:'2022-05-22' },
  { id:'CL-03', name:'Novapharm', sector:'Pharmaceutique', siret:'732 829 320 00056', contact:'Claire Dupont', email:'c.dupont@novapharm.com', city:'Strasbourg', since:'2023-03-14' },
  { id:'CL-04', name:'Groupe Vélan', sector:'Industrie', siret:'612 044 778 00021', contact:'Olivier Roche', email:'o.roche@velan.fr', city:'Lille', since:'2021-09-30' },
  { id:'CL-05', name:'Maelis Retail', sector:'Distribution', siret:'389 561 002 00045', contact:'Nadia Cherif', email:'n.cherif@maelis.fr', city:'Bordeaux', since:'2023-11-08' },
  { id:'CL-06', name:'Quanta Assurances', sector:'Assurance', siret:'804 229 561 00018', contact:'Julien Faure', email:'j.faure@quanta-assur.fr', city:'Nantes', since:'2024-02-19' },
];

const STATUS = {
  draft:    { key:'draft',    label:'Brouillon', cls:'b-draft' },
  progress: { key:'progress', label:'En cours',  cls:'b-progress' },
  done:     { key:'done',     label:'Terminée',  cls:'b-done' },
  invoiced: { key:'invoiced', label:'Facturée',  cls:'b-invoiced' },
  canceled: { key:'canceled', label:'Annulée',   cls:'b-canceled' },
};

const MISSIONS = [
  { id:'MIS-2026-0142', title:'Migration Data Lake', client:'CL-01', consultant:'C-01', status:'progress', start:'2026-01-08', end:'2026-07-31', tjm:720, days:128, amount:92160 },
  { id:'MIS-2026-0139', title:'Refonte plateforme cloud', client:'CL-02', consultant:'C-02', status:'progress', start:'2025-11-15', end:'2026-09-30', tjm:850, days:210, amount:178500 },
  { id:'MIS-2026-0151', title:'Design System Mobile', client:'CL-05', consultant:'C-03', status:'progress', start:'2026-02-01', end:'2026-06-30', tjm:640, days:96, amount:61440 },
  { id:'MIS-2025-0118', title:'Portail client B2B', client:'CL-01', consultant:'C-04', status:'invoiced', start:'2025-06-02', end:'2025-12-19', tjm:680, days:142, amount:96560 },
  { id:'MIS-2026-0155', title:'Cadrage programme PMO', client:'CL-03', consultant:'C-05', status:'draft', start:'2026-03-16', end:'2026-08-29', tjm:700, days:110, amount:77000 },
  { id:'MIS-2025-0097', title:'Audit sécurité SI', client:'CL-06', consultant:'C-07', status:'done', start:'2025-09-01', end:'2025-11-28', tjm:820, days:62, amount:50840 },
  { id:'MIS-2026-0148', title:'Déploiement SAP FI/CO', client:'CL-04', consultant:'C-06', status:'canceled', start:'2026-01-20', end:'2026-10-15', tjm:780, days:186, amount:145080 },
  { id:'MIS-2026-0160', title:'App mobile terrain', client:'CL-04', consultant:'C-08', status:'progress', start:'2026-04-01', end:'2026-09-12', tjm:660, days:115, amount:75900 },
  { id:'MIS-2025-0110', title:'Modèle de scoring crédit', client:'CL-01', consultant:'C-01', status:'invoiced', start:'2025-04-14', end:'2025-10-03', tjm:720, days:120, amount:86400 },
  { id:'MIS-2026-0144', title:'Pipeline MLOps', client:'CL-02', consultant:'C-01', status:'progress', start:'2026-02-10', end:'2026-08-21', tjm:720, days:132, amount:95040 },
  { id:'MIS-2025-0089', title:'Stratégie data gouvernance', client:'CL-03', consultant:'C-05', status:'done', start:'2025-03-03', end:'2025-07-18', tjm:700, days:98, amount:68600 },
  { id:'MIS-2026-0157', title:'Pentest applications web', client:'CL-06', consultant:'C-07', status:'draft', start:'2026-05-04', end:'2026-07-25', tjm:820, days:58, amount:47560 },
  { id:'MIS-2025-0123', title:'Refonte UX espace client', client:'CL-05', consultant:'C-03', status:'invoiced', start:'2025-07-21', end:'2025-12-30', tjm:640, days:108, amount:69120 },
  { id:'MIS-2026-0163', title:'Architecture micro-services', client:'CL-02', consultant:'C-04', status:'progress', start:'2026-03-02', end:'2026-11-28', tjm:680, days:175, amount:119000 },
  { id:'MIS-2025-0102', title:'Migration ERP', client:'CL-04', consultant:'C-06', status:'done', start:'2025-02-10', end:'2025-09-05', tjm:780, days:140, amount:109200 },
];

const INVOICES = [
  { id:'FAC-2026-0231', mission:'MIS-2025-0118', client:'CL-01', amount:96560, issued:'2026-01-05', due:'2026-02-04', status:'paid' },
  { id:'FAC-2026-0244', mission:'MIS-2025-0110', client:'CL-01', amount:43200, issued:'2026-01-28', due:'2026-02-27', status:'paid' },
  { id:'FAC-2026-0251', mission:'MIS-2025-0123', client:'CL-05', amount:34560, issued:'2026-02-10', due:'2026-03-12', status:'issued' },
  { id:'FAC-2026-0258', mission:'MIS-2026-0142', client:'CL-01', amount:30720, issued:'2026-03-01', due:'2026-03-31', status:'issued' },
  { id:'FAC-2026-0260', mission:'MIS-2026-0139', client:'CL-02', amount:51000, issued:'2026-03-05', due:'2026-04-04', status:'overdue' },
  { id:'FAC-2026-0263', mission:'MIS-2025-0110', client:'CL-01', amount:43200, issued:'2026-03-12', due:'2026-04-11', status:'issued' },
  { id:'FAC-2026-0268', mission:'MIS-2026-0144', client:'CL-02', amount:28800, issued:'2026-04-02', due:'2026-05-02', status:'draft' },
  { id:'FAC-2026-0270', mission:'MIS-2025-0123', client:'CL-05', amount:34560, issued:'2026-04-08', due:'2026-05-08', status:'overdue' },
];

const INVOICE_STATUS = {
  draft:   { label:'Brouillon', cls:'b-draft' },
  issued:  { label:'Émise',     cls:'b-progress' },
  paid:    { label:'Payée',     cls:'b-done' },
  overdue: { label:'En retard', cls:'b-canceled' },
};

// derived helpers
function clientById(id){ return CLIENTS.find(c=>c.id===id); }
function consultantById(id){ return CONSULTANTS.find(c=>c.id===id); }
function missionsOfClient(id){ return MISSIONS.filter(m=>m.client===id); }
function missionsOfConsultant(id){ return MISSIONS.filter(m=>m.consultant===id); }
function invoicesOfMission(id){ return INVOICES.filter(i=>i.mission===id); }
function invoicesOfClient(id){ return INVOICES.filter(i=>i.client===id); }

// Chart data
const REVENUE_BY_MONTH = [
  { m:'Juil', v:142000 }, { m:'Août', v:118000 }, { m:'Sept', v:168000 },
  { m:'Oct', v:154000 }, { m:'Nov', v:189000 }, { m:'Déc', v:176000 },
  { m:'Jan', v:198000 }, { m:'Fév', v:212000 }, { m:'Mars', v:234000 },
  { m:'Avr', v:221000 }, { m:'Mai', v:248000 }, { m:'Juin', v:263000 },
];

Object.assign(window, {
  CONSULTANTS, CLIENTS, MISSIONS, INVOICES, STATUS, INVOICE_STATUS, REVENUE_BY_MONTH,
  initials, avatarColor, euro, euro0, dateFR,
  clientById, consultantById, missionsOfClient, missionsOfConsultant, invoicesOfMission, invoicesOfClient,
});
