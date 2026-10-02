import { useEffect, useId, useMemo, useRef, useState } from "react";
import { calculateAssessment, domains, domainsById, indicators, occupations, occupationsForDomain, occupationDataProvider, questions, transitionComparison, fmtScore, METHOD_VERSION, SOURCE_PACK_VERSION } from "./assessment-model.js";

const demoQuestions = [
  { group: "ACTIVITĂȚILE TALE", title: "Ce activitate îți ocupă cel mai mult timp?", options: ["Texte și documente", "Date și rapoarte", "Lucru direct cu oameni", "Teren, produse sau echipamente"] },
  { group: "ACTIVITĂȚILE TALE", title: "Cât de des repeți aceiași pași în munca ta?", help: "De exemplu: completezi formulare, organizezi date sau redactezi după un model.", options: ["Aproape niciodată", "De câteva ori pe lună", "De câteva ori pe săptămână", "În fiecare zi"] },
  { group: "IMPACTUL AI", title: "Unde ți-ar putea economisi timp un instrument AI?", options: ["La redactare sau rezumare", "La căutare și organizare", "La analiză și comparații", "Nu văd încă un exemplu potrivit"] },
  { group: "IMPACTUL AI", title: "Ce parte din munca ta cere cel mai mult context și judecată?", options: ["Înțelegerea situației", "Alegerea unei soluții", "Comunicarea cu oamenii", "Verificarea și asumarea rezultatului"] },
  { group: "PRACTICI AI", title: "Ai folosit un instrument AI pentru muncă?", options: ["Nu încă", "Am încercat o dată", "Uneori", "Săptămânal sau mai des"] },
  { group: "PRACTICI AI", title: "Dacă AI îți propune un rezultat, cât de des îl verifici?", options: ["Nu l-am folosit încă", "Uneori", "De cele mai multe ori", "Verific fiecare rezultat important"] },
  { group: "ÎNVĂȚARE ȘI ADAPTARE", title: "Cât de ușor îți este să încerci un instrument nou?", options: ["Prefer să aștept îndrumare", "Îl încerc cu ajutor", "Îl explorez singur(ă)", "Îl testez și evaluez ce funcționează"] },
  { group: "ÎNVĂȚARE ȘI ADAPTARE", title: "Când se schimbă un proces la muncă, ce faci de obicei?", options: ["Am nevoie de timp și sprijin", "Învăț după ce primesc instrucțiuni", "Mă adaptez din mers", "Îi ajut și pe ceilalți să se adapteze"] },
  { group: "ABILITĂȚI TRANSFERABILE", title: "Ce abilitate din jobul tău ai putea folosi și în alte activități?", options: ["Organizare", "Comunicare", "Analiză și rezolvare de probleme", "Coordonare și decizie"] },
  { group: "ABILITĂȚI TRANSFERABILE", title: "Ce ai vrea să afli despre impactul AI asupra muncii tale?", options: ["Ce sarcini se pot schimba", "Ce ar trebui să verific", "Ce abilități merită să dezvolt", "Care ar putea fi primul meu pas"] },
];
const transitionQuestions = [
  { id: "T01", text: "Câtă experiență practică ai deja în domeniul sau jobul țintă?", options: ["Deloc", "Doar familiarizare", "Cursuri sau proiecte personale", "Proiecte aplicate", "Experiență directă"] },
  { id: "T02", text: "Ai proiecte, portofoliu sau rezultate care arată competențe relevante pentru jobul țintă?", options: ["Nu", "Doar exerciții", "Un proiect", "Mai multe proiecte", "Rezultate profesionale"] },
  { id: "T03", text: "Cât timp poți investi realist săptămânal în dezvoltarea pentru tranziție?", options: ["<1 h", "1–2 h", "3–5 h", "6–10 h", ">10 h"] },
  { id: "T04", text: "Cât de dispus ești să urmezi formare, certificări sau practică structurată dacă jobul o cere?", options: ["Foarte puțin", "Puțin", "Moderat", "Mult", "Foarte mult"] },
  { id: "T05", text: "În ce orizont vrei să faci tranziția?", options: ["<3 luni", "3–6 luni", "6–12 luni", "12–24 luni", ">24 luni"], context: "Această alegere personalizează planul; nu intră liniar în scorul de pregătire pentru tranziție." },
];
const faqs = [
  ["Testul îmi spune dacă îmi voi pierde jobul?", "Nu. Evaluarea descrie presiunea de transformare asupra activităților și pregătirea ta declarată. Nu prezice concedieri și nu oferă probabilități de pierdere a jobului."],
  ["De unde vin scorurile pentru ocupație?", "În acest prototip folosim profiluri ocupaționale demonstrative, create pentru a arăta fluxul. Sunt marcate «Evidence Coverage: Limited» și nu sunt benchmarkuri validate sau comparații cu alți oameni."],
  ["Trebuie să fi folosit AI înainte?", "Nu. Poți răspunde și dacă nu ai folosit AI. Scorurile de pregătire descriu practicile pe care le declari; nu sunt o certificare."],
  ["Ce primesc în Standard și Profesional?", "Standard oferă scorul general, opt indicatori, interpretări și raport web/PDF. Profesional adaugă abilități, fluxuri de lucru, joburi adiacente, plan pe 30/90/365 de zile și o comparație opțională cu un job țintă."],
];
const fmtPrice = (plan) => plan === "pro" ? "€9,99" : "€5,99";

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => { const pop = () => setPath(window.location.pathname); window.addEventListener("popstate", pop); return () => window.removeEventListener("popstate", pop); }, []);
  function go(next) { window.history.pushState({}, "", next); setPath(next); window.scrollTo(0, 0); }
  return [path, go];
}
function Button({ children, onClick, light = false, disabled = false, type = "button" }) { return <button className={`button ${light ? "button-light" : "button-dark"}`} type={type} disabled={disabled} onClick={onClick}>{children}</button>; }
function Kicker({ children }) { return <p className="section-kicker">{children}</p>; }
function SiteHeader({ go, onDemo }) { return <header className="site-header"><div className="header-meta"><span>AI JOB IMPACT</span><span>ACTIVITĂȚI · PREGĂTIRE · OPȚIUNI</span><span>METODOLOGIE V1.2</span></div><div className="header-main"><a className="wordmark" href="/" onClick={(e) => { e.preventDefault(); go("/"); }}>ai-test<span>.work</span></a><nav className="desktop-nav" aria-label="Navigare principală"><a href="#afli">Ce afli</a><a href="#cum-functioneaza">Cum funcționează</a><a href="#raport">Raport</a><button type="button" onClick={() => go("/methodology")}>Metodologie</button></nav><Button onClick={onDemo}>Încearcă demo-ul</Button></div></header>; }
function SiteFooter({ go }) { return <footer className="site-footer"><a className="wordmark" href="/" onClick={(e) => { e.preventDefault(); go("/"); }}>ai-test<span>.work</span></a><div className="footer-links"><button onClick={() => go("/methodology")}>Metodologie</button><button onClick={() => go("/privacy")}>Confidențialitate</button><button onClick={() => go("/terms")}>Termeni</button><button onClick={() => go("/refund")}>Rambursări</button><button onClick={() => go("/contact")}>Contact</button></div><span>© 2026 AI Job Impact · Prototip local</span></footer>; }

