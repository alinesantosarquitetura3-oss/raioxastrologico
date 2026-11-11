const STORAGE_KEY = "raiox-caderno-v1";

const questions = [
  { title: "Emoções", intro: "Comece pelo que está vivo dentro de você agora.", prompt: "Responda com a primeira coisa que surgir, sem tentar corrigir ou deixar a resposta bonita.", fields: [
    { id: "q1", label: "Eu não aguento mais me sentir...", help: "Nomeie as emoções, mesmo que pareçam contraditórias." }
  ]},
  { title: "Situações", intro: "Observe os cenários que têm se repetido ou consumido sua energia.", prompt: "Seja objetiva. Você pode citar mais de uma área da vida.", fields: [
    { id: "q2", label: "Eu não aguento mais viver estas situações..." }
  ]},
  { title: "Palavras e mensagens", intro: "Algumas frases acionam medos, lembranças e reações automáticas.", prompt: "Registre tanto o que você ouve quanto o que acontece dentro de você.", fields: [
    { id: "q3a", label: "Eu não aguento mais ouvir estas coisas..." },
    { id: "q3b", label: "Quando ouço isso, eu...", help: "Descreva emoções, pensamentos e reações." }
  ]},
  { title: "Pessoas e relações", intro: "Olhe para as cobranças, expectativas e comportamentos que mais afetam você.", prompt: "Você pode omitir nomes e dados pessoais.", fields: [
    { id: "q4a", label: "Eu não aguento mais que determinadas pessoas me..." },
    { id: "q4b", label: "Quando elas fazem isso, eu..." }
  ]},
  { title: "Obrigações e sobrecargas", intro: "Perceba o que você sente que precisa sustentar, resolver ou controlar.", prompt: "Inclua tarefas, papéis, responsabilidades e exigências internas.", fields: [
    { id: "q5a", label: "Eu não aguento mais ter que..." },
    { id: "q5b", label: "Quando isso acontece, eu sinto e reajo assim..." }
  ]},
  { title: "Bloqueios", intro: "Dê nome ao que parece sempre escapar, travar ou não se concretizar.", prompt: "Não procure uma explicação ainda. Apenas descreva o que acontece.", fields: [
    { id: "q6a", label: "Eu não aguento mais não conseguir..." },
    { id: "q6b", label: "Por não conseguir, eu acabo..." }
  ]},
  { title: "Faltas e desejos", intro: "Identifique o que você sente que está ausente na sua vida.", prompt: "As repetições são importantes. Não apague algo só porque já apareceu antes.", fields: [
    { id: "q7a", label: "Eu não aguento mais não ter..." },
    { id: "q7b", label: "Por não ter isso, eu sinto e reajo assim..." }
  ]},
  { title: "Necessidades emocionais", intro: "Agora observe os estados internos que você mais deseja experimentar.", prompt: "Exemplos: amada, acolhida, segura, reconhecida, livre, vista, capaz.", fields: [
    { id: "q8a", label: "Eu não aguento mais não me sentir..." },
    { id: "q8b", label: "Por não me sentir assim, eu tenho agido desta maneira..." }
  ]},
  { title: "História familiar", intro: "Olhe para o passado com honestidade e delicadeza, sem buscar culpados.", prompt: "Registre o que você desejava receber e o que sentia que recebia.", fields: [
    { id: "q9pa", label: "Pai, eu queria que você..." },
    { id: "q9pb", label: "Mas eu sentia que você..." },
    { id: "q9ma", label: "Mãe, eu queria que você..." },
    { id: "q9mb", label: "Mas eu sentia que você..." },
    { id: "q9fa", label: "Irmãos, avós, tios ou outros familiares, eu queria que vocês..." },
    { id: "q9fb", label: "Mas eu sentia que vocês..." }
  ]}
];

const defaultState = { name: "", date: new Date().toISOString().slice(0,10), answers: {}, screen: "home", step: 0 };
let state = loadState();
let mapFile = null;
let mapPreviewUrl = null;

