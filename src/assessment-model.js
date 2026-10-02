export const METHOD_VERSION = "1.2.0";
export const SOURCE_PACK_VERSION = "MOCK-RO-2026.09";

export const domains = [
  ["D01", "IT, software, date și cybersecurity", "cod, analiză de date, infrastructură, suport tehnic și produs digital"],
  ["D02", "Finanțe, contabilitate, banking și asigurări", "raportare, reconciliere, analiză financiară, conformitate și relație cu clientul"],
  ["D03", "Marketing, comunicare, media și industrii creative", "strategie, copy, design, campanii, conținut și producție vizuală"],
  ["D04", "Vânzări, retail și customer service", "prospectare, ofertare, CRM, negociere, suport și operațiuni retail"],
  ["D05", "Management, administrație și operațiuni", "planificare, coordonare, raportare, documente, procese și decizie"],
  ["D06", "HR, educație și training", "recrutare, evaluare, learning, predare, facilitare și dezvoltarea oamenilor"],
  ["D07", "Juridic, consultanță și servicii profesionale", "research, documente, analiză, due diligence, consultanță și relația cu clienții"],
  ["D08", "Sănătate și life sciences", "documentație, analiză, comunicare cu pacienții, protocoale și cercetare"],
  ["D09", "Inginerie, producție și industrie", "proiectare, simulare, mentenanță, controlul calității și documentație tehnică"],
  ["D10", "Arhitectură, construcții și real estate", "proiectare, BIM/CAD, devize, coordonare, șantier și ofertare"],
  ["D11", "Transport, logistică și supply chain", "planificarea rutelor, stocuri, documente, prognoză și operațiuni"],
  ["D12", "HoReCa, turism și servicii personale", "rezervări, relația cu clientul, operațiuni, programări și servicii"],
  ["D13", "Sector public, ONG și servicii comunitare", "documente, proceduri, relația cu publicul, programe și administrație"],
].map(([id, name, examples]) => ({ id, name, examples }));

export const occupations = [
  { id: "software-developer", label: "Software developer", domain: "D01", skills: ["programare", "testare", "arhitectură software", "comunicare tehnică"], adjacent: ["AI engineer", "Data analyst", "QA automation"], baselines: [67, 88, 82, 58, 64, 72, 75, 70], aiDemand: 78 },
  { id: "ai-engineer", label: "AI engineer", domain: "D01", skills: ["programare", "machine learning", "date", "arhitectură software"], adjacent: ["ML engineer", "Data engineer", "AI product specialist"], baselines: [72, 94, 92, 61, 82, 87, 83, 76], aiDemand: 92 },
  { id: "accountant", label: "Contabil", domain: "D02", skills: ["raportare", "reconciliere", "conformitate", "analiză financiară"], adjacent: ["Financial analyst", "Controller", "Specialist conformitate"], baselines: [73, 82, 79, 61, 58, 65, 68, 70], aiDemand: 64 },
  { id: "financial-analyst", label: "Financial analyst", domain: "D02", skills: ["raportare", "analiză financiară", "prognoză", "comunicare"], adjacent: ["Controller", "Business analyst", "Risk analyst"], baselines: [66, 85, 88, 66, 65, 70, 74, 74], aiDemand: 72 },
  { id: "graphic-designer", label: "Graphic designer", domain: "D03", skills: ["design vizual", "direcție creativă", "tipografie", "comunicare cu clientul"], adjacent: ["UX designer", "Art director", "Motion designer"], baselines: [56, 84, 89, 76, 57, 68, 75, 71], aiDemand: 69 },
  { id: "ux-designer", label: "UX designer", domain: "D03", skills: ["design vizual", "cercetare UX", "prototipare", "comunicare cu clientul"], adjacent: ["Product designer", "Service designer", "UX researcher"], baselines: [49, 80, 84, 84, 67, 73, 79, 80], aiDemand: 72 },
  { id: "sales-support", label: "Specialist vânzări sau suport clienți", domain: "D04", skills: ["CRM", "negociere", "relația cu clientul", "rezolvarea problemelor"], adjacent: ["Customer success", "Account manager", "Sales operations"], baselines: [63, 78, 82, 83, 55, 66, 70, 72], aiDemand: 62 },
  { id: "hr-specialist", label: "Specialist HR", domain: "D06", skills: ["recrutare", "facilitare", "dezvoltarea oamenilor", "comunicare"], adjacent: ["Learning & Development", "People operations", "Talent partner"], baselines: [49, 69, 76, 86, 54, 61, 71, 74], aiDemand: 60 },
  { id: "learning-development", label: "Learning & Development specialist", domain: "D06", skills: ["facilitare", "design de învățare", "dezvoltarea oamenilor", "comunicare"], adjacent: ["Learning designer", "People development", "Training partner"], baselines: [44, 70, 82, 88, 68, 74, 81, 80], aiDemand: 68 },
  { id: "project-manager", label: "Manager de proiect", domain: "D05", skills: ["planificare", "coordonare", "comunicare", "managementul riscurilor"], adjacent: ["Operations manager", "Product manager", "Program manager"], baselines: [55, 74, 80, 87, 59, 65, 72, 76], aiDemand: 66 },
  { id: "architect", label: "Arhitect", domain: "D10", skills: ["proiectare", "BIM/CAD", "coordonare", "reglementări"], adjacent: ["BIM specialist", "Urban planner", "Project architect"], baselines: [52, 79, 86, 84, 56, 62, 69, 73], aiDemand: 65 },
  { id: "bim-specialist", label: "BIM specialist", domain: "D10", skills: ["proiectare", "BIM/CAD", "modelare digitală", "coordonare"], adjacent: ["BIM coordinator", "Digital construction specialist", "VDC manager"], baselines: [61, 85, 91, 75, 63, 70, 76, 75], aiDemand: 76 },
  { id: "domain-professional", label: "Alt job din domeniul meu", domain: "D00", skills: ["cunoștințe de domeniu", "comunicare", "rezolvarea problemelor"], adjacent: ["Joburi adiacente de explorat", "Specialist operațiuni", "Consultant de domeniu"], baselines: [57, 70, 73, 77, 50, 55, 62, 60], aiDemand: 58 },
];