function Home({ go, onDemo }) {
  return <div className="v2-home"><SiteHeader go={go} onDemo={onDemo} /><main>
    <section className="v2-hero" aria-labelledby="hero-title"><div className="v2-shell"><div className="v2-hero-grid"><div className="v2-hero-copy"><p className="v2-overline">ÎNCEPE CU ACTIVITĂȚILE TALE</p><h1 id="hero-title">Află cum <span className="v2-ai-highlight">AI-ul</span><br />poate schimba<br /><span className="v2-job-highlight">jobul tău.</span></h1><p className="v2-lede">Răspunde despre ce faci zi de zi. Înțelege ce activități AI poate asista, ce atuuri rămân ale tale și ce merită să încerci mai departe.</p><div className="v2-actions"><Button onClick={onDemo}>Încearcă demo-ul gratuit</Button><span>10 întrebări · Fără cont · Fără plată</span></div><button className="v2-plan-link" onClick={() => go("/pricing")}>Vezi ce primești în evaluarea completă</button></div><div className="v2-hero-art" aria-label="Previzualizare ilustrativă a scorului și a celor cinci dimensiuni analizate"><div className="v2-art-glow"/><div className="v2-mini-label">VEZI DINTR-O PRIVIRE CE VEI AFLA</div><div className="v2-glass-card v2-score-panel"><div className="v2-card-head"><span>EXEMPLU DE REZULTAT</span><span>VALORI ILUSTRATIVE</span></div><div className="v2-score-total"><div><span className="v2-score-overline">SCOR GENERAL · ORIENTATIV</span><p>O sinteză a răspunsurilor tale, explicată simplu.</p></div><CircularGauge score={58} label="Scor general ilustrativ: 58 puncte din 100" tone="overall" size="regular"/></div><div className="v2-score-dimensions" aria-label="Cinci dimensiuni ale evaluării">{[{label:"Risc de automatizare",item:indicators[0],score:21},{label:"Expunere la AI",item:indicators[1],score:65},{label:"Augmentare prin AI",item:indicators[2],score:63},{label:"Avantaj uman",item:indicators[3],score:43},{label:"Pregătire pentru AI",item:indicators[4],score:78}].map(({label,item,score})=><div className="v2-score-dimension" key={label}><div><span>{label}</span><b style={{ color: scoreColor(score) }}>{score}<small>/100</small></b></div><IndicatorScale item={{...item,name:label}} score={score} compact /></div>)}</div><div className="v2-score-disclaimer">Scorul combină 8 indicatori grupați în aceste 5 dimensiuni. Exemplu ilustrativ; rezultatul se calculează după răspunsuri.</div></div><p className="v2-art-note">40 de întrebări → scoruri, explicații și pași concreți</p></div></div><div className="v2-hero-foot"><span>40 de întrebări în evaluarea completă</span><a href="#cum-functioneaza"><strong>Vezi cum funcționează</strong><span aria-hidden="true">↓</span></a></div></div></section>

    <section className="v2-proof" aria-label="Context despre AI și muncă"><div className="v2-shell v2-proof-grid"><p className="v2-overline">Impactul AI asupra muncii tale, azi și în viitor.</p><article className="v2-proof-stat"><strong>1 din 4</strong><span>lucrători au o ocupație cu un anumit grad de expunere la AI generativ. Unele sarcini se pot schimba, iar transformarea este mai probabilă decât înlocuirea completă a majorității joburilor.</span></article><article className="v2-proof-source"><div className="source-credential"><div className="ilo-icon-wrap" role="img" aria-label="ILO"><svg viewBox="0 0 44 48" aria-hidden="true"><path d="M7 4h19l11 11v25H7z"/><circle cx="33" cy="37" r="9"/></svg><span>ILO</span></div><div><b>CERCETARE PUBLICATĂ</b><span>Organizația Internațională a Muncii · 2025</span></div></div><a href="https://www.ilo.org/publications/generative-ai-and-jobs-2025-update" target="_blank" rel="noreferrer">Citește sursa ↗</a></article><p className="proof-method-note">Datele ILO oferă context despre piață. Scorurile din prototip pornesc din răspunsurile tale; profilurile ocupaționale sunt demonstrative și nu reprezintă încă o evaluare validată prin baze de date conectate.</p></div></section>

    <section className="v2-work-section" id="afli"><div className="v2-shell"><div className="v2-section-heading"><Kicker>ÎNCEPE CU CE FACI, NU CU TITLUL DE PE CARTEA DE VIZITĂ</Kicker><h2>Același job.<br /><span>Activități diferite.</span></h2><p>Două persoane cu același job pot lucra foarte diferit. De aceea, întrebările pornesc de la sarcinile, deciziile și instrumentele pe care le folosești cu adevărat.</p></div><div className="v2-activity-grid"><article><span>CE POATE PRELUA SAU ACCELERA AI</span><h3>Pași repetitivi</h3><p>Drafturi, rezumate, căutare, clasificare, programare și primele variante.</p></article><article><span>CE POATE AUGMENTA</span><h3>Analiză și idei</h3><p>Compararea opțiunilor, simularea unor scenarii și testarea unei idei.</p></article><article><span>CE RĂMÂNE ESENȚIAL UMAN</span><h3>Judecată și relații</h3><p>Contextul, responsabilitatea, decizia finală, empatia și lucrul în situații noi.</p></article></div><div className="v2-activity-note"><span>Nu primești o predicție despre concediere.</span><span>Primești întrebări mai bune despre felul în care se schimbă munca.</span></div></div></section>

    <section className="v2-domains"><div className="v2-shell v2-domains-inner"><div><Kicker>UN IMPACT DIFERIT PENTRU FIECARE JOB</Kicker><h2>Impactul <span className="v2-ai-accent">AI</span> asupra muncii<br />diferă de la un domeniu<br />la altul.</h2></div><div className="v2-domain-side"><p>În orice domeniu, AI poate prelua sau accelera unele sarcini. Cât se schimbă munca depinde de activitățile concrete din jobul tău, nu doar de titlul jobului.</p><div className="domain-map"><div className="domain-map-origin"><strong>AI</strong><span>poate schimba activități în toate domeniile</span></div><div className="domain-map-branches"><article className="domain-branch branch-knowledge"><h3>Informație & decizii</h3><ul><li>Tehnologie</li><li>Finanțe</li><li>Marketing</li><li>Vânzări</li><li className="domain-emphasis">Administrație</li><li className="domain-emphasis">Juridic</li><li>Sector public</li></ul></article><article className="domain-branch branch-people"><h3>Oameni & servicii</h3><ul><li className="domain-emphasis">HR & educație</li><li className="domain-emphasis">Sănătate</li><li className="domain-emphasis">Turism</li></ul></article><article className="domain-branch branch-operations"><h3>Operațiuni & teren</h3><ul><li>Producție</li><li className="domain-emphasis">Construcții</li><li className="domain-emphasis">Logistică</li></ul></article></div></div><small>Domeniile sunt grupate orientativ. Evaluarea analizează sarcinile tale și nu atribuie un scor întregului sector.</small></div></div></section>

    <section className="v2-process" id="cum-functioneaza"><div className="v2-shell"><div className="v2-section-heading v2-process-heading"><Kicker>PAȘII EVALUĂRII</Kicker><h2>De la răspunsuri<br /><span>la un pas concret.</span></h2><p>Fără CV și fără cunoștințe tehnice. O întrebare pe ecran, în ritmul tău.</p></div><div className="v2-steps"><article><div className="v2-step-heading"><span className="v2-step-index">01</span><h3>Spui ce faci</h3></div><p>Alegi domeniul, jobul și nivelul tău de experiență.</p></article><article><div className="v2-step-heading"><span className="v2-step-index">02</span><h3>Răspunzi despre muncă</h3></div><p>40 de întrebări despre sarcini, AI, atuuri și felul în care înveți.</p></article><article><div className="v2-step-heading"><span className="v2-step-index">03</span><h3>Primești o hartă clară</h3></div><p>Vezi ce se poate schimba, ce resurse ai și ce poți testa în continuare.</p></article></div></div></section>

    <section className="v2-result-section" id="raport"><div className="v2-shell v2-result-grid"><div><Kicker>CE VEI ÎNȚELEGE DIN RAPORT</Kicker><h2>Scoruri explicate.<br /><span>Pași concreți.</span></h2><p>Raportul separă ce ține de activitățile jobului de ceea ce ține de pregătirea ta. Fiecare indicator vine cu o explicație și un pas următor.</p><ul className="v2-result-list"><li>Unde munca ta e mai repetitivă sau mai expusă</li><li>Ce poate accelera AI și ce merită verificat</li><li>Ce abilități și atuuri poți folosi mai departe</li></ul><Button onClick={() => go("/pricing")}>Compară evaluarea completă</Button></div><div className="v2-report-preview"><div className="v2-preview-glow"/><div className="v2-preview-card"><div className="v2-preview-meta"><span>PREVIZUALIZARE RAPORT</span><span>EXEMPLU · NU ESTE SCORUL TĂU</span></div><p className="v2-preview-label">CE PRIMEȘTI LA FINAL</p><h3>Ce se poate<br />schimba. Ce poți face</h3><div className="v2-preview-metric"><div><span>Sarcini expuse la AI</span><b style={{color:scoreColor(67)}}>67<small className="score-denominator">/100</small></b></div><IndicatorScale item={{...indicators[1], name:"Sarcini expuse la AI"}} score={67}/></div><div className="v2-preview-metric"><div><span>Pregătire personală</span><b style={{color:scoreColor(46)}}>46<small className="score-denominator">/100</small></b></div><IndicatorScale item={{...indicators[4], name:"Pregătire personală"}} score={46}/></div><div className="v2-next-step"><span>UN PRIM PAS</span><p>Alege o sarcină repetitivă și testează un instrument AI pe un exemplu fără date sensibile. Verifică rezultatul.</p></div></div><p className="v2-preview-caption">Grafica este ilustrativă. Rezultatul real depinde de răspunsurile tale.</p></div></div></section>

    <section className="v2-market-note"><div className="v2-shell v2-market-inner"><div><Kicker>UN CONTEXT LOCAL, FĂRĂ ALARMISM</Kicker><h2>Adoptarea <span className="v2-ai-accent">AI</span> în România e încă la început.</h2></div><div><strong>5,2% <small>în România</small></strong><span>față de 20% în UE dintre companiile cu cel puțin 10 angajați care foloseau AI în 2025.</span><a href="https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20251211-2" target="_blank" rel="noreferrer">Sursa: Eurostat ↗</a><p>Asta nu spune cât de repede se va schimba jobul tău. Face cu atât mai utilă o evaluare pornită din activitățile concrete, nu din presupuneri.</p></div></div></section>

    <section className="v2-pricing section-shell" id="planuri"><div className="v2-section-heading"><Kicker>ÎNCEPE GRATUIT · ALEGI APOI</Kicker><h2>Testează formatul.<br /><span>Apoi decizi.</span></h2><p>Vezi mai întâi cum sunt puse întrebările. Evaluarea completă este disponibilă în două variante.</p></div><div className="v2-plan-grid"><article className="v2-plan-card v2-plan-free"><div className="plan-feature-panel"><span className="v2-plan-label"><strong>Demo</strong><small>fără cost</small></span><div className="plan-price"><strong>€0</strong><span>gratuit</span></div></div><div className="plan-benefits"><h3 className="plan-benefits-title">Încearcă formatul</h3><h4>Primești</h4><ul><li>10 întrebări din cele cinci teme</li><li>Previzualizare ilustrativă a raportului</li><li>Fără cont și fără plată</li></ul><p>Demo-ul nu calculează scor personal.</p></div><div className="plan-action-panel action-demo"><button className="button" onClick={onDemo}><span className="button-action">Încearcă</span> <strong>Demo</strong></button></div></article><article className="v2-plan-card v2-plan-featured"><div className="plan-feature-panel"><span className="v2-plan-label"><strong>Standard</strong><small>raport complet</small></span><div className="plan-price"><strong>€5,99</strong><span>plată unică</span></div></div><div className="plan-benefits"><h3 className="plan-benefits-title">Înțelege-ți scorurile</h3><h4>Include</h4><ul><li>40 de întrebări și 8 indicatori</li><li>Interpretare personalizată a răspunsurilor</li><li>Raport web și PDF</li><li>Pași practici de explorat</li></ul></div><div className="plan-action-panel action-standard"><button className="button" onClick={() => go("/pricing")}><span className="button-action">Alege</span> <strong>Standard</strong></button></div></article><article className="v2-plan-card v2-plan-pro"><div className="plan-feature-panel"><span className="v2-plan-label"><strong>Profesional</strong><small>plan și tranziție</small></span><div className="plan-price"><strong>€9,99</strong><span>plată unică</span></div></div><div className="plan-benefits"><h3 className="plan-benefits-title">Un plan, pas cu pas</h3><h4>În plus față de Standard</h4><ul><li>Abilități și fluxuri AI de explorat</li><li>Joburi adiacente de investigat</li><li>Plan practic pe 30 / 90 / 365 de zile</li><li>Comparație cu un job-țintă</li></ul></div><div className="plan-action-panel action-pro"><button className="button" onClick={() => go("/pricing")}><span className="button-action">Alege</span> <strong>Profesional</strong></button></div></article></div><p className="v2-price-note">Prețurile sunt ipoteze din specificația produsului; prototipul nu procesează plăți reale.</p></section>

    <FaqSection /><section className="v2-final"><div className="v2-shell"><Kicker>ÎNCEPE CU MUNCA TA</Kicker><h2>Mai multă claritate.<br /><span>Un pas la un moment dat.</span></h2><p>Încearcă cele zece întrebări gratuite, apoi hotărăști dacă vrei evaluarea completă.</p><Button onClick={onDemo}>Încearcă demo-ul gratuit</Button><small>Fără cont · Fără plată · Fără predicții despre concediere</small></div></section>
  </main><SiteFooter go={go} /></div>;
}