function loadState() {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return { ...defaultState }; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const label = document.getElementById("saveLabel");
  if (label) {
    label.textContent = "Salvando...";
    clearTimeout(saveState.timer);
    saveState.timer = setTimeout(() => label.textContent = "Salvo neste navegador", 450);
  }
}

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function answered(question) { return question.fields.every(f => (state.answers[f.id] || "").trim()); }
function completedCount() { return questions.filter(answered).length; }
function progress() { return Math.round((completedCount() / questions.length) * 100); }

function render() {
  const root = document.getElementById("mainContent");
  if (state.screen === "journey") root.innerHTML = renderJourney();
  else if (state.screen === "summary") root.innerHTML = renderSummary();
  else root.innerHTML = renderHome();
  bindInputs();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHome() {
  return `<section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">Seu ponto de partida</p>
      <h1>Olhe para dentro.<br><em>Veja o padrão.</em></h1>
      <p>Um percurso guiado por nove perguntas para organizar o que você sente, vive e repete — antes de correlacionar suas respostas com o mapa astral.</p>
      <div class="feature-row">
        <span class="feature-pill">9 etapas guiadas</span><span class="feature-pill">Salvamento automático</span><span class="feature-pill">Relatório ao final</span>
      </div>
    </div>
    <div class="hero-card">
      <h2>Vamos começar?</h2>
      <p>Reserve alguns minutos e responda com a primeira coisa que surgir. Não existem respostas certas.</p>
      <div class="field"><label for="name">Seu nome ou identificação</label><input id="name" data-profile="name" type="text" value="${esc(state.name)}" placeholder="Você pode usar apenas o primeiro nome"></div>
      <div class="field"><label for="date">Data deste registro</label><input id="date" data-profile="date" type="date" value="${esc(state.date)}"></div>
      <button class="btn btn-primary btn-wide" type="button" data-action="start">${completedCount() ? "Continuar meu caderno" : "Iniciar meu Raio-X"} <span aria-hidden="true">→</span></button>
      ${completedCount() ? `<button class="btn btn-ghost btn-wide" style="margin-top:10px" type="button" data-action="summary">Ver relatório atual</button>` : ""}
      <div class="privacy-note"><span aria-hidden="true">◉</span><span>Suas respostas ficam armazenadas somente neste navegador. Nenhum dado é enviado automaticamente.</span></div>
    </div>
  </section>`;
}

function renderJourney() {
  const q = questions[state.step];
  return `<section class="journey">
    <aside class="side-panel">
      <h2>Raio-X Inicial</h2><p>${esc(state.name || "Seu percurso")} · ${formatDate(state.date)}</p>
      <div class="progress-track"><div class="progress-fill" style="width:${progress()}%"></div></div><div class="progress-label">${completedCount()} de 9 etapas completas</div>
      <ol class="step-list">${questions.map((item,i) => `<li><button class="step-button ${i === state.step ? "active" : ""} ${answered(item) ? "done" : ""}" type="button" data-step="${i}"><span class="step-num">${i+1}</span><span>${esc(item.title)}</span><span class="step-check">${answered(item) ? "✓" : ""}</span></button></li>`).join("")}</ol>
    </aside>
    <article class="question-card">
      <div class="question-top"><div><span class="question-number">Pergunta ${state.step + 1} de 9</span><h1>${esc(q.title)}</h1></div></div>
      <p class="question-intro">${esc(q.intro)}</p><div class="prompt-box">${esc(q.prompt)}</div>
      <div class="question-fields">${q.fields.map(f => `<div class="field"><label for="${f.id}">${esc(f.label)}</label>${f.help ? `<span class="field-help">${esc(f.help)}</span>` : ""}<textarea id="${f.id}" data-answer="${f.id}" placeholder="Escreva livremente...">${esc(state.answers[f.id] || "")}</textarea></div>`).join("")}</div>
      <div class="question-actions">
        <button class="btn btn-ghost" type="button" data-action="prev">${state.step === 0 ? "Voltar ao início" : "← Pergunta anterior"}</button>
        <button class="btn btn-primary" type="button" data-action="next">${state.step === questions.length - 1 ? "Gerar meu relatório" : "Próxima pergunta →"}</button>
      </div>
    </article>
  </section>`;
}

function getThemes() {
  const text = Object.values(state.answers).join(" ").toLowerCase();
  const groups = [
    ["Relações e vínculos", /relacion|marido|homem|parceir|amor|amada|casamento/],
    ["Família e pertencimento", /famíl|filh|mãe|mae|pai|irmã|irmao|irmão|avó|avô/],
    ["Trabalho e realização", /trabalh|carreira|profiss|escritório|projeto|cliente|foco/],
    ["Dinheiro e segurança", /dinheir|financeir|conta|prosper|verba|pagar|dívida|divida/],
    ["Corpo e bem-estar", /corpo|dor|saúde|saude|comer|aliment|malhar|dormir|sono/],
    ["Reconhecimento e cobrança", /reconhec|cobran|julg|perfei|resultado|troféu|trofeu/],
    ["Paz e liberdade", /paz|sossego|liberdade|leveza|segura|segurança/]
  ];
  const found = groups.filter(([,re]) => re.test(text)).map(([name]) => name);
  return found.length ? found : ["Temas a serem identificados após o preenchimento"];
}

function answerText(id) { return (state.answers[id] || "").trim() || "Ainda não respondido."; }
function answerClass(id) { return (state.answers[id] || "").trim() ? "" : "empty-answer"; }

function renderSummary() {
  const cards = questions.map((q,i) => `<section class="summary-card ${i === 8 ? "full" : ""}"><h2>${i+1}. ${esc(q.title)}</h2>${q.fields.map(f => `<h3>${esc(f.label)}</h3><p class="${answerClass(f.id)}">${esc(answerText(f.id))}</p>`).join("")}</section>`).join("");
  return `<section class="summary-wrap">
    <div class="summary-head"><div><p class="eyebrow">Relatório Raio-X Inicial</p><h1>Seu ponto zero.</h1></div><p>Este relatório organiza o que você escreveu. Ele não substitui uma análise profissional nem interpreta sozinho o seu mapa astral.</p></div>
    <div class="summary-toolbar">
      <button class="btn btn-primary" type="button" data-action="download">Baixar em Markdown</button>
      <button class="btn btn-secondary" type="button" data-action="copy">Copiar para Madame Aline</button>
      <button class="btn btn-ghost" type="button" data-action="print">Imprimir / salvar em PDF</button>
      <button class="btn btn-ghost" type="button" data-action="edit">Revisar respostas</button>
      <button class="btn btn-danger" type="button" data-action="reset">Apagar tudo</button>
    </div>
    <div class="summary-grid">
      <section class="summary-card full"><h2>Identificação</h2><p><strong>Nome:</strong> ${esc(state.name || "Não informado")}<br><strong>Data:</strong> ${formatDate(state.date)}<br><strong>Etapas completas:</strong> ${completedCount()} de 9</p></section>
      <section class="summary-card full"><h2>Temas presentes nas respostas</h2><div class="theme-tags">${getThemes().map(t => `<span class="theme-tag">${esc(t)}</span>`).join("")}</div><div class="notice">Os temas acima são apenas uma organização por palavras recorrentes. Eles não constituem diagnóstico nem interpretação astrológica.</div></section>
      ${cards}
      <section class="summary-card full"><h2>Mapa astral</h2><div class="map-drop"><label for="mapFile">Adicione a imagem do seu mapa para preparar o envio à Madame Aline</label><input id="mapFile" type="file" accept="image/png,image/jpeg,image/webp">${mapPreviewUrl ? `<img class="map-preview" src="${mapPreviewUrl}" alt="Prévia do mapa astral selecionado">` : ""}<p style="color:var(--muted);font-size:.78rem;margin:10px 0 0">A imagem não é salva nem enviada. Ela permanece apenas aberta nesta tela.</p></div></section>
    </div>
  </section>`;
}

function formatDate(date) {
  if (!date) return "Não informada";
  const [y,m,d] = date.split("-"); return `${d}/${m}/${y}`;
}

function buildMarkdown(forMadame = false) {
  const lines = ["# Relatório Raio-X Inicial", "", `**Nome:** ${state.name || "Não informado"}`, `**Data:** ${formatDate(state.date)}`, "", "## Temas recorrentes", "", getThemes().map(t => `- ${t}`).join("\n"), ""];
  questions.forEach((q,i) => {
    lines.push(`## ${i+1}. ${q.title}`, "");
    q.fields.forEach(f => lines.push(`**${f.label}**`, "", answerText(f.id), ""));
  });
  if (forMadame) lines.push("## Solicitação à Madame Aline", "", "Com base nas respostas acima e na imagem do meu mapa astral que enviarei junto, identifique quais características do mapa aparecem evidenciadas nas respostas. Organize a análise no formato: evidência da resposta → código astrológico → hipótese de investigação → nível de sustentação. Não faça diagnósticos nem afirmações deterministas. Gere meu Relatório Raio-X Inicial.");
  return lines.join("\n");
}

function downloadMarkdown() {
  const blob = new Blob([buildMarkdown(false)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `relatorio-raio-x-${(state.name || "inicial").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.md`; link.click(); URL.revokeObjectURL(url);
  toast("Relatório baixado");
}

async function copyForMadame() {
  try { await navigator.clipboard.writeText(buildMarkdown(true)); toast("Conteúdo copiado para a Madame Aline"); }
  catch { toast("Não foi possível copiar automaticamente"); }
}

function bindInputs() {
  document.querySelectorAll("[data-profile]").forEach(el => el.addEventListener("input", e => { state[e.target.dataset.profile] = e.target.value; saveState(); }));
  document.querySelectorAll("[data-answer]").forEach(el => el.addEventListener("input", e => { state.answers[e.target.dataset.answer] = e.target.value; saveState(); }));
  document.querySelectorAll("[data-step]").forEach(el => el.addEventListener("click", e => { state.step = Number(e.currentTarget.dataset.step); saveState(); render(); }));
  const file = document.getElementById("mapFile");
  if (file) file.addEventListener("change", e => { mapFile = e.target.files[0] || null; if (mapPreviewUrl) URL.revokeObjectURL(mapPreviewUrl); mapPreviewUrl = mapFile ? URL.createObjectURL(mapFile) : null; render(); });
}

document.addEventListener("click", e => {
  const button = e.target.closest("[data-action]"); if (!button) return;
  const action = button.dataset.action;
  if (action === "home") { state.screen = "home"; saveState(); render(); }
  if (action === "start") { state.screen = "journey"; state.step = Math.min(questions.findIndex(q => !answered(q)) === -1 ? 0 : questions.findIndex(q => !answered(q)), 8); saveState(); render(); }
  if (action === "prev") { if (state.step === 0) state.screen = "home"; else state.step--; saveState(); render(); }
  if (action === "next") { if (state.step === 8) state.screen = "summary"; else state.step++; saveState(); render(); }
  if (action === "summary") { state.screen = "summary"; saveState(); render(); }
  if (action === "edit") { state.screen = "journey"; saveState(); render(); }
  if (action === "download") downloadMarkdown();
  if (action === "copy") copyForMadame();
  if (action === "print") window.print();
  if (action === "reset" && confirm("Deseja apagar todas as respostas salvas neste navegador? Esta ação não pode ser desfeita.")) { localStorage.removeItem(STORAGE_KEY); state = { ...defaultState, answers: {} }; if (mapPreviewUrl) URL.revokeObjectURL(mapPreviewUrl); mapPreviewUrl = null; mapFile = null; render(); toast("Caderno apagado"); }
});

function toast(message) { const el = document.getElementById("toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2400); }

render();