export const indicators = [
  { id: "AR", name: "Risc de automatizare", type: "impact", alpha: .55, weights: [22,22,18,18,20], why: "Cât de mult din munca raportată urmează reguli, se repetă și poate fi standardizată. Q05 se citește invers, deoarece prezența fizică și contextul imprevizibil reduc automatizarea." },
  { id: "AE", name: "Expunere la AI", type: "impact", alpha: .50, weights: [22,18,18,24,18], why: "Cât de direct se întâlnesc activitățile tale cu capacitățile AI generative sau cu instrumente digitale de domeniu." },
  { id: "AUG", name: "Potențial de augmentare prin AI", type: "impact", alpha: .35, weights: [22,18,20,20,20], why: "Unde AI te-ar putea ajuta să pregătești, să analizezi sau să testezi mai mult, păstrând verificarea și decizia umană." },
  { id: "HA", name: "Avantaj uman", type: "impact", alpha: .40, weights: [20,22,18,22,18], why: "Cât de importantă este în job relația umană, judecata în situații noi, coordonarea și integrarea mai multor perspective." },
  { id: "AIL", name: "Alfabetizare și competență AI", type: "readiness", alpha: 0, weights: [24,22,20,18,16], why: "Practici declarate de verificare, protejare a datelor, formulare a cerințelor și folosire responsabilă." },
  { id: "AIM", name: "Maturitatea utilizării și integrării AI", type: "readiness", alpha: 0, weights: [23,18,10,25,24], why: "Cât de des și în ce fel AI intră deja în activitățile și fluxurile tale de lucru." },
  { id: "AD", name: "Adaptabilitate și agilitate în învățare", type: "readiness", alpha: 0, weights: [20,22,20,18,20], why: "Comportamente recente de învățare, testare și adaptare a modului de lucru." },
  { id: "CR", name: "Reziliență profesională și competențe transferabile", type: "readiness", alpha: 0, weights: [22,18,20,20,20], why: "Cât de ușor poți folosi abilități relevante și în activități sau joburi diferite." },
];