function FaqSection() { const [open, setOpen] = useState(0); return <section className="faq-section section-shell" id="intrebari"><div><Kicker>RĂSPUNSURI DESPRE EVALUARE</Kicker><h2>Înainte să începi.</h2><p className="faq-lede">Răspunsuri directe, în limbaj simplu.</p></div><div className="faq-list">{faqs.map(([q,a],i)=><div className="faq-item" key={q}><button type="button" aria-expanded={open===i} onClick={()=>setOpen(open===i?-1:i)}><span>{q}</span><span className="faq-toggle">{open===i?"Închide":"Deschide"}</span></button>{open===i&&<p>{a}</p>}</div>)}</div></section>; }

function Demo({ go }) {
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const q=demoQuestions[step];
  const done=step===demoQuestions.length;
  return <FlowShell go={go} eyebrow="DEMO GRATUIT · 10 ÎNTREBĂRI" progress={!done?`${step+1} / ${demoQuestions.length}`:undefined}>
    {!done ? <><Kicker>{q.group} · ÎNTREBAREA {String(step+1).padStart(2,"0")}</Kicker><h1>{q.title}</h1><p className="assessment-help">{q.help||"Alege răspunsul care ți se potrivește cel mai bine."}</p><OptionList options={q.options} selected={answers[step]} onSelect={(value)=>setAnswers({...answers,[step]:value})} /><div className="assessment-actions"><button className="text-button" onClick={()=>step?setStep(step-1):go("/")}>← Înapoi</button><Button disabled={answers[step]===undefined} onClick={()=>setStep(step+1)}>{step===demoQuestions.length-1?"Vezi previzualizarea":"Continuă"} →</Button></div></> : <><Kicker>AI JOB IMPACT / PREVIZUALIZARE</Kicker><h1>Acum știi ce vei putea afla</h1><p className="assessment-lede">Evaluarea completă îți arată scorul general, impactul posibil asupra activităților și practicile tale de pregătire. Mai jos este doar un exemplu vizual: demo-ul nu calculează scoruri personale.</p><div className="demo-teaser"><div className="demo-teaser-visual" aria-hidden="true"><div className="demo-teaser-summary"><div><span>SCOR GENERAL</span><small>Rezumat orientativ</small></div><CircularGauge score={58} label="Exemplu de scor general" tone="overall" size="compact"/></div><div className="demo-teaser-item"><div><span>Sarcini expuse la AI</span><b style={{color:scoreColor(67)}}>67<small className="score-denominator">/100</small></b></div><IndicatorScale item={{...indicators[1],name:"Sarcini expuse la AI"}} score={67}/></div><div className="demo-teaser-item"><div><span>Pregătire personală</span><b style={{color:scoreColor(46)}}>46<small className="score-denominator">/100</small></b></div><IndicatorScale item={{...indicators[4],name:"Pregătire personală"}} score={46}/></div></div><p>Valorile sunt estompate cu intenție și nu reprezintă rezultatul tău.</p></div><div className="assessment-actions"><Button onClick={()=>go("/pricing")}>Vezi evaluarea completă</Button><button className="text-button" onClick={()=>go("/")}>Înapoi la pagină</button></div></>}
  </FlowShell>;
}
function FlowShell({ children, go, eyebrow, progress, className = "" }) { const [current,total]=progress?progress.split("/").map((part)=>part.trim()):[]; return <><div className="flow-header"><a className="wordmark" href="/" onClick={(e)=>{e.preventDefault();go("/");}}>ai-test<span>.work</span></a><span>{eyebrow}</span><button className="close-button" onClick={()=>go("/")}>Închide</button></div><main className={`assessment-shell ${className}`}><div className="assessment-progress-label"><span>{eyebrow}</span>{progress&&<span className="assessment-progress-count"><strong>{current}</strong><span className="assessment-progress-total">/ {total}</span></span>}</div>{progress&&<div className="assessment-progress-track"><span style={{width:`${parseInt(progress,10)/parseInt(progress.split("/")[1],10)*100}%`}} /></div>}{children}</main></>; }
function OptionList({ options, selected, onSelect }) { return <div className="assessment-options" role="radiogroup">{options.map((option,index)=><button key={option} type="button" role="radio" aria-checked={selected===index} className={`assessment-option ${selected===index?"selected":""}`} onClick={()=>onSelect(index)}><span>{option}</span><span className="answer-marker" aria-hidden="true" /></button>)}</div>; }

function Pricing({ go, onChoose }) { return <><SiteHeader go={go} onDemo={()=>go("/demo")} /><main className="pricing-page section-shell"><Kicker>PLANURI / MOD TEST</Kicker><h1>Alege cât de departe<br /><span>vrei să mergi</span></h1><p className="assessment-lede">Poți explora demo-ul fără plată. Evaluarea Standard și Profesional folosesc date demonstrative marcate cu Evidence Coverage: Limited. Nicio plată reală nu este procesată în acest prototip.</p><div className="offer-grid"><article className="offer-card pricing-demo"><div className="pricing-panel"><p className="offer-label"><strong>Demo</strong><small>fără cost</small></p><h2>Încearcă formatul</h2><div className="price-line"><strong>€0</strong><span>gratuit</span></div></div><div className="pricing-benefits"><h3>Primești</h3><ul><li>10 întrebări din cinci teme</li><li>Previzualizarea raportului</li><li>Fără cont și fără plată</li></ul><p>Demo-ul nu calculează scor personal.</p></div><div className="pricing-action-panel action-demo"><Button light onClick={()=>go("/demo")}>Încearcă Demo</Button></div></article><article className="offer-card offer-standard"><div className="pricing-panel"><p className="offer-label"><strong>Standard</strong><small>raport complet</small></p><h2>Înțelege-ți scorurile</h2><div className="price-line"><strong>€5,99</strong><span>plată unică</span></div></div><div className="pricing-benefits"><h3>Include</h3><ul><li>40 de întrebări punctate</li><li>Scor general și 8 indicatori</li><li>Interpretare și raport web/PDF</li><li>Evidence Coverage și versiuni</li></ul></div><div className="pricing-action-panel action-standard"><Button onClick={()=>onChoose("standard")}>Continuă cu Standard ↗</Button></div></article><article className="offer-card offer-pro"><div className="pricing-panel"><p className="offer-label"><strong>Profesional</strong><small>plan și tranziție</small></p><h2>Un plan, pas cu pas</h2><div className="price-line"><strong>€9,99</strong><span>plată unică</span></div></div><div className="pricing-benefits"><h3>În plus față de Standard</h3><ul><li>Top 5 abilități și fluxuri AI</li><li>Joburi adiacente de explorat</li><li>Plan practic pe 30 / 90 / 365 de zile</li><li>Comparație cu un job-țintă</li></ul></div><div className="pricing-action-panel action-pro"><Button onClick={()=>onChoose("pro")}>Continuă cu Profesional ↗</Button></div></article></div><p className="assessment-small">Prețurile sunt cele din Build Spec V1.2. Pentru Standard → Profesional, prețul de upgrade este diferența, dacă furnizorul de plăți o permite. Checkout-ul este o simulare, fără card, email sau debitare.</p></main><SiteFooter go={go}/></>; }

function Checkout({ plan, go, onContinue }) { return <FlowShell go={go} eyebrow="CHECKOUT DE TEST"><Kicker>MOD SIMULARE · FĂRĂ DEBITARE</Kicker><h1>Planul {plan=== "pro"?"Profesional":"Standard"}</h1><div className="checkout-card"><div><span>Preț de referință</span><strong>{fmtPrice(plan)}</strong></div><p>Acesta este un ecran demonstrativ. Nu se cer date de card sau email și nu se procesează o plată. Planul este păstrat în această sesiune doar pentru a putea explora raportul.</p><p>Politica de acces, rambursare și condițiile pentru conținut digital sunt încă în revizuire înainte de lansarea comercială.</p><div className="assessment-actions"><button className="text-button" onClick={()=>go("/pricing")}>← Schimbă planul</button><Button onClick={onContinue}>Continuă în modul de test ↗</Button></div></div></FlowShell>; }

function ProfileDropdown({ value, options, onChange, disabled = false, label }) {
  const id = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === value)));
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const activeOption = options[Math.min(activeIndex, options.length - 1)];
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    const dismiss = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  useEffect(() => {
    if (!open) setActiveIndex(selectedIndex);
  }, [open, selectedIndex]);

  function choose(option) {
    onChange(option.value);
    setActiveIndex(options.findIndex((item) => item.value === option.value));
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
      } else {
        setActiveIndex((index) => (index + direction + options.length) % options.length);
      }
    } else if (open && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (open && event.key === "Enter") {
      event.preventDefault();
      if (activeOption) choose(activeOption);
    } else if (open && event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (open && event.key === "Tab") {
      setOpen(false);
    } else if (!open && event.key === "Enter") {
      event.preventDefault();
      setActiveIndex(selectedIndex);
      setOpen(true);
    } else if (open && event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const query = event.key.toLocaleLowerCase();
      const start = activeIndex + 1;
      const next = [...options.slice(start), ...options.slice(0, start)].findIndex((option) => option.label.toLocaleLowerCase().startsWith(query));
      if (next >= 0) setActiveIndex((start + next) % options.length);
    }
  }

  return <div className={`profile-select-field custom-select-field${open ? " is-open" : ""}`} ref={rootRef}>
    <button ref={buttonRef} type="button" className="profile-select-trigger" role="combobox" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-listbox` : undefined} aria-activedescendant={open && activeOption ? `${id}-option-${activeIndex}` : undefined} disabled={disabled} onClick={() => { setActiveIndex(selectedIndex); setOpen((current) => !current); }} onKeyDown={onKeyDown}>
      <span>{selectedOption?.label ?? "Alege o opțiune"}</span>
      <span className="profile-select-chevron" aria-hidden="true" />
    </button>
    {open && <div className="profile-select-menu" id={`${id}-listbox`} role="listbox" aria-label={label}>
      {options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={option.value === value} className={`profile-select-option${index === activeIndex ? " is-active" : ""}`} onMouseEnter={() => setActiveIndex(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option.label}</div>)}
    </div>}
  </div>;
}

function ProfileStart({ go, profile, setProfile, onStart }) {
  const domain = domainsById[profile.domain];
  const available = occupationsForDomain(profile.domain);
  const domainsOptions = domains.map((item) => ({ value: item.id, label: item.name }));
  const occupationsOptions = available.map((item) => ({ value: item.id, label: item.label }));
  const seniorityOptions = ["Sub 2 ani", "2–5 ani", "6–10 ani", "Peste 10 ani"].map((label) => ({ value: label, label }));
  return <FlowShell go={go} eyebrow="PROFILUL PROFESIONAL"><Kicker>ÎNAINTE DE CELE 40 DE ÎNTREBĂRI</Kicker><h1>Spune-ne ce job<br /><span>vrei să înțelegi</span></h1><p className="assessment-lede">Alegerea domeniului schimbă exemplele și profilul ocupațional demonstrativ folosit de această versiune.</p><div className="profile-form"><div className="profile-form-field"><span>Domeniul principal</span><ProfileDropdown label="Domeniul principal" value={profile.domain} options={domainsOptions} onChange={(value) => setProfile({ ...profile, domain:value, occupation:occupationsForDomain(value)[0].id })} /></div><div className="profile-form-field"><span>Ocupația</span><ProfileDropdown label="Ocupația" value={profile.occupation} options={occupationsOptions} onChange={(value) => setProfile({ ...profile, occupation:value })} /></div><div className="profile-form-field"><span>Experiență în job</span><ProfileDropdown label="Experiență în job" value={profile.seniority} options={seniorityOptions} onChange={(value) => setProfile({ ...profile, seniority:value })} /></div></div><div className="domain-context"><b>Exemple de activități din domeniu</b><p>{domain?.examples}</p><span>Evidence Coverage pentru profilurile demonstrative: Limited.</span></div><label className="adult-check"><input type="checkbox" checked={profile.adult} onChange={(e)=>setProfile({...profile,adult:e.target.checked})}/><span>Am cel puțin 18 ani și înțeleg că acesta este un rezultat orientativ, demonstrativ.</span></label><div className="assessment-actions"><button className="text-button" onClick={()=>go("/pricing")}>← Înapoi la planuri</button><Button disabled={!profile.adult} onClick={onStart}>Începe evaluarea →</Button></div></FlowShell>;
}

function AssessmentQuestion({ index, answers, setAnswer, go, onNext, onBack, profile }) { const q=questions[index]; const domain=domainsById[profile.domain]; return <FlowShell go={go} eyebrow={q.group} progress={`${index+1} / 40`}><Kicker>{q.id} / {q.group.toUpperCase()}</Kicker><h1>{q.text}</h1><p className="assessment-help">Răspunde despre ce faci efectiv în jobul tău. Nu există un răspuns ideal.</p>{domain&&<p className="question-context"><b>Exemplu din domeniul tău:</b> {domain.examples}.</p>}<OptionList options={q.options} selected={answers[q.id]} onSelect={(value)=>setAnswer(q.id,value)} /><div className="assessment-actions"><button className="text-button" onClick={onBack}>← Înapoi</button><Button disabled={answers[q.id]===undefined} onClick={onNext}>{index===39?"Finalizează și vezi raportul":"Continuă"} →</Button></div><p className="assessment-small">Răspunsurile se salvează în sesiunea acestui browser. Poți reveni la orice întrebare.</p></FlowShell>; }

function CircularGauge({ score, label, tone = "overall", size = "regular", ringValues }) {
  const value = Math.max(0, Math.min(100, fmtScore(score)));
  const valueColor = tone === "impact" ? scoreColor(value, "impact", undefined, true) : undefined;
  const zones = ["#b93389", "#d92f9b", "#8b68bb", "#3b9dd0", "#19aeb0"];
  const point = (angle, radius) => [160 + radius * Math.cos(angle), 165 - radius * Math.sin(angle)];
  const needle = point(Math.PI - (value / 100) * Math.PI, 101);
  return <div className={`circular-gauge ${tone} ${size} ${ringValues ? "has-overall-meter" : ""}`} role="meter" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value} aria-valuetext={`${value} puncte din 100`} style={{ "--gauge-angle": `${value * 3.6}deg`, ...(valueColor ? { "--gauge-a": valueColor, "--gauge-b": valueColor } : {}) }}>{ringValues&&<svg className="circular-gauge-rings" viewBox="0 0 320 230" aria-hidden="true" focusable="false">{zones.map((color,index)=>{const start=Math.PI-(index*Math.PI/5)-.012;const end=Math.PI-((index+1)*Math.PI/5)+.012;const [x1,y1]=point(start,120);const [x2,y2]=point(end,120);return <path key={color} d={`M ${x1} ${y1} A 120 120 0 0 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="30"/>;})}{[0,20,40,60,80,100].map((tick)=>{const [x,y]=point(Math.PI-(tick/100)*Math.PI,144);return <text key={tick} x={x} y={y+5} textAnchor="middle" fontSize="13" fill="#68636c">{tick}</text>;})}<line x1="160" y1="165" x2={needle[0]} y2={needle[1]} stroke="#25232a" strokeWidth="3.5" strokeLinecap="round"/><circle cx="160" cy="165" r="10" fill="#fff" stroke="#25232a" strokeWidth="2.5"/><circle cx="160" cy="165" r="4" fill="#f59e0b"/></svg>}<span className="circular-gauge-value">{value}<small className="score-denominator">/100</small></span></div>;
}
function ScoreGauge({ score, label, description, tone = "overall", size = "regular", ringValues }) {
  return <div className={`score-gauge-card ${size} ${tone}`}><div className="score-gauge-copy"><span>{label}</span><p>{description}</p></div><CircularGauge score={score} label={`${label}: ${fmtScore(score)} din 100`} tone={tone} size={size} ringValues={ringValues} /></div>;
}
function PressureMetric({ id, score, label, description }) {
  const value = Math.max(0, Math.min(100, fmtScore(score)));
  const zones = ["#b93389", "#d92f9b", "#8b68bb", "#3b9dd0", "#19aeb0"];
  const point = (angle, radius) => [80 + radius * Math.cos(angle), 78 - radius * Math.sin(angle)];
  const needle = point(Math.PI - (value / 100) * Math.PI, 44);
  return <div className="pressure-metric" style={{"--metric-accent":"#625b6b"}}><div className="pressure-metric-copy"><strong>{label}</strong><span>{description}</span></div><div className="pressure-metric-gauge" role="meter" aria-label={`${label}: ${value} din 100`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><svg viewBox="0 0 160 108" aria-hidden="true" focusable="false">{zones.map((color,index)=>{const start=Math.PI-(index*Math.PI/5)-.018;const end=Math.PI-((index+1)*Math.PI/5)+.018;const [x1,y1]=point(start,58);const [x2,y2]=point(end,58);return <path key={color} d={`M ${x1} ${y1} A 58 58 0 0 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="12"/>;})}{[0,20,40,60,80,100].map((tick)=>{const [x,y]=point(Math.PI-(tick/100)*Math.PI,73);return <text key={tick} x={x} y={y+2.5} textAnchor="middle" fontSize="7" fill="#68636c">{tick}</text>;})}<line x1="80" y1="78" x2={needle[0]} y2={needle[1]} stroke="#25232a" strokeWidth="2.2" strokeLinecap="round"/><circle cx="80" cy="78" r="4.5" fill="#fff" stroke="#25232a" strokeWidth="1.5"/><circle cx="80" cy="78" r="1.8" fill="#f59e0b"/></svg><span>{value}<small>/100</small></span></div></div>;
}
function scoreColor(value, type = "impact", id, reportStyle = false) {
  const t = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
  const stops = reportStyle
    ? [[157, 23, 77], [217, 47, 155], [32, 142, 207], [18, 200, 143]]
    : [[157, 23, 77], [217, 47, 155], [120, 99, 198], [92, 126, 183]];
  const positions = reportStyle ? [0, 0.3, 0.8, 1] : stops.map((_, index) => index / (stops.length - 1));
  const matchingStop = positions.findIndex((position, stopIndex) => stopIndex < positions.length - 1 && t <= positions[stopIndex + 1]);
  const index = matchingStop < 0 ? stops.length - 2 : Math.max(0, matchingStop);
  const local = (t - positions[index]) / (positions[index + 1] - positions[index]);
  return `rgb(${stops[index].map((channel, channelIndex) => Math.round(channel + (stops[index + 1][channelIndex] - channel) * local)).join(" ")})`;
}
function IndicatorScale({ item, score, compact = false, reportStyle = false }) {
  const value = Math.max(0, Math.min(100, fmtScore(score)));
  const gradient = reportStyle
    ? "linear-gradient(90deg,#9d174d 0%,#d92f9b 30%,#208ecf 80%,#12c88f 100%)"
    : "linear-gradient(90deg,#9d174d 0%,#d92f9b 35%,#7863c6 68%,#5c7eb7 100%)";
  return <div className={`indicator-scale ${item.type} ${compact ? "compact" : ""}`} role="meter" aria-label={`${item.name}: ${value} din 100`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value} aria-valuetext={`${value} puncte din 100`}>
    <div className="indicator-scale-track" style={{ "--score-progress": `${value}%`, "--score-color": scoreColor(value, item.type, item.id, reportStyle), "--score-gradient": gradient }}><span className="indicator-scale-fill" style={{ width: "100%" }} /><i className="indicator-scale-marker" style={{ left: `${value}%`, transform: value === 0 ? "translateX(0)" : value === 100 ? "translateX(-100%)" : undefined }} /></div>
    {!compact && <div className="indicator-scale-ticks" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>}
  </div>;
}
function DeltaScale({ label, value }) {
  const bounded = Math.max(-100, Math.min(100, Math.round(value)));
  const magnitude = Math.abs(bounded) / 2;
  return <div className="delta-scale-row"><div className="delta-scale-heading"><span>{label}</span><strong className={bounded >= 0 ? "positive" : "negative"}>{bounded > 0 ? "+" : ""}{bounded} <small>puncte</small></strong></div><div className="delta-scale" role="meter" aria-label={`${label}: ${bounded} puncte față de profilul orientativ`} aria-valuemin="-100" aria-valuemax="100" aria-valuenow={bounded}><span className="delta-scale-center"/><i className={bounded >= 0 ? "delta-positive" : "delta-negative"} style={{ left: bounded >= 0 ? "50%" : `${50 - magnitude}%`, width: `${magnitude}%` }}/><b className={bounded >= 0 ? "delta-marker-positive" : "delta-marker-negative"} style={{ left: `${(bounded + 100) / 2}%` }}/></div><div className="delta-scale-ticks" aria-hidden="true"><span>−100</span><span>−50</span><span>0</span><span>+50</span><span>+100</span></div></div>;
}
function ScoreBar({ item, score }) {
  const accent = scoreColor(score, item.type, item.id, true);
  return <article className={`indicator-card ${item.type}`} style={{"--indicator-accent":accent}}><div className="indicator-card-head"><span>{item.name}</span><strong style={{color:accent}}>{fmtScore(score)}<small className="score-denominator">/100</small></strong></div><IndicatorScale item={item} score={score} reportStyle/><p className="visually-hidden">{item.why}</p></article>;
}
function interpretation(score, positive = true) { if (score < 35) return positive ? "Merită exersat" : "Mai puțin prezent în profil"; if(score<65) return "Nivel intermediar"; return positive ? "Punct forte declarat" : "Mai prezent în profil"; }
function insightText(id, group) {
  const attention = {
    AR: "O parte din munca descrisă urmează pași repetați. Alege un pas și verifică dacă AI-ul poate pregăti o primă variantă pe care o revizuiești.",
    AE: "Unele activități se potrivesc cu ce pot face instrumentele AI. Testează pe un exemplu fără date sensibile și verifică rezultatul.",
    AUG: "Ai identificat puține locuri unde AI îți poate extinde munca. Caută o sarcină de analiză sau pregătire pentru un test mic.",
    HA: "Judecata și relația umană apar mai puțin în răspunsuri. Uită-te unde experiența, contextul și decizia ta schimbă rezultatul."
  };
  const resources = {
    AR: "Ai raportat mai puține sarcini repetitive; asta poate conta când munca cere adaptare la contexte diferite.",
    AE: "Răspunsurile indică o expunere directă mai mică la instrumentele AI în sarcinile tale.",
    AUG: "Ai identificat locuri unde AI te poate ajuta să pregătești, să analizezi sau să testezi, păstrând decizia la tine.",
    HA: "Judecata, relațiile și coordonarea apar ca atuuri în felul în care descrii munca.",
    AIL: "Ai menționat practici de verificare și folosire responsabilă. Păstrează-le în fiecare test.",
    AIM: "Ai deja experiență în folosirea AI la lucru. Urmărește calitatea rezultatului și timpul economisit.",
    AD: "Ai exemple de învățare și adaptare. Folosește această capacitate când testezi metode noi.",
    CR: "Ai abilități pe care le poți folosi și în alte activități sau roluri. Identifică unde se transferă cel mai bine."
  };
  return (group === "attention" ? attention : resources)[id] || "Răspunsurile tale indică un punct de pornire pentru următorul pas. Verifică-l într-o activitate concretă.";
}
function Result({ go, data, plan, onTransition }) {
  const role = data.occupation;
  const { indicators: scores, position, pressure } = data;
  const riskCandidates = [{ id: "AR", value: scores.AR }, { id: "AE", value: scores.AE }, { id: "AUG", value: 100 - scores.AUG }, { id: "HA", value: 100 - scores.HA }].sort((a, b) => b.value - a.value);
  const risks = riskCandidates.slice(0, 3).map((entry) => indicators.find((item) => item.id === entry.id));
  const strengthCandidates = indicators.map((item) => ({ item, value: ["AR", "AE"].includes(item.id) ? 100 - scores[item.id] : scores[item.id] })).sort((a, b) => b.value - a.value);
  const strengths = strengthCandidates.slice(0, 3).map((entry) => entry.item);
  const baselineDeltas = indicators.slice(0, 4).map((item, index) => ({ item, value: fmtScore(data.responseScoreByIndicator[item.id]) - role.baselines[index] }));
  return <><FlowShell go={go} eyebrow={`RAPORT ${data.reportId}`} className="report-flow">
    <div className="result-titleline"><ScoreGauge score={position} label="Scor general orientativ" description="Scorul din centru rezumă cei opt indicatori. Fiecare segment colorat corespunde unui indicator și reflectă valoarea lui." tone="overall" size="large" ringValues={scores}/><div className="pressure-badge"><span>PRESIUNEA DE TRANSFORMARE</span><strong>{pressure}</strong><p>Se referă la schimbarea activităților, nu la șansa de concediere.</p><div className="pressure-pair"><PressureMetric id="AR" score={scores.AR} label="Activități cu pași repetitivi" description="Cât de des munca urmează reguli și pași standard."/><PressureMetric id="AE" score={scores.AE} label="Activități pe care AI le poate sprijini" description="Cât de direct pot ajuta instrumentele AI generative."/></div></div></div>
    <div className="evidence-alert"><b>Evidence Coverage: Limited</b><span>Profil demonstrativ pentru {role.label}. Nu există încă mapare externă validată pentru această ocupație. Nu compara scorul cu alte profesii sau persoane.</span></div><p className="assessment-lede result-caveat">Acest raport descrie răspunsurile tale și un profil ocupațional demonstrativ. Nu prezice pierderea jobului, salariul sau succesul unei tranziții.</p>
    <div className="indicator-group"><h2>Impact asupra jobului</h2><div className="indicator-grid">{indicators.slice(0, 4).map(item => <ScoreBar key={item.id} item={item} score={scores[item.id]}/>)}</div></div>
    <div className="indicator-group readiness-group"><h2>Pregătirea personală</h2><div className="indicator-grid">{indicators.slice(4).map(item => <ScoreBar key={item.id} item={item} score={scores[item.id]}/>)}</div></div>
    <section className="result-insights"><div><Kicker>3 ZONE DE URMĂRIT</Kicker><p className="insight-intro">Răspunsurile tale scot în evidență zone unde merită să verifici ce se poate schimba în activitatea ta.</p><ul>{risks.map((item,index) => <li key={item.id}><span className="insight-index">0{index+1}</span><div><b>{item.name}</b><span className="insight-copy">{insightText(item.id,"attention")}</span></div></li>)}</ul></div><div><Kicker>3 ATUURI PENTRU PASUL URMĂTOR</Kicker><p className="insight-intro">Aceste răspunsuri indică puncte de sprijin pe care le poți folosi când testezi sau înveți.</p><ul>{strengths.map((item,index) => <li key={item.id}><span className="insight-index">0{index+1}</span><div><b>{item.name}</b><span className="insight-copy">{insightText(item.id,"resources")}</span></div></li>)}</ul></div></section>
    <section className="baseline-card"><Kicker>JOBUL TĂU · {role.label.toUpperCase()}</Kicker><h2>Răspunsurile tale față de profilul orientativ</h2><p>Aceste diferențe compară răspunsurile tale cu profilul demonstrativ ales. Linia centrală este egalitatea; comparația nu este un clasament sau benchmark de populație.</p><div className="delta-grid">{baselineDeltas.map(({ item, value }) => <DeltaScale key={item.id} label={item.name} value={value}/>)}</div></section>
    <section className="report-metadata"><span>Metodologie {data.methodologyVersion}</span><span>Source pack {data.sourcePackVersion}</span><span>Report ID {data.reportId}</span><span>Profil: {role.label}</span></section><div className="assessment-actions"><Button light onClick={() => go(`/report/${data.reportId}`)}>Deschide raportul web / PDF ↗</Button>{plan === "pro" && <Button onClick={onTransition}>Compară cu un job-țintă ↗</Button>}<button className="text-button" onClick={() => go("/retest")}>Reia evaluarea după 3–6 luni</button></div><div className="result-next-step"><Kicker>UN EXPERIMENT SIGUR</Kicker><h2>Începe cu o sarcină mică</h2><p>Alege o activitate repetitivă din jobul tău, folosește date fictive sau publice și verifică faptele, calitatea și regulile de confidențialitate înainte să folosești rezultatul.</p></div>
  </FlowShell></>;
}
function Report({ go, data, plan }) { const pro=plan==="pro"; const taskMap=[["AUTOMATE","Pași repetați și previzibili","Pregătirea unui prim draft sau organizarea unei liste, cu aprobare înainte de utilizare."],["AUGMENT","Analiză și variante","Compară mai multe opțiuni sau rezumă surse permise, apoi verifică fiecare concluzie."],["PROTECT","Judecată și responsabilitate","Păstrează decizia, relația cu oamenii și aprobarea finală la persoana responsabilă."],["DEVELOP","Abilități și practică","Exersează verificarea, lucrul cu datele și integrarea instrumentului în condițiile organizației."]]; const sorted=[...indicators.slice(4)].sort((a,b)=>data.indicators[a.id]-data.indicators[b.id]); const skillPlan=sorted.slice(0,5).map((item)=>item.name); return <div className="report-page"><div className="report-tools"><button className="text-button" onClick={()=>go(`/result/${data.reportId}`)}>← Înapoi la rezultat</button><Button onClick={()=>window.print()}>Salvează ca PDF / Tipărește ↗</Button></div><header className="report-cover"><Kicker>AI JOB IMPACT / RAPORT {pro?"PRO":"STANDARD"}</Kicker><ScoreGauge score={data.position} label="Scor general orientativ" description="Sinteză a celor opt indicatori. Nu prezice pierderea jobului." tone="overall" size="large"/><p>{data.occupation.label} · {data.pressure}</p><b>Evidence Coverage: Limited · profil demonstrativ</b></header><section className="report-section"><Kicker>01 / SINTEZĂ</Kicker><h2>Ce înseamnă rezultatul tău</h2><p>Scorul general este {fmtScore(data.position)} din 100, unde o valoare mai mare indică o poziție mai bine pregătită potrivit răspunsurilor declarate și formulei metodologiei V1.2. Presiunea de transformare este „{data.pressure}”, derivată din Riscul de automatizare și Expunerea la AI. Aceste valori nu reprezintă probabilitatea de concediere și nu prezic efecte asupra salariului sau angajării. Profilul ocupațional demonstrativ are acoperire limitată.</p></section><section className="report-section"><Kicker>02 / PROFILUL PE OPT INDICATORI</Kicker><h2>Jobul și pregătirea ta</h2><div className="indicator-grid report-indicators">{indicators.map(item=><ScoreBar key={item.id} item={item} score={data.indicators[item.id]}/>)}</div></section><section className="report-section"><Kicker>03 / COMPARAȚIE CU PROFILUL OCUPAȚIONAL</Kicker><h2>Răspunsuri față de datele demonstrative</h2><p>Diferența este între scorul brut al răspunsurilor tale și profilul structural demonstrativ pentru {data.occupation.label}. Acest profil este mock, cu Evidence Coverage Limited; nu este benchmark național și nu poziționează utilizatorul față de colegi.</p><div className="delta-grid">{indicators.slice(0,4).map((item,index)=><DeltaScale key={item.id} label={item.name} value={fmtScore(data.responseScoreByIndicator[item.id])-data.occupation.baselines[index]}/>)}</div></section>{pro&&<><section className="report-section"><Kicker>04 / ABILITĂȚI DE DEZVOLTAT</Kicker><h2>Top 5 de exersat</h2><ol>{skillPlan.map((skill)=><li key={skill}>{skill}: exersează printr-un proiect mic, verificabil, conectat la activitatea reală.</li>)}</ol><p className="assessment-small">Aceste priorități provin din scorurile personale AD, CR, AIL și AIM; nu sunt certificări și nu garantează cererea pieței.</p></section><section className="report-section"><Kicker>05 / HARTA ACTIVITĂȚILOR</Kicker><h2>Ce automatizezi, ce ajuți și ce păstrezi la oameni</h2><div className="task-map">{taskMap.map(([label,title,description])=><article key={label}><Kicker>{label}</Kicker><h3>{title}</h3><p>{description}</p></article>)}</div><p className="assessment-small">Hartă demonstrativă, orientată de jobul selectat; verifică regulile și contextul real înainte să schimbi un flux de lucru.</p></section><section className="report-section"><Kicker>06 / FLUXURI DE LUCRU AI</Kicker><h2>Idei pentru jobul tău</h2><div className="report-weeks">{[`Pregătește un prim draft pentru ${data.occupation.label.toLowerCase()}`,"Rezumă surse publice și verifică fiecare afirmație","Compară variante și cere criterii explicite","Creează o listă de verificare pentru rezultate repetitive","Păstrează aprobarea umană înainte de folosire"].map((x,i)=><article key={x}><b>0{i+1}</b><p>{x}</p><small>Folosește doar date permise și păstrează verificarea.</small></article>)}</div><p>Categorii de instrumente de explorat: asistenți conversaționali, analiză de documente, generare de conținut și automatizări ușoare. Selectarea unui instrument depinde de regulile organizației și tipul datelor.</p></section><section className="report-section"><Kicker>07 / JOBURI ADIACENTE</Kicker><h2>Opțiuni de explorat</h2><div className="adjacent-list">{data.occupation.adjacent.map((role,i)=><article key={role}><span>0{i+1}</span><div><h3>{role}</h3><p>Profil demonstrativ. Verifică cerințele reale și competențele transferabile înainte să investești într-o tranziție.</p></div></article>)}</div></section><section className="report-section"><Kicker>08 / PLAN 30 · 90 · 365 ZILE</Kicker><div className="report-weeks">{[["30 zile","Alege o sarcină din jobul tău și documentează un flux sigur, cu un criteriu de calitate."],["90 zile","Repetă experimentul în contexte diferite și actualizează o abilitate transferabilă."],["365 zile","Revizuiește direcția și alege joburi adiacente de investigat pe baza cerințelor reale."]].map(([a,b])=><article key={a}><h3>{a}</h3><p>{b}</p></article>)}</div></section><section className="report-section"><Kicker>09 / SIMULATOR DE ÎMBUNĂTĂȚIRE</Kicker><h2>Ce se întâmplă dacă exersezi?</h2><p>Dacă AIL, AIM, AD și CR cresc câte 10 puncte, iar indicatorii despre job rămân neschimbați, formula ar crește scorul general cu aproximativ 5,1 puncte. Este o simulare matematică a formulei, nu o prognoză despre carieră sau piață.</p><div className="simulator-result"><span>Scor general · acum</span><strong>{fmtScore(data.position)} <small>puncte</small></strong><div className="simulator-track" role="meter" aria-label={`Scor simulat: ${Math.min(100, fmtScore(data.position) + 5.1)} din 100, față de scorul actual ${fmtScore(data.position)}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(100, fmtScore(data.position) + 5.1)}><i style={{ width: `${fmtScore(data.position)}%` }}/><b style={{ left: `${Math.min(100, fmtScore(data.position) + 5.1)}%` }}/></div><div className="simulator-track-labels"><span>Acum · {fmtScore(data.position)}</span><span>După exercițiu · {Math.min(100, fmtScore(data.position) + 5.1).toFixed(1).replace(".", ",")}</span></div></div></section></>}</div>; }

function TransitionStart({ go, profile, target, setTarget, onBegin }) {
  const current = occupationDataProvider.getProfile(profile.occupation, profile.domain);
  const available = occupationsForDomain(target.domain).filter((item) => item.id !== profile.occupation);
  const selectedTarget = available.some((item) => item.id === target.occupation) ? target.occupation : available[0]?.id;
  const domainsOptions = domains.map((item) => ({ value: item.id, label: item.name }));
  const occupationOptions = available.map((item) => ({ value: item.id, label: item.label }));
  const horizonOptions = [
    { value: "0", label: "Sub 3 luni" },
    { value: "1", label: "3–6 luni" },
    { value: "2", label: "6–12 luni" },
    { value: "3", label: "12–24 luni" },
    { value: "4", label: "Peste 24 luni" },
  ];
  const updateDomain = (domain) => {
    const nextOccupations = occupationsForDomain(domain).filter((item) => item.id !== profile.occupation);
    setTarget({ ...target, domain, occupation: nextOccupations[0]?.id || occupations.at(-1).id });
  };

  return <FlowShell go={go} eyebrow="PROFESIONAL · COMPARAȚIE DE TRANZIȚIE">
    <Kicker>O COMPARAȚIE ESTE INCLUSĂ</Kicker>
    <h1>Ce job vrei<br /><span>să explorezi?</span></h1>
    <p className="assessment-lede">Vei compara jobul actual cu unul-țintă prin competențe comune, abilități de dezvoltat și un scor de planificare. Nu este un verdict de potrivire profesională.</p>
    <div className="profile-form">
      <div className="profile-form-field"><span>Job actual</span><ProfileDropdown label="Job actual" value={profile.occupation} options={[{ value: profile.occupation, label: current.label }]} disabled onChange={() => {}} /></div>
      <div className="profile-form-field"><span>Domeniul jobului-țintă</span><ProfileDropdown label="Domeniul jobului-țintă" value={target.domain} options={domainsOptions} onChange={updateDomain} /></div>
      <div className="profile-form-field"><span>Ocupație-țintă</span><ProfileDropdown label="Ocupație-țintă" value={selectedTarget} options={occupationOptions} onChange={(occupation) => setTarget({ ...target, occupation })} /></div>
      <div className="profile-form-field"><span>Orizont dorit</span><ProfileDropdown label="Orizont dorit" value={String(target.horizon)} options={horizonOptions} onChange={(horizon) => setTarget({ ...target, horizon: Number(horizon) })} /></div>
    </div>
    <div className="assessment-actions"><button className="text-button" onClick={() => go("/result/current")}>← Înapoi la raport</button><Button onClick={() => onBegin(selectedTarget)}>Începe 5 întrebările de tranziție →</Button></div>
  </FlowShell>;
}
function TransitionFlow({ go, step, answers, setAnswers, onFinish }) { const q=transitionQuestions[step]; return <FlowShell go={go} eyebrow="PRO · ÎNTREBĂRI DESPRE TRANZIȚIE" progress={`${step+1} / 5`}><Kicker>{q.id} / TRANZIȚIE OPȚIONALĂ</Kicker><h1>{q.text}</h1>{q.context&&<p className="assessment-help">{q.context}</p>}<OptionList options={q.options} selected={answers[q.id]} onSelect={(v)=>setAnswers({...answers,[q.id]:v})}/><div className="assessment-actions"><button className="text-button" onClick={()=>step?go(`/transition/q/${step}`):go("/transition/start")}>← Înapoi</button><Button disabled={answers[q.id]===undefined} onClick={()=>step===4?onFinish():go(`/transition/q/${step+2}`)}>{step===4?"Vezi comparația":"Continuă"} →</Button></div></FlowShell>; }
function TransitionResult({ go, data, comparison }) {
  const structural = [["JOBUL ACTUAL", comparison.current], ["JOBUL-ȚINTĂ", comparison.target]];
  return <FlowShell go={go} eyebrow="PRO · COMPARAȚIE DEMONSTRATIVĂ">
    <div className="transition-comparison-head"><article><span>JOB ACTUAL</span><h2>{comparison.current.label}</h2><small>Evidence Coverage: {comparison.evidenceCurrent}</small></article><b>→</b><article><span>JOB-ȚINTĂ</span><h2>{comparison.target.label}</h2><small>Evidence Coverage: {comparison.evidenceTarget}</small></article></div>
    <div className="transition-score-row"><article className="transition-gauge-card"><ScoreGauge score={comparison.readiness} label="Pregătire pentru tranziție" description="Scor de planificare, nu verdict de carieră sau probabilitate de succes." tone="readiness" size="compact" ringValues={data.indicators}/></article><article><Kicker>DIFERENȚĂ DE PREGĂTIRE AI</Kicker><div className={`gap-score ${comparison.readinessGap < 0 ? "negative" : "positive"}`}>{comparison.readinessGap > 0 ? "+" : ""}{comparison.readinessGap}<small> puncte</small></div><p>Nivelul tău declarat (AI Literacy și Utilizare) față de cerința demonstrativă a jobului-țintă.</p><DeltaScale label="Pregătirea ta față de jobul-țintă" value={comparison.readinessGap}/></article><article><Kicker>EFORT ESTIMAT</Kicker><div className="effort-value">{comparison.effort}</div><p>Rezultă din competențele demonstrative care nu se suprapun.</p></article></div>
    <section className="baseline-card"><Kicker>COMPETENȚE COMUNE · TAXONOMIE DEMONSTRATIVĂ</Kicker><h2>Ce se transferă între joburi</h2><div className="overlap-summary"><ScoreGauge score={comparison.overlap} label="Competențe comune" description="Suprapunere în lista demonstrativă de abilități, nu scor de potrivire profesională." tone="impact" size="compact"/></div><p>Acesta este un calcul demonstrativ pe o listă scurtă de competențe exemplificative, nu o mapare ESCO/O*NET reală.</p><div className="report-two-col"><div><h3>Competențe din jobul actual</h3><ul className="transition-skill-list">{comparison.current.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div><div><h3>Competențe de explorat</h3><ul className="transition-skill-list">{comparison.gaps.map(skill => <li key={skill}>{skill}</li>)}</ul></div></div></section>
    <section className="report-section"><Kicker>PLAN PENTRU JOBUL-ȚINTĂ</Kicker><div className="report-weeks">{[["30 zile", "Verifică 3 anunțuri și discută cu o persoană cu jobul respectiv. Notează cerințele repetate."], ["90 zile", "Alege un skill gap și creează un proiect demonstrativ care îl exersează."], ["365 zile", "Compară dovezile acumulate cu cerințele reale și decide ce pas urmează."]].map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section><Button light onClick={() => window.print()}>Salvează comparația ca PDF</Button>
    <section className="baseline-card transition-structural">
      <div className="transition-structural-heading">
        <Kicker>PROFILURI DEMONSTRATIVE · STRUCTURAL, NU PERSONAL</Kicker>
        <p>Compară aceiași patru indicatori pentru jobul actual și jobul-țintă.</p>
      </div>
      <div className="structural-comparison">
        {structural.map(([title, role], profileIndex) => <article className="structural-profile" key={title}>
          <header className="structural-profile-heading">
            <span className="structural-profile-index" aria-hidden="true">0{profileIndex + 1}</span>
            <div><span>{title}</span><h3>{role.label}</h3></div>
          </header>
          <div className="structural-indicators">
            {indicators.slice(0, 4).map((item, index) => <div className="structural-metric" key={item.id}>
              <div className="structural-metric-heading"><span>{item.name}</span><strong>{fmtScore(role.baselines[index])}<small>/100</small></strong></div>
              <IndicatorScale item={item} score={role.baselines[index]} compact />
            </div>)}
          </div>
          <p className="structural-profile-coverage"><span>Acoperire profil</span><strong>Limitată</strong></p>
        </article>)}
      </div>
      <p className="transition-structural-note">Aceste valori sunt profile demonstrative, nu scoruri personale, clasamente sau benchmarkuri. Metodologie {METHOD_VERSION} · Source pack {SOURCE_PACK_VERSION}.</p>
    </section>
    <div className="assessment-actions"><button className="text-button" onClick={() => go("/transition/start")}>Schimbă jobul țintă</button><button className="text-button" onClick={() => go(`/report/${data.reportId}`)}>Înapoi la raport Profesional</button></div>
  </FlowShell>;
}
function InfoPage({ go, path }) { const pages={"/methodology":["Metodologie și surse","Evaluarea folosește 40 de itemi în 8 indicatori. Răspunsurile ordinale sunt normalizate la 0/25/50/75/100, Q05 este inversat, iar media ponderată a itemilor este combinată cu un prior ocupațional acolo unde este definit. Profilurile din prototip sunt date demonstrative, cu Evidence Coverage: Limited. Formula nu este validată psihometric și nu prezice pierderea jobului.","Surse prevăzute în metodologia V1.2: ILO GenAI and Jobs 2025; O*NET 31.0; ESCO 1.2.1; DigComp 3.0; OECD 2024/2026; WEF Future of Jobs 2025. Integrarea directă a acestor seturi de date nu este activă în prototip."],"/privacy":["Confidențialitate în prototip","Răspunsurile și profilul rămân în sesiunea browserului și nu sunt trimise către un server în această versiune. Nu introdu nume, date personale sensibile sau informații confidențiale despre serviciu. Ștergerea sesiunii browserului elimină draftul salvat local.","Pentru lansare trebuie completate identitatea operatorului, scopurile și temeiurile, perioada de retenție, destinatarii și mecanismele de acces, export și ștergere."],"/terms":["Termeni · versiune demonstrativă","Acesta este un prototip de evaluare și prezentare. Nicio recomandare nu constituie certificare, consultanță de recrutare sau promisiune de rezultat profesional. Nu folosi produsul pentru selecția ori evaluarea angajaților.","Termenii comerciali finali trebuie validați juridic înainte de procesarea plăților."],"/refund":["Rambursări · în curs de definire","Nu se percep plăți în acest prototip, deci nu există tranzacții de rambursat. Politica pentru conținut digital va fi stabilită și verificată înainte de lansare comercială."],"/contact":["Contact","Punctul de contact pentru pilot nu este configurat încă. Înainte de lansare se vor adăuga o adresă de suport, operatorul produsului și o procedură pentru solicitări de date sau suport."]}; const [title,...paragraphs]=pages[path]||pages["/methodology"]; return <><SiteHeader go={go} onDemo={()=>go("/demo")}/><main className="info-page section-shell"><Kicker>AI JOB IMPACT / TRANSPARENȚĂ</Kicker><h1>{title}</h1>{paragraphs.map(x=><p key={x}>{x}</p>)}<Button onClick={()=>go("/")}>Înapoi la pagina principală</Button></main><SiteFooter go={go}/></>; }

const initialSession = (() => { try { return JSON.parse(sessionStorage.getItem("aiw-v12")) || {}; } catch { return {}; } })();

export function App() {
  const [path, go] = usePath();
  const [openFaq, setOpenFaq] = useState(0);
  const [plan,setPlan]=useState(initialSession.plan||"standard");
  const [profile,setProfile]=useState(initialSession.profile||{domain:"D03",occupation:"graphic-designer",seniority:"2–5 ani",adult:false});
  const [answers,setAnswers]=useState(initialSession.answers||{});
  const [report,setReport]=useState(initialSession.report||null);
  const [transitionTarget,setTransitionTarget]=useState(initialSession.transitionTarget||{domain:"D03",occupation:"graphic-designer",horizon:2});
  const [transitionAnswers,setTransitionAnswers]=useState(initialSession.transitionAnswers||{});
  const [loading,setLoading]=useState(false);
  const transitionStep=Number(path.split("/").at(-1))-1;
  const parsedResult=useMemo(()=>report, [report]);
  useEffect(()=>{ try { sessionStorage.setItem("aiw-v12",JSON.stringify({plan,profile,answers,report,transitionTarget,transitionAnswers})); } catch {} },[plan,profile,answers,report,transitionTarget,transitionAnswers]);
  useEffect(()=>{ if(path==="/assessment/complete"){ setLoading(true); const timer=setTimeout(()=>{ try{const result=calculateAssessment(answers,profile.occupation,profile.domain);setReport(result);go(`/result/${result.reportId}`);}catch{go("/assessment/q/1");} setLoading(false);},850);return()=>clearTimeout(timer); } },[path]);
  const beginPlan=(value)=>{setPlan(value);go("/checkout");};
  const startQuestions=()=>{setAnswers({});setReport(null);setTransitionAnswers({});go("/assessment/start");};
  const startTransition=()=>{setTransitionAnswers({});go("/transition/start");};
  const finishTransition=()=>{const comparison=transitionComparison(profile.occupation,transitionTarget.occupation,report.indicators,transitionAnswers,profile.domain,transitionTarget.domain);sessionStorage.setItem("aiw-v12-transition",JSON.stringify(comparison));go("/transition/result/current");};
  const resultForRoute=path.startsWith("/result/")?parsedResult:null;
  if(path==="/") return <Home go={go} onDemo={()=>go("/demo")}/>;
  if(path==="/demo") return <Demo go={go}/>;
  if(path==="/pricing") return <Pricing go={go} onChoose={beginPlan}/>;
  if(path==="/checkout") return <Checkout plan={plan} go={go} onContinue={startQuestions}/>;
  if(path==="/retest") return <FlowShell go={go} eyebrow="RETESTARE DUPĂ 3–6 LUNI"><Kicker>O NOUĂ EVALUARE</Kicker><h1>Compară ce s-a schimbat în munca ta</h1><p className="assessment-lede">Poți relua aceleași 40 de întrebări după ce ai exersat sau ai observat schimbări în activitățile tale. Raportul nou va reflecta răspunsurile actuale; în acest prototip nu păstrăm istoricul între rapoarte.</p><div className="assessment-actions"><button className="text-button" onClick={()=>go(`/result/${report?.reportId||"current"}`)}>← Înapoi la rezultat</button><Button onClick={startQuestions}>Începe o evaluare nouă →</Button></div></FlowShell>;
  if(path==="/assessment/start") return <ProfileStart go={go} profile={profile} setProfile={setProfile} onStart={()=>go("/assessment/q/1")}/>;
  if(path.startsWith("/assessment/q/")){const index=Number(path.split("/").at(-1))-1;if(!questions[index]){go("/assessment/q/1");return null;}return <AssessmentQuestion index={index} answers={answers} setAnswer={(id,value)=>setAnswers({...answers,[id]:value})} profile={profile} go={go} onBack={()=>go(index?`/assessment/q/${index}`:"/assessment/start")} onNext={()=>index===39?go("/assessment/complete"):go(`/assessment/q/${index+2}`)}/>;}
  if(path==="/assessment/complete") return <FlowShell go={go} eyebrow="RAPORTUL TĂU"><div className="loading-panel"><div className="loading-orb"/><Kicker>CORELĂM RĂSPUNSURILE CU PROFILUL OCUPAȚIONAL</Kicker><h1>Pregătim imaginea de ansamblu</h1><p>Verificăm regulile de calcul și păstrăm separat presiunea asupra jobului de pregătirea ta.</p></div></FlowShell>;
  if(path.startsWith("/result/")){ if(!resultForRoute){return <FlowShell go={go} eyebrow="SESIUNEA NU MAI ESTE DISPONIBILĂ"><h1>Raportul nu se află în această sesiune</h1><p className="assessment-lede">În prototip, răspunsurile și raportul sunt păstrate doar local în browser.</p><Button onClick={()=>go("/pricing")}>Reîncepe evaluarea</Button></FlowShell>;} return <Result go={go} data={resultForRoute} plan={plan} onTransition={startTransition}/>;}
  if(path.startsWith("/report/")){if(!parsedResult)return <InfoPage go={go} path="/methodology"/>;return <Report go={go} data={parsedResult} plan={plan}/>;}
  if(path==="/transition/start"){if(plan!=="pro"||!report)return <FlowShell go={go} eyebrow="COMPARAȚIA ESTE DISPONIBILĂ ÎN PROFESIONAL"><h1>Compararea joburilor este disponibilă în Profesional</h1><Button onClick={()=>go("/pricing")}>Vezi planul Profesional</Button></FlowShell>;return <TransitionStart go={go} profile={profile} target={transitionTarget} setTarget={setTransitionTarget} onBegin={(targetRole)=>{setTransitionTarget({...transitionTarget,occupation:targetRole});go("/transition/q/1");}}/>;}
  if(path.startsWith("/transition/q/")){const step=transitionStep;if(!transitionQuestions[step]){go("/transition/q/1");return null;}return <TransitionFlow go={go} step={step} answers={transitionAnswers} setAnswers={setTransitionAnswers} onFinish={finishTransition}/>;}
  if(path.startsWith("/transition/result/")){let comparison;try{comparison=JSON.parse(sessionStorage.getItem("aiw-v12-transition"));}catch{};if(!comparison||!report)return <InfoPage go={go} path="/methodology"/>;return <TransitionResult go={go} data={report} comparison={comparison}/>;}
  return <InfoPage go={go} path={path}/>;
}