const rawQuestions = [
  ["Cât din munca ta este repetitivă și urmează reguli clare?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât din activitatea ta poate fi descrisă prin pași standard, fără excepții frecvente?", ["Foarte puțin", "Puțin", "Moderat", "Mult", "Aproape tot"]],
  ["Cât timp lucrezi cu informații digitale structurate, documente sau date?", ["<10%", "10–25%", "26–50%", "51–75%", ">75%"]],
  ["Cât de des rezultatul muncii tale poate fi verificat prin reguli, criterii sau exemple existente?", ["Rar", "Uneori", "Aproximativ jumătate", "Des", "Aproape mereu"]],
  ["Cât din munca ta depinde de prezență fizică, medii imprevizibile sau manipulare în lumea reală?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât din munca ta implică scriere, rezumare, căutare sau analiză de informații?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât din activitatea ta presupune generarea sau modificarea de conținut digital?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de des folosești software pentru analiză, planificare, proiectare sau luarea deciziilor?", ["Rar", "Lunar", "Săptămânal", "Zilnic", "Permanent"]],
  ["Cât de multe dintre task-urile tale pot fi asistate azi de un model AI generativ?", ["Aproape niciunul", "Câteva", "Aproximativ jumătate", "Majoritatea", "Aproape toate"]],
  ["În domeniul tău, cât de repede apar instrumente AI dedicate activităților profesionale?", ["Foarte lent", "Lent", "Moderat", "Rapid", "Foarte rapid"]],
  ["Dacă ai folosi AI bine, cât timp crezi că ai putea economisi în task-urile repetitive sau pregătitoare?", ["<5%", "5–10%", "11–25%", "26–40%", ">40%"]],
  ["Cât de mult ar putea AI îmbunătăți calitatea primei versiuni a muncii tale?", ["Deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de mult te-ar ajuta AI să analizezi mai multe informații sau opțiuni decât poți manual?", ["Deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de mult poate AI accelera prototiparea, simularea sau testarea ideilor în jobul tău?", ["Deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de realist este ca AI să îți permită să livrezi mai mult fără să scadă calitatea?", ["Foarte nerealist", "Nerealist", "Posibil", "Realist", "Foarte realist"]],
  ["Cât de mult depinde succesul tău de încredere, empatie sau relație umană?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de des trebuie să îți asumi responsabilitatea pentru decizii cu consecințe reale?", ["Rar", "Uneori", "Aproximativ jumătate", "Des", "Aproape mereu"]],
  ["Cât de mult contează negocierea, influența, leadershipul sau coordonarea altor oameni?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de des întâlnești situații noi în care regulile existente nu sunt suficiente?", ["Rar", "Uneori", "Aproximativ jumătate", "Des", "Aproape mereu"]],
  ["Cât de mult depinde valoarea ta de creativitate, gust profesional sau integrarea mai multor perspective?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Când AI îți oferă un răspuns foarte sigur pe el, dar important pentru muncă, ce faci de obicei?", ["Îl folosesc direct", "Îl recitesc", "Verific dacă pare dubios", "Verific sursele-cheie", "Triangulez cu surse independente"]],
  ["Cum tratezi datele confidențiale când folosești AI?", ["Le introduc ca atare", "Evit doar datele evidente", "Anonimizez parțial", "Folosesc doar servicii aprobate", "Urmez o regulă clară de minimizare și aprobare"]],
  ["Cum formulezi de obicei o sarcină pentru AI?", ["O întrebare scurtă", "Adaug context", "Adaug context și format", "Adaug criterii și exemple", "Structurez sarcina, criteriile, verificarea și iterația"]],
  ["Cum alegi instrumentul AI pentru o sarcină?", ["Folosesc mereu același", "Aleg dintre 1–2 familiare", "Aleg după tipul sarcinii", "Compar capabilități și limitări", "Aleg și configurez instrumentul după risc, date și rezultat"]],
  ["Ce faci când AI produce erori repetate?", ["Regenerez până iese", "Reformulez promptul", "Schimb modelul sau metoda", "Identific cauza și introduc verificări", "Redesign workflow-ul și păstrez control uman unde este critic"]],
  ["Cât de des folosești AI în activitatea profesională?", ["Niciodată", "Lunar", "Săptămânal", "Zilnic", "De mai multe ori pe zi"]],
  ["Câte tipuri de instrumente AI folosești activ într-o lună obișnuită?", ["0", "1", "2", "3–4", "5+"]],
  ["Ce nivel de acces AI ai în prezent?", ["Doar gratuit", "Gratuit + testări", "Un abonament personal sau de firmă", "Mai multe servicii plătite", "Acces enterprise sau instrumente AI specializate"]],
  ["Folosești agenți AI sau automatizări care execută mai mulți pași?", ["Nu știu ce sunt", "Știu, dar nu folosesc", "Am testat", "Folosesc regulat", "Configurez sau construiesc astfel de fluxuri"]],
  ["Cât de integrat este AI în fluxul tău de lucru?", ["Ocazional, ad-hoc", "Pentru câteva task-uri", "Am prompturi/template-uri recurente", "Am workflow-uri conectate", "Am automatizări, agenți sau integrări/API"]],
  ["Cât de des înveți intenționat un instrument sau o metodă digitală nouă?", ["Mai rar de anual", "Anual", "Trimestrial", "Lunar", "Aproape continuu"]],
  ["Cum reacționezi când un instrument nou îți schimbă modul de lucru?", ["Îl evit", "Îl adopt doar dacă trebuie", "Îl testez", "Îmi adaptez procesul", "Îmi reproiectez activ munca pentru avantaj"]],
  ["Cât de repede poți transforma o abilitate nouă în ceva util la job?", ["Luni multe", "Câteva luni", "1–2 luni", "Câteva săptămâni", "Câteva zile-săptămâni"]],
  ["Ai în mod regulat un plan concret de dezvoltare a competențelor?", ["Nu", "Rareori", "Informal", "Da, cu obiective", "Da, cu obiective, practică și verificarea progresului"]],
  ["Când jobul sau piața se schimbă, cât de ușor îți modifici prioritățile și modul de lucru?", ["Foarte greu", "Greu", "Acceptabil", "Ușor", "Foarte ușor"]],
  ["Câte dintre competențele tale pot fi folosite și în alte joburi sau industrii?", ["Foarte puține", "Puține", "Câteva", "Multe", "Foarte multe"]],
  ["Cât de confortabil lucrezi cu oameni din alte funcții sau specializări?", ["Foarte puțin", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Cât de mult din valoarea ta profesională vine din cunoștințe greu de obținut rapid doar din informații publice?", ["Aproape deloc", "Puțin", "Moderat", "Mult", "Foarte mult"]],
  ["Ai experiență demonstrabilă în rezolvarea unor probleme noi, fără procedură clară?", ["Foarte puțină", "Puțină", "Moderată", "Multă", "Foarte multă"]],
  ["Cât de clar știi către ce joburi apropiate te-ai putea muta dacă jobul actual s-ar schimba puternic?", ["Deloc", "Vag", "Am 1 opțiune", "Am câteva opțiuni", "Am opțiuni + skill-gap clar pentru fiecare"]]
];

export const questions = rawQuestions.map(([text, options], index) => ({ id: `Q${String(index + 1).padStart(2, "0")}`, indicator: indicators[Math.floor(index / 5)].id, group: indicators[Math.floor(index / 5)].name, text, options, weight: indicators[Math.floor(index / 5)].weights[index % 5], reverse: index === 4 }));

export const domainsById = Object.fromEntries(domains.map((domain) => [domain.id, domain]));
const domainMocks = {
  D01:[66,88,84,60,61,70,73,70],D02:[70,83,80,64,57,65,68,70],D03:[56,83,88,77,58,68,74,72],D04:[63,78,82,82,56,66,70,72],D05:[57,75,81,83,58,65,71,75],D06:[49,70,78,86,57,63,73,75],D07:[68,84,82,81,62,67,72,77],D08:[45,71,76,91,59,64,71,74],D09:[51,74,80,84,56,62,69,72],D10:[53,80,86,83,57,64,70,74],D11:[61,74,77,75,55,62,68,70],D12:[50,67,73,88,52,60,68,70],D13:[58,73,77,83,56,62,69,72]
};
export const occupationById = (id, domainId = "D00") => {
  const occupation = occupations.find((item) => item.id === id);
  if (occupation && occupation.domain !== "D00") return occupation;
  const domain = domainsById[domainId] ?? domains[0];
  return { ...occupations.at(-1), id: `mock-${domain.id}`, domain: domain.id, label: `Alt job: ${domain.name}`, baselines: domainMocks[domain.id] ?? occupations.at(-1).baselines, examples: domain.examples };
};
export const occupationsForDomain = (domainId) => {
  const exact = occupations.filter((item) => item.domain === domainId);
  return [...exact, occupations.at(-1)];
};
export const mappingQualityService = {
  evaluate(profile) {
    return { label: "Limited", rationale: `Profil demonstrativ pentru ${profile.label}; nu este legat la o mapare ocupațională externă validată.` };
  },
};
export const occupationDataProvider = {
  version: SOURCE_PACK_VERSION,
  getProfile(occupationId, domainId = "D00") {
    const profile = occupationById(occupationId, domainId);
    const mapping = mappingQualityService.evaluate(profile);
    return { ...profile, evidenceCoverage: mapping.label, evidenceRationale: mapping.rationale, isMock: true };
  },
};

export function calculateAssessment(answers, occupationId, domainId = "D00") {
  const occupation = occupationDataProvider.getProfile(occupationId, domainId);
  const scoreMap = {};
  for (let index = 0; index < indicators.length; index += 1) {
    const indicator = indicators[index];
    const items = questions.slice(index * 5, index * 5 + 5);
    const responseScore = items.reduce((sum, item) => {
      const raw = answers[item.id];
      if (!Number.isInteger(raw) || raw < 0 || raw > 4) throw new Error(`Răspuns invalid pentru ${item.id}`);
      const normalized = item.reverse ? 100 - raw * 25 : raw * 25;
      return sum + normalized * item.weight / 100;
    }, 0);
    const baseline = occupation.baselines[index];
    scoreMap[indicator.id] = indicator.alpha ? indicator.alpha * baseline + (1 - indicator.alpha) * responseScore : responseScore;
  }
  const [AR, AE, AUG, HA, AIL, AIM, AD, CR] = indicators.map((indicator) => scoreMap[indicator.id]);
  const position = .13 * (100 - AR) + .10 * (100 - AE) + .12 * AUG + .14 * HA + .14 * AIL + .14 * AIM + .12 * AD + .11 * CR;
  const pressureValue = (AR + AE) / 2;
  const pressure = pressureValue < 40 ? "Presiune de transformare mai redusă" : pressureValue < 70 ? "Presiune de transformare intermediară" : "Presiune de transformare mai ridicată";
  return { indicators: scoreMap, responseScoreByIndicator: Object.fromEntries(indicators.map((indicator, index) => [indicator.id, questions.slice(index * 5, index * 5 + 5).reduce((sum, item) => sum + (item.reverse ? 100 - answers[item.id] * 25 : answers[item.id] * 25) * item.weight / 100, 0)])), position, pressure, pressureValue, occupation, evidenceCoverage: "Limited", methodologyVersion: METHOD_VERSION, sourcePackVersion: SOURCE_PACK_VERSION, reportId: `AIW-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${Math.random().toString(36).slice(2,7).toUpperCase()}` };
}

export function transitionComparison(currentRoleId, targetRoleId, scores, tAnswers, currentDomain, targetDomain) {
  const current = occupationDataProvider.getProfile(currentRoleId, currentDomain);
  const target = occupationDataProvider.getProfile(targetRoleId, targetDomain);
  const currentSkills = current.skills;
  const targetSkills = target.skills;
  const overlap = Math.round(currentSkills.filter((skill) => targetSkills.includes(skill)).length / Math.max(1, new Set([...currentSkills, ...targetSkills]).size) * 100);
  const gaps = targetSkills.filter((skill) => !currentSkills.includes(skill));
  const evidence = ((tAnswers.T01 + tAnswers.T02) / 8) * 100;
  const learning = ((tAnswers.T03 + tAnswers.T04) / 8) * 100;
  const readiness = Math.round(.35 * overlap + .20 * scores.AD + .15 * scores.CR + .15 * evidence + .15 * learning);
  const readinessGap = Math.round(((scores.AIL + scores.AIM) / 2) - target.aiDemand);
  return { current, target, overlap, gaps, readiness, readinessGap, horizon: tAnswers.T05, evidenceCurrent: "Limited", evidenceTarget: "Limited", effort: gaps.length >= 3 ? "Ridicat" : gaps.length === 2 ? "Moderat" : "Mai redus" };
}

export function fmtScore(score) { return Math.round(score); }
