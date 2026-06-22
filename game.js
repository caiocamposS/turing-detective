// ===========================
//  TURING LABS — GAME ENGINE
// ===========================

// ---- STORYTELLING ----
const STORY_TEXT = `DATA: 14/06/2025  |  HORA: 03:47:22
ORIGEM: Laboratorio Turing Labs — Setor B
NÍVEL: CRÍTICO

RESUMO:
Um agente malicioso implantou o vírus V-NULL
nos sistemas de computação do laboratório.

Sete Máquinas de Turing foram comprometidas,
distribuídas em três setores do laboratório.
As tabelas de transição estão corrompidas.
As fitas não processam corretamente.

Sem intervenção imediata, os experimentos em
andamento serão perdidos permanentemente.

SOLICITAÇÃO:
O laboratório precisa de um técnico especializado
capaz de analisar, identificar e corrigir
as falhas nas máquinas infectadas.

Você foi selecionado(a) para esta missão.

Antes de ir a campo, um simulador de treinamento
está disponível para familiarização com o
equipamento.

Boa sorte, Agente.
> _`;

// ===========================
//  WORLDS
// ===========================
const WORLDS = [
  {
    id: 0,
    tier: 1,
    name: 'SETOR 1 — Diagnóstico Básico',
    desc: 'Falhas simples e isoladas. Um único campo da tabela foi corrompido em cada máquina.',
    intro: 'Falhas isoladas neste setor. Cada máquina tem exatamente um campo incorreto na tabela.',
  },
  {
    id: 1,
    tier: 2,
    name: 'SETOR 2 — Falhas Estruturais',
    desc: 'O vírus evoluiu. Algumas regras desapareceram e outras possuem mais de um defeito.',
    intro: 'Cuidado: neste setor algumas regras estão faltando por completo, e outras têm múltiplos campos corrompidos ao mesmo tempo.',
  },
  {
    id: 2,
    tier: 3,
    name: 'SETOR 3 — Núcleo do Vírus',
    desc: 'O núcleo do V-NULL. Uma máquina complexa com vários defeitos combinados.',
    intro: 'Este é o núcleo da infecção. A máquina possui múltiplas falhas combinadas — analise com calma.',
  },
];

// ===========================
//  CASES
//  Each transition row may have:
//    editable: [] -> normal correct row, fields are plain
//    editable: ['write','move',...] -> those fields are editable/corrupted text inputs
//    missing: true -> the entire row is missing; player must add it via "+ Adicionar Regra"
//  Each case has bugs: an array describing every defect to validate against.
//    { row, field, correct }  for a wrong-field bug
//    { missingRule: {state,read,write,move,next} } for a missing-rule bug
// ===========================
const CASES = [

  // =========================================================
  // WORLD 1 — basic, single isolated bug each (existing cases)
  // =========================================================
  {
    world: 0,
    id: 0,
    number: 'CASO #001',
    title: 'A Troca Silenciosa',
    desc: 'A máquina deveria copiar todos os <strong>1s</strong> da fita e substituir os <strong>0s</strong> por <strong>_</strong> (branco). Mas algo está errado no que ela escreve.',
    bugType: 'TRANSIÇÃO INCORRETA',
    difficulty: 1,
    input: ['1','0','1','1','_'],
    initialState: 'q0',
    hint: 'Observe o que a máquina escreve quando lê um 0 no estado q0. É isso mesmo que deveria acontecer?',
    buggedTransitions: [
      { state:'q0', read:'1', write:'1', move:'D', next:'q0', editable:[] },
      { state:'q0', read:'0', write:'0', move:'D', next:'q0', editable:['write'] },
      { state:'q0', read:'_', write:'_', move:'D', next:'qA', editable:[] },
    ],
    bugs: [
      { row: 1, field: 'write', correct: '_' },
    ],
  },

  {
    world: 0,
    id: 1,
    number: 'CASO #002',
    title: 'O Loop Infinito',
    desc: 'A máquina deveria percorrer a fita da esquerda para a direita marcando todos os símbolos. Mas ela parece ficar presa, andando para o lado errado.',
    bugType: 'DIREÇÃO CORROMPIDA',
    difficulty: 1,
    input: ['1','1','0','1','_'],
    initialState: 'q0',
    hint: 'Verifique a direção de movimento no estado q0 ao ler 0. A cabeça avança ou recua?',
    buggedTransitions: [
      { state:'q0', read:'1', write:'X', move:'D', next:'q0', editable:[] },
      { state:'q0', read:'0', write:'X', move:'E', next:'q0', editable:['move'] },
      { state:'q0', read:'_', write:'_', move:'D', next:'qA', editable:[] },
    ],
    bugs: [
      { row: 1, field: 'move', correct: 'D' },
    ],
  },

  {
    world: 0,
    id: 2,
    number: 'CASO #003',
    title: 'O Estado Fantasma',
    desc: 'Esta máquina deveria processar a fita em duas fases: primeiro marcando os <strong>1s</strong> (fase q0→q1), depois limpando os <strong>0s</strong> (fase q1). O estado de transição foi corrompido e ela nunca muda de fase.',
    bugType: 'ESTADO CORROMPIDO',
    difficulty: 2,
    input: ['1','0','1','_'],
    initialState: 'q0',
    hint: 'No estado q0, após ler um _ (branco), a máquina deve mudar para q1 e voltar para limpar os 0s. Verifique o próximo estado dessa transição.',
    buggedTransitions: [
      { state:'q0', read:'1', write:'X', move:'D', next:'q0', editable:[] },
      { state:'q0', read:'0', write:'0', move:'D', next:'q0', editable:[] },
      { state:'q0', read:'_', write:'_', move:'E', next:'q0', editable:['next'] },
      { state:'q1', read:'X', write:'X', move:'E', next:'q1', editable:[] },
      { state:'q1', read:'0', write:'_', move:'E', next:'q1', editable:[] },
      { state:'q1', read:'_', write:'_', move:'D', next:'qA', editable:[] },
    ],
    bugs: [
      { row: 2, field: 'next', correct: 'q1' },
    ],
  },

  // =========================================================
  // WORLD 2 — structural failures: missing rule + multi-bug
  // =========================================================
  {
    world: 1,
    id: 3,
    number: 'CASO #004',
    title: 'A Regra Desaparecida',
    desc: 'A máquina deveria substituir todo <strong>0</strong> por <strong>X</strong> e parar ao chegar num espaço em branco, ignorando os <strong>1s</strong> que encontrar pelo caminho. Ela trava no meio do caminho — parece que uma regra inteira foi apagada da tabela.',
    bugType: 'TRANSIÇÃO FALTANDO',
    difficulty: 1,
    input: ['0','0','1','0','_'],
    initialState: 'q0',
    hint: 'Execute passo a passo e observe em qual (estado, símbolo) a máquina rejeita por falta de regra. Você precisa ADICIONAR essa linha na tabela usando o botão "+ Adicionar Regra Faltante".',
    buggedTransitions: [
      { state:'q0', read:'0', write:'X', move:'D', next:'q0', editable:[] },
      // missing: { state:'q0', read:'1', write:'1', move:'D', next:'q0' }
      { state:'q0', read:'_', write:'_', move:'D', next:'qA', editable:[] },
    ],
    bugs: [
      { missingRule: { state:'q0', read:'1', write:'1', move:'D', next:'q0' } },
    ],
    allowAddRow: true,
  },

  {
    world: 1,
    id: 4,
    number: 'CASO #005',
    title: 'Dupla Falha',
    desc: 'A máquina deveria andar para a direita trocando <strong>a</strong> por <strong>b</strong> até encontrar um espaço em branco, e então aceitar. Duas coisas erradas ao mesmo tempo estão impedindo o funcionamento correto.',
    bugType: 'MÚLTIPLAS FALHAS (2)',
    difficulty: 2,
    input: ['a','a','a','_'],
    initialState: 'q0',
    hint: 'Há DOIS campos corrompidos nesta tabela, em linhas diferentes. Revise escrita, direção e próximo estado linha por linha.',
    buggedTransitions: [
      { state:'q0', read:'a', write:'a', move:'D', next:'q0', editable:['write'] },
      { state:'q0', read:'_', write:'_', move:'E', next:'qA', editable:['move'] },
    ],
    bugs: [
      { row: 0, field: 'write', correct: 'b' },
      { row: 1, field: 'move', correct: 'D' },
    ],
  },

  {
    world: 1,
    id: 5,
    number: 'CASO #006',
    title: 'A Máquina de Três Fases',
    desc: 'Esta máquina percorre a fita em três fases: marca os <strong>1s</strong> como <strong>X</strong> (q0), depois volta limpando os <strong>0s</strong> (q1), e por fim avança até o fim para aceitar (q2). Várias falhas foram introduzidas nas transições entre fases.',
    bugType: 'MÚLTIPLAS FALHAS (2) — MAIS ESTADOS',
    difficulty: 2,
    input: ['1','0','1','0','_'],
    initialState: 'q0',
    hint: 'Esta máquina tem 3 estados (q0, q1, q2). Acompanhe cada transição entre fases com cuidado — duas delas estão erradas.',
    buggedTransitions: [
      { state:'q0', read:'1', write:'X', move:'D', next:'q0', editable:[] },
      { state:'q0', read:'0', write:'0', move:'D', next:'q0', editable:[] },
      { state:'q0', read:'_', write:'_', move:'E', next:'q1', editable:[] },
      { state:'q1', read:'X', write:'X', move:'E', next:'q1', editable:[] },
      { state:'q1', read:'0', write:'_', move:'E', next:'q1', editable:[] },
      { state:'q1', read:'_', write:'_', move:'E', next:'q2', editable:['move'] },
      { state:'q2', read:'X', write:'X', move:'D', next:'q2', editable:[] },
      { state:'q2', read:'_', write:'_', move:'D', next:'qR', editable:['next'] },
    ],
    bugs: [
      { row: 5, field: 'move', correct: 'D' },
      { row: 7, field: 'next', correct: 'qA' },
    ],
  },

  // =========================================================
  // WORLD 3 — boss case: 3 combined bugs
  // Verified in Python (see design notes): machine checks if a binary
  // string is a simple palindrome by erasing matching symbols from
  // both ends and bouncing back and forth. Input "1001" must ACCEPT.
  // Bug rows (0-indexed in buggedTransitions array): 1, 9, 13.
  // =========================================================
  {
    world: 2,
    id: 6,
    number: 'CASO #007 — NÚCLEO',
    title: 'O Núcleo do V-NULL',
    desc: 'A máquina-núcleo do vírus verifica se a fita é um <strong>palíndromo</strong> de 0s e 1s: ela compara o primeiro e o último símbolo, apaga ambos se forem iguais, volta para o início e repete. Se a fita ficar vazia, aceita. Três falhas foram plantadas para impedir essa verificação.',
    bugType: 'MÚLTIPLAS FALHAS (3) — CASO FINAL',
    difficulty: 3,
    input: ['1','0','0','1'],
    initialState: 'q0',
    hint: 'Esta tabela tem 3 falhas combinadas, em estados diferentes (q0, q3 e q5). Rode passo a passo, observe onde o comportamento diverge do esperado (a fita "1001" é um palíndromo e deveria ser ACEITA), e revise os campos de escrita, direção e próximo estado.',
    buggedTransitions: [
      { state:'q0', read:'1', write:'_', move:'D', next:'q1', editable:[] },
      { state:'q0', read:'0', write:'_', move:'E', next:'q2', editable:['move'] },   // BUG 1: move should be D
      { state:'q0', read:'_', write:'_', move:'D', next:'qA', editable:[] },

      { state:'q1', read:'0', write:'0', move:'D', next:'q1', editable:[] },
      { state:'q1', read:'1', write:'1', move:'D', next:'q1', editable:[] },
      { state:'q1', read:'_', write:'_', move:'E', next:'q3', editable:[] },

      { state:'q2', read:'0', write:'0', move:'D', next:'q2', editable:[] },
      { state:'q2', read:'1', write:'1', move:'D', next:'q2', editable:[] },
      { state:'q2', read:'_', write:'_', move:'E', next:'q4', editable:[] },

      { state:'q3', read:'1', write:'1', move:'E', next:'q5', editable:['write'] },  // BUG 2: write should be _
      { state:'q4', read:'0', write:'_', move:'E', next:'q5', editable:[] },

      { state:'q5', read:'0', write:'0', move:'E', next:'q5', editable:[] },
      { state:'q5', read:'1', write:'1', move:'E', next:'q5', editable:[] },
      { state:'q5', read:'_', write:'_', move:'D', next:'qR', editable:['next'] },   // BUG 3: next should be q0
    ],
    bugs: [
      { row: 1, field: 'move', correct: 'D' },
      { row: 9, field: 'write', correct: '_' },
      { row: 13, field: 'next', correct: 'q0' },
    ],
  },
];

// ===========================
//  TUTORIAL (guided, interactive, popup-based)
// ===========================
// A fixed simple training machine: turns every '1' into 'X' moving right, accepts on blank.
const TUTORIAL_MACHINE = {
  input: ['1','0','1','_'],
  initialState: 'q0',
  transitions: [
    { state:'q0', read:'1', write:'X', move:'D', next:'q0' },
    { state:'q0', read:'0', write:'0', move:'D', next:'q0' },
    { state:'q0', read:'_', write:'_', move:'D', next:'qA' },
  ],
};

// Each tutorial step: target element to spotlight, title, body, and optional required action.
// action: 'step' -> player must click tut-btn-step to unlock "next".
//         'run'  -> player must click tut-btn-run.
//         null   -> informational only, "next" always enabled.
const TUTORIAL_STEPS = [
  {
    target: '#tut-tape-box',
    title: 'A Fita',
    body: 'Esta é a <code>fita</code>: uma sequência de células com símbolos. A máquina lê e escreve aqui. O símbolo <code>_</code> representa uma célula vazia (branco). Esta fita é <strong>infinita</strong> nos dois sentidos.',
    action: null,
  },
  {
    target: '.tape-cell.head',
    title: 'A Cabeça Leitora',
    body: 'A célula destacada em verde é onde está a <code>cabeça leitora</code> agora. A cada passo, ela lê o símbolo dessa célula, decide o que fazer, e então se move.',
    action: null,
    isTapeHead: true,
  },
  {
    target: '#tut-status-box',
    title: 'O Estado Atual',
    body: 'A máquina está sempre em um <code>estado</code> (aqui: <code>q0</code>). O comportamento dela depende da combinação <strong>estado + símbolo lido</strong>. Existem estados especiais: <code>qA</code> (aceita) e <code>qR</code> (rejeita).',
    action: null,
  },
  {
    target: '#tut-table-box',
    title: 'A Tabela de Transições',
    body: 'Aqui estão as <code>regras</code> da máquina. Cada linha diz: "se eu estiver no estado X e ler o símbolo Y → escrevo Z, me movo para M, e vou para o estado N". Veja a primeira linha: no estado <code>q0</code> lendo <code>1</code>, ela escreve <code>X</code>, move <code>D</code> (direita) e continua em <code>q0</code>.',
    action: null,
  },
  {
    target: '#tut-btn-step',
    title: 'Dê um Passo',
    body: 'Vamos testar na prática. O botão <code>PASSO</code> executa <strong>uma única transição</strong> por vez — ótimo para investigar com calma.',
    action: 'step',
    actionHint: '👉 Clique em PASSO para continuar.',
  },
  {
    target: '#tut-log-box',
    title: 'O Log de Execução',
    body: 'Toda transição executada aparece aqui no <code>log</code>. Ele mostra exatamente qual regra foi usada — essencial para diagnosticar uma máquina com falha.',
    action: null,
  },
  {
    target: '#tut-btn-run',
    title: 'Execução Automática',
    body: 'O botão <code>EXECUTAR</code> roda a máquina automaticamente, passo a passo, até ela aceitar, rejeitar, ou entrar em loop. Vamos rodar o resto desta máquina de treino até o fim.',
    action: 'run',
    actionHint: '👉 Clique em EXECUTAR para ver a máquina terminar.',
  },
  {
    target: '#tut-status-box',
    title: 'Resultado Final',
    body: 'Quando a máquina chega ao estado <code>qA</code>, ela <strong>aceita</strong> a entrada — missão cumprida. Se chegar a <code>qR</code>, ou se não houver regra para o estado/símbolo atual, ela <strong>rejeita</strong>.',
    action: null,
  },
  {
    target: '#tut-table-box',
    title: 'Sua Missão Real',
    body: 'Nos casos reais, a tabela de transições estará <strong>corrompida</strong> pelo vírus V-NULL. Os campos editáveis aparecem em <span style="color:var(--amber)">âmbar</span>. Você vai executar a máquina, observar o erro, descobrir qual campo (ou quais campos) estão errados, corrigir, e submeter.',
    action: null,
  },
  {
    target: null,
    title: 'Pronto para Investigar',
    body: 'Você concluiu o treinamento básico. Os setores do laboratório têm dificuldade crescente: o Setor 1 tem falhas simples, o Setor 2 introduz <strong>regras faltando</strong> e <strong>múltiplas falhas combinadas</strong>, e o Setor 3 é o núcleo do vírus. Boa sorte, Agente.',
    action: null,
    isFinal: true,
  },
];

// ===========================
//  GAME STATE
// ===========================
let solvedCases = new Set();
let currentCase = null;
let currentWorldId = null;

// Machine runtime state (real game)
let tape = [];
let headPos = 0;
let machineState = '';
let stepCount = 0;
let running = false;
let runInterval = null;
let written = new Set();
let editableTransitions = [];

// Tutorial-specific runtime (kept isolated from real game state)
let tutTape = [];
let tutHeadPos = 0;
let tutState = '';
let tutStepCount = 0;
let tutRunning = false;
let tutRunInterval = null;
let tutWritten = new Set();
let tutorialStepIndex = 0;
let tutorialActionSatisfied = false;

// ===========================
//  SCREEN MANAGEMENT
// ===========================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===========================
//  INTRO / STORYTELLING
// ===========================
function runStoryTyping() {
  const el = document.getElementById('story-text');
  el.innerHTML = '';
  let i = 0;
  const chars = STORY_TEXT.split('');
  const cursor = document.createElement('span');
  cursor.className = 'cursor-blink';
  cursor.textContent = '_';

  function typeNext() {
    if (i < chars.length) {
      el.insertBefore(document.createTextNode(chars[i]), cursor);
      i++;
      const delay = chars[i-1] === '\n' ? 60 : (chars[i-1] === '.' ? 200 : 18);
      setTimeout(typeNext, delay);
    } else {
      setTimeout(() => {
        document.getElementById('btn-start-mission').style.display = 'inline-block';
      }, 400);
    }
  }
  el.appendChild(cursor);
  setTimeout(typeNext, 600);
}

document.getElementById('btn-start-mission').addEventListener('click', () => {
  showScreen('screen-tutorial');
  startGuidedTutorial();
});

// ===========================
//  GUIDED INTERACTIVE TUTORIAL
// ===========================
function startGuidedTutorial() {
  tutTape = [...TUTORIAL_MACHINE.input, '_', '_'];
  tutHeadPos = 0;
  tutState = TUTORIAL_MACHINE.initialState;
  tutStepCount = 0;
  tutWritten = new Set();
  tutRunning = false;
  clearInterval(tutRunInterval);

  document.getElementById('tut-execution-log').innerHTML = '<span class="log-hint">[ Execute a máquina para ver o log ]</span>';
  document.getElementById('btn-tutorial-done').style.display = 'none';
  document.getElementById('tut-btn-run').textContent = '▶▶ EXECUTAR';

  renderTutTransitionTable();
  renderTutTape();
  updateTutStatusDisplay();
  highlightTutCurrentRow();

  tutorialStepIndex = 0;
  document.getElementById('tutorial-overlay').classList.add('dimmed');
  showTutorialStep(0);
}

function showTutorialStep(idx) {
  tutorialStepIndex = idx;
  const step = TUTORIAL_STEPS[idx];
  tutorialActionSatisfied = step.action === null;

  const popup = document.getElementById('tutorial-popup');
  const spotlight = document.getElementById('tutorial-spotlight');

  document.getElementById('tp-step-tag').textContent = `PASSO ${idx+1}/${TUTORIAL_STEPS.length}`;
  document.getElementById('tp-title').textContent = step.title;
  document.getElementById('tp-body').innerHTML = step.body;

  const actionHintEl = document.getElementById('tp-action-hint');
  if (step.actionHint) {
    actionHintEl.style.display = 'block';
    actionHintEl.textContent = step.actionHint;
  } else {
    actionHintEl.style.display = 'none';
  }

  const nextBtn = document.getElementById('tp-next');
  nextBtn.textContent = step.isFinal ? 'COMEÇAR INVESTIGAÇÃO »' : 'PRÓXIMO »';
  nextBtn.disabled = !tutorialActionSatisfied;

  document.querySelectorAll('.tutorial-target-pulse').forEach(el => el.classList.remove('tutorial-target-pulse'));

  let targetEl = null;
  if (step.isTapeHead) {
    targetEl = document.querySelector('#tut-tape-display .tape-cell.head');
  } else if (step.target) {
    targetEl = document.querySelector(step.target);
  }

  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    spotlight.style.left = (rect.left - 8) + 'px';
    spotlight.style.top = (rect.top - 8) + 'px';
    spotlight.style.width = (rect.width + 16) + 'px';
    spotlight.style.height = (rect.height + 16) + 'px';
    spotlight.classList.add('visible');
    if (step.action) targetEl.classList.add('tutorial-target-pulse');

    positionPopupNear(rect);
  } else {
    spotlight.classList.remove('visible');
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
  }
}

function positionPopupNear(rect) {
  const popup = document.getElementById('tutorial-popup');
  popup.style.transform = 'none';
  const margin = 20;
  const popupWidth = 340;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left, top;

  if (rect.right + margin + popupWidth < vw) {
    left = rect.right + margin;
    top = Math.max(margin, Math.min(rect.top, vh - 280));
  } else if (rect.left - margin - popupWidth > 0) {
    left = rect.left - margin - popupWidth;
    top = Math.max(margin, Math.min(rect.top, vh - 280));
  } else {
    left = Math.max(margin, Math.min(rect.left, vw - popupWidth - margin));
    if (rect.bottom + 260 < vh) {
      top = rect.bottom + margin;
    } else {
      top = Math.max(margin, rect.top - 260 - margin);
    }
  }

  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
}

document.getElementById('tp-next').addEventListener('click', () => {
  const step = TUTORIAL_STEPS[tutorialStepIndex];
  if (step.isFinal) {
    finishGuidedTutorial();
    return;
  }
  if (tutorialStepIndex < TUTORIAL_STEPS.length - 1) {
    showTutorialStep(tutorialStepIndex + 1);
  }
});

document.getElementById('tp-skip').addEventListener('click', () => {
  finishGuidedTutorial();
});

function finishGuidedTutorial() {
  document.getElementById('tutorial-overlay').classList.remove('dimmed');
  document.getElementById('tutorial-spotlight').classList.remove('visible');
  document.querySelectorAll('.tutorial-target-pulse').forEach(el => el.classList.remove('tutorial-target-pulse'));
  clearInterval(tutRunInterval);
  showScreen('screen-worlds');
  renderWorlds();
}

function satisfyTutorialAction(actionType) {
  const step = TUTORIAL_STEPS[tutorialStepIndex];
  if (step && step.action === actionType) {
    tutorialActionSatisfied = true;
    document.getElementById('tp-next').disabled = false;
  }
}

// ----- Tutorial machine step/run logic (mirrors the real engine but isolated) -----
function tutStep() {
  if (tutState === 'qA' || tutState === 'qR') return false;
  const sym = tutTape[tutHeadPos] || '_';
  const rule = TUTORIAL_MACHINE.transitions.find(t => t.state === tutState && t.read === sym);

  if (!rule) {
    addTutLog(`<span class="le">✗ Sem regra para (${tutState}, '${sym}') → REJEIÇÃO</span>`);
    tutState = 'qR';
    updateTutStatusDisplay();
    renderTutTape();
    return false;
  }

  addTutLog(`<span class="ls">(${tutState}, '${sym}')</span> → escreve <span class="lw">'${rule.write}'</span>, move <strong>${rule.move}</strong>, vai para <span class="ls">${rule.next}</span>`);

  if (rule.write !== sym) tutWritten.add(tutHeadPos);
  tutTape[tutHeadPos] = rule.write;
  tutHeadPos += rule.move === 'D' ? 1 : -1;

  if (tutHeadPos < 0) { tutTape.unshift('_'); tutHeadPos = 0; }
  if (tutHeadPos >= tutTape.length) tutTape.push('_');

  tutState = rule.next;
  tutStepCount++;

  updateTutStatusDisplay();
  renderTutTape();
  highlightTutCurrentRow();

  if (tutStepCount > 100) { addTutLog(`<span class="le">⚠ Limite de passos atingido.</span>`); stopTutRun(); return false; }
  if (tutState === 'qA') { addTutLog(`<span class="la">✓ ACEITO — Máquina encerrou com sucesso!</span>`); return false; }
  if (tutState === 'qR') { addTutLog(`<span class="le">✗ REJEITADO.</span>`); return false; }
  return true;
}

function addTutLog(html) {
  const log = document.getElementById('tut-execution-log');
  if (log.querySelector('.log-hint')) log.innerHTML = '';
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span style="color:var(--grey)">[${String(tutStepCount).padStart(3,'0')}]</span> ${html}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

document.getElementById('tut-btn-step').addEventListener('click', () => {
  if (tutState === 'qA' || tutState === 'qR') return;
  tutStep();
  satisfyTutorialAction('step');
});

document.getElementById('tut-btn-run').addEventListener('click', () => {
  if (tutRunning) { stopTutRun(); return; }
  if (tutState === 'qA' || tutState === 'qR') return;
  tutRunning = true;
  document.getElementById('tut-btn-run').textContent = '■ PARAR';
  satisfyTutorialAction('run');
  tutRunInterval = setInterval(() => {
    const cont = tutStep();
    if (!cont) stopTutRun();
  }, 350);
});

document.getElementById('tut-btn-reset').addEventListener('click', () => {
  startGuidedTutorial();
});

function stopTutRun() {
  tutRunning = false;
  clearInterval(tutRunInterval);
  document.getElementById('tut-btn-run').textContent = '▶▶ EXECUTAR';
}

function renderTutTape() {
  const track = document.getElementById('tut-tape-display');
  track.innerHTML = '';
  tutTape.forEach((sym, i) => {
    const cell = document.createElement('div');
    let cls = 'tape-cell';
    if (i === tutHeadPos) cls += ' head';
    else if (tutWritten.has(i)) cls += ' written';
    else if (sym === '_') cls += ' blank';
    cell.className = cls;
    cell.textContent = sym;
    track.appendChild(cell);
  });
}

function updateTutStatusDisplay() {
  document.getElementById('tut-status-state').textContent = tutState;
  document.getElementById('tut-status-pos').textContent = tutHeadPos;
  document.getElementById('tut-status-symbol').textContent = tutTape[tutHeadPos] || '_';
  const resultEl = document.getElementById('tut-status-result');
  if (tutState === 'qA') { resultEl.textContent = 'ACEITO ✓'; resultEl.className = 'status-value accept'; }
  else if (tutState === 'qR') { resultEl.textContent = 'REJEITADO ✗'; resultEl.className = 'status-value reject'; }
  else { resultEl.textContent = 'Rodando…'; resultEl.className = 'status-value running'; }
}

function renderTutTransitionTable() {
  const tbody = document.getElementById('tut-transition-body');
  tbody.innerHTML = '';
  TUTORIAL_MACHINE.transitions.forEach(t => {
    const tr = document.createElement('tr');
    ['state','read','write','move','next'].forEach(f => {
      const td = document.createElement('td');
      td.textContent = (f === 'read' && t[f] === '_') ? '_ (branco)' : t[f];
      if (f === 'state') td.style.color = 'var(--green-dim)';
      if (f === 'next' && (t[f] === 'qA' || t[f] === 'qR')) td.style.color = t[f]==='qA' ? 'var(--green)' : 'var(--red)';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function highlightTutCurrentRow() {
  const rows = document.querySelectorAll('#tut-transition-body tr');
  rows.forEach(r => r.classList.remove('current-row'));
  if (tutState === 'qA' || tutState === 'qR') return;
  const sym = tutTape[tutHeadPos] || '_';
  const idx = TUTORIAL_MACHINE.transitions.findIndex(t => t.state === tutState && t.read === sym);
  if (idx >= 0 && rows[idx]) rows[idx].classList.add('current-row');
}

// ===========================
//  WORLDS MAP
// ===========================
function casesForWorld(worldId) {
  return CASES.filter(c => c.world === worldId);
}

function renderWorlds() {
  const grid = document.getElementById('worlds-grid');
  grid.innerHTML = '';
  const totalSolved = solvedCases.size;
  document.getElementById('worlds-score').textContent = `PROGRESSO GERAL: ${totalSolved}/${CASES.length}`;

  WORLDS.forEach((w, idx) => {
    const casesInWorld = casesForWorld(w.id);
    const solvedInWorld = casesInWorld.filter(c => solvedCases.has(c.id)).length;
    const prevWorldDone = idx === 0 || casesForWorld(WORLDS[idx-1].id).every(c => solvedCases.has(c.id));
    const locked = !prevWorldDone;

    const card = document.createElement('div');
    card.className = 'world-card' + (locked ? ' locked' : '');
    card.dataset.tier = w.tier;
    const pct = Math.round((solvedInWorld / casesInWorld.length) * 100);

    card.innerHTML = `
      ${locked ? '<div class="wc-lock-icon">🔒</div>' : ''}
      <div class="wc-tier">${locked ? 'BLOQUEADO' : 'TIER ' + w.tier}</div>
      <div class="wc-title">${w.name}</div>
      <div class="wc-desc">${locked ? 'Resolva todos os casos do setor anterior para desbloquear.' : w.desc}</div>
      <div class="wc-progress">
        <span>${solvedInWorld}/${casesInWorld.length}</span>
        <div class="wc-progress-bar"><div class="wc-progress-fill" style="width:${pct}%"></div></div>
      </div>
    `;
    if (!locked) {
      card.addEventListener('click', () => {
        currentWorldId = w.id;
        renderCases();
        document.getElementById('cases-phase-label').textContent = `// ${w.name}`;
        document.getElementById('cases-intro-text').innerHTML = `<p>${w.intro}</p>`;
        showScreen('screen-cases');
      });
    }
    grid.appendChild(card);
  });
}

document.getElementById('btn-back-worlds').addEventListener('click', () => {
  showScreen('screen-worlds');
  renderWorlds();
});

// ===========================
//  CASES MAP (within a world)
// ===========================
function renderCases() {
  const grid = document.getElementById('cases-grid');
  grid.innerHTML = '';
  const casesInWorld = casesForWorld(currentWorldId);
  const solvedHere = casesInWorld.filter(c => solvedCases.has(c.id)).length;
  document.getElementById('cases-score').textContent = `CASOS RESOLVIDOS: ${solvedHere}/${casesInWorld.length}`;

  casesInWorld.forEach(c => {
    const solved = solvedCases.has(c.id);
    const card = document.createElement('div');
    card.className = 'case-card' + (solved ? ' solved' : '');
    card.innerHTML = `
      <div class="cc-number">${c.number}</div>
      <div class="cc-title">${c.title}</div>
      <div class="cc-desc">${c.desc.replace(/<[^>]+>/g,'').substring(0,80)}...</div>
      <div class="cc-difficulty">
        DIFICULDADE: ${[1,2,3].map(n=>`<span class="dot${n<=c.difficulty?' active-dot':''}"></span>`).join('')}
      </div>
      ${solved ? '<div class="cc-solved-tag">✓ RESOLVIDO</div>' : ''}
    `;
    if (!solved) {
      card.addEventListener('click', () => startCase(c));
    }
    grid.appendChild(card);
  });
}

// ===========================
//  START A CASE
// ===========================
function startCase(c) {
  currentCase = c;
  stopRun();

  editableTransitions = c.buggedTransitions.map(t => ({ ...t }));

  document.getElementById('game-phase-label').textContent = `// ${c.number}`;
  document.getElementById('case-briefing').innerHTML = `
    <p>${c.desc}</p>
    <span class="bug-type">⚠ FALHA: ${c.bugType}</span>
  `;
  document.getElementById('transition-hint').textContent = c.hint;

  resetMachine();
  renderTransitionTable();
  showScreen('screen-game');
}

document.getElementById('btn-back-cases').addEventListener('click', () => {
  stopRun();
  renderCases();
  showScreen('screen-cases');
});

// ===========================
//  MACHINE RESET (real game)
// ===========================
function resetMachine() {
  stopRun();
  tape = [...currentCase.input, '_', '_', '_'];
  headPos = 0;
  machineState = currentCase.initialState;
  stepCount = 0;
  written = new Set();
  document.getElementById('execution-log').innerHTML = '<span class="log-hint">[ Execute a máquina para ver o log ]</span>';
  updateStatusDisplay();
  renderTape();
  highlightCurrentRow();
}

// ===========================
//  TAPE RENDERING
// ===========================
function renderTape() {
  const track = document.getElementById('tape-display');
  track.innerHTML = '';
  tape.forEach((sym, i) => {
    const cell = document.createElement('div');
    let cls = 'tape-cell';
    if (i === headPos) cls += ' head';
    else if (written.has(i)) cls += ' written';
    else if (sym === '_') cls += ' blank';
    cell.className = cls;
    cell.textContent = sym;
    track.appendChild(cell);
  });
}

// ===========================
//  STATUS DISPLAY
// ===========================
function updateStatusDisplay() {
  document.getElementById('status-state').textContent = machineState;
  document.getElementById('status-pos').textContent = headPos;
  document.getElementById('status-symbol').textContent = tape[headPos] || '_';
  const resultEl = document.getElementById('status-result');
  if (machineState === 'qA') {
    resultEl.textContent = 'ACEITO ✓';
    resultEl.className = 'status-value accept';
  } else if (machineState === 'qR') {
    resultEl.textContent = 'REJEITADO ✗';
    resultEl.className = 'status-value reject';
  } else {
    resultEl.textContent = 'Rodando…';
    resultEl.className = 'status-value running';
  }
}

// ===========================
//  ONE STEP (real game) — missing rows are ignored as rules until filled
// ===========================
function step() {
  if (machineState === 'qA' || machineState === 'qR') return false;

  const sym = tape[headPos] || '_';
  const rule = editableTransitions.find(t => t.state === machineState && t.read === sym);

  if (!rule) {
    addLog(`<span class="le">✗ Sem regra para (${machineState}, '${sym}') → REJEIÇÃO</span>`);
    machineState = 'qR';
    updateStatusDisplay();
    renderTape();
    return false;
  }

  const oldState = machineState;
  addLog(`<span class="ls">(${oldState}, '${sym}')</span> → escreve <span class="lw">'${rule.write}'</span>, move <strong>${rule.move}</strong>, vai para <span class="ls">${rule.next}</span>`);

  if (rule.write !== sym) written.add(headPos);
  tape[headPos] = rule.write;
  headPos += rule.move === 'D' ? 1 : -1;

  if (headPos < 0) { tape.unshift('_'); headPos = 0; }
  if (headPos >= tape.length) tape.push('_');

  machineState = rule.next;
  stepCount++;

  updateStatusDisplay();
  renderTape();
  highlightCurrentRow();

  if (stepCount > 150) {
    addLog(`<span class="le">⚠ Limite de passos atingido — possível loop infinito!</span>`);
    stopRun();
    return false;
  }

  if (machineState === 'qA') {
    addLog(`<span class="la">✓ ACEITO — Máquina encerrou com sucesso!</span>`);
    return false;
  }
  if (machineState === 'qR') {
    addLog(`<span class="le">✗ REJEITADO — Máquina encerrou com rejeição.</span>`);
    return false;
  }
  return true;
}

function addLog(html) {
  const log = document.getElementById('execution-log');
  if (log.querySelector('.log-hint')) log.innerHTML = '';
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span style="color:var(--grey)">[${String(stepCount).padStart(3,'0')}]</span> ${html}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ===========================
//  RUN / STOP / STEP BUTTONS (real game)
// ===========================
document.getElementById('btn-step').addEventListener('click', () => {
  if (machineState === 'qA' || machineState === 'qR') return;
  step();
});

document.getElementById('btn-run').addEventListener('click', () => {
  if (running) { stopRun(); return; }
  if (machineState === 'qA' || machineState === 'qR') return;
  running = true;
  document.getElementById('btn-run').textContent = '■ PARAR';
  runInterval = setInterval(() => {
    const cont = step();
    if (!cont) stopRun();
  }, 350);
});

document.getElementById('btn-reset').addEventListener('click', resetMachine);

function stopRun() {
  running = false;
  clearInterval(runInterval);
  document.getElementById('btn-run').textContent = '▶▶ EXECUTAR';
}

// ===========================
//  TRANSITION TABLE RENDER (real game) — supports editable fields + missing rows
// ===========================
function renderTransitionTable() {
  const tbody = document.getElementById('transition-body');
  tbody.innerHTML = '';

  editableTransitions.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.dataset.index = i;
    if (t.missing) tr.classList.add('missing-row');

    const fields = ['state','read','write','move','next'];
    fields.forEach(f => {
      const td = document.createElement('td');

      if (t.missing) {
        if (f === 'move') {
          const sel = document.createElement('select');
          sel.className = 'cell-edit';
          sel.dataset.row = i;
          sel.dataset.field = f;
          const blankOpt = document.createElement('option');
          blankOpt.value = ''; blankOpt.textContent = '?';
          sel.appendChild(blankOpt);
          ['D','E'].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt; o.textContent = opt;
            if (t[f] === opt) o.selected = true;
            sel.appendChild(o);
          });
          sel.addEventListener('change', e => {
            editableTransitions[+e.target.dataset.row][e.target.dataset.field] = e.target.value;
          });
          td.appendChild(sel);
        } else {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'cell-edit corrupted empty-required';
          inp.value = t[f] || '';
          inp.placeholder = '?';
          inp.maxLength = 4;
          inp.dataset.row = i;
          inp.dataset.field = f;
          inp.addEventListener('input', e => {
            editableTransitions[+e.target.dataset.row][e.target.dataset.field] = e.target.value.trim();
          });
          td.appendChild(inp);
        }
      } else if (t.editable && t.editable.includes(f)) {
        if (f === 'move') {
          const sel = document.createElement('select');
          sel.className = 'cell-edit';
          sel.dataset.row = i;
          sel.dataset.field = f;
          ['D','E'].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt; o.textContent = opt;
            if (t[f] === opt) o.selected = true;
            sel.appendChild(o);
          });
          sel.addEventListener('change', e => {
            editableTransitions[+e.target.dataset.row][e.target.dataset.field] = e.target.value;
          });
          td.appendChild(sel);
        } else {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'cell-edit corrupted';
          inp.value = t[f];
          inp.maxLength = 4;
          inp.dataset.row = i;
          inp.dataset.field = f;
          inp.addEventListener('input', e => {
            editableTransitions[+e.target.dataset.row][e.target.dataset.field] = e.target.value.trim();
            e.target.classList.remove('corrupted');
          });
          td.appendChild(inp);
        }
      } else {
        td.textContent = f === 'read' && t[f] === '_' ? '_ (branco)' : (t[f] || '');
        if (f === 'state') td.style.color = 'var(--green-dim)';
        if (f === 'next' && (t[f] === 'qA' || t[f] === 'qR')) td.style.color = t[f]==='qA'?'var(--green)':'var(--red)';
      }
      tr.appendChild(td);
    });

    if (t.missing) {
      const tag = document.createElement('span');
      tag.className = 'missing-tag';
      tag.textContent = '⚠ REGRA FALTANDO — PREENCHA';
      tr.lastChild.appendChild(tag);
    }

    tbody.appendChild(tr);
  });

  const wrapper = document.querySelector('#transition-table').parentElement;
  let addBtn = document.getElementById('btn-add-row');
  if (addBtn) addBtn.remove();
  if (currentCase && currentCase.allowAddRow) {
    addBtn = document.createElement('button');
    addBtn.id = 'btn-add-row';
    addBtn.className = 'btn-add-row';
    addBtn.textContent = '+ ADICIONAR REGRA FALTANTE';
    addBtn.addEventListener('click', () => {
      editableTransitions.push({ state:'', read:'', write:'', move:'D', next:'', missing:true });
      renderTransitionTable();
    });
    wrapper.appendChild(addBtn);
  }
}

function highlightCurrentRow() {
  const rows = document.querySelectorAll('#transition-body tr');
  rows.forEach(r => r.classList.remove('current-row'));
  if (machineState === 'qA' || machineState === 'qR') return;
  const sym = tape[headPos] || '_';
  const idx = editableTransitions.findIndex(t => t.state === machineState && t.read === sym);
  if (idx >= 0 && rows[idx]) rows[idx].classList.add('current-row');
}

// ===========================
//  SUBMIT / VALIDATE (supports multiple bugs + missing-rule bugs)
// ===========================
document.getElementById('btn-submit').addEventListener('click', validateFix);

function transitionsMatch(a, b) {
  return a.state === b.state && a.read === b.read && a.write === b.write && a.move === b.move && a.next === b.next;
}

function validateFix() {
  const c = currentCase;
  const problems = [];

  c.bugs.forEach(bug => {
    if (bug.missingRule) {
      const found = editableTransitions.some(t => transitionsMatch(t, bug.missingRule));
      if (!found) problems.push(`Falta adicionar a regra correta para o estado/símbolo indicado pela rejeição no log.`);
    } else {
      const submitted = (editableTransitions[bug.row][bug.field] || '').trim();
      if (submitted !== bug.correct) {
        problems.push(`Linha ${bug.row + 1}, campo <strong>${bug.field.toUpperCase()}</strong> ainda está incorreto.`);
      }
    }
  });

  if (problems.length === 0) {
    solvedCases.add(c.id);
    showModal(true, '✓', 'MÁQUINA RESTAURADA!',
      `Excelente trabalho, Agente!\n\nTodas as falhas desta máquina foram corrigidas com sucesso. O setor está mais seguro.`,
      () => {
        renderCases();
        showScreen('screen-cases');
        const casesInWorld = casesForWorld(currentWorldId);
        const allWorldDone = casesInWorld.every(cc => solvedCases.has(cc.id));
        if (allWorldDone) {
          setTimeout(() => {
            if (solvedCases.size === CASES.length) {
              showScreen('screen-victory');
            } else {
              renderWorlds();
              showScreen('screen-worlds');
            }
          }, 600);
        }
      }
    );
  } else {
    showModal(false, '✗', 'CORREÇÃO INCOMPLETA',
      `A máquina ainda não está funcionando corretamente. Foram encontrados ${problems.length} problema(s):\n\n` +
      problems.map(p => `• ${p}`).join('\n') +
      `\n\n<em>Dica: ${c.hint}</em>`,
      () => {}
    );
  }
}

// ===========================
//  MODAL
// ===========================
function showModal(success, icon, title, body, onClose) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  overlay.classList.remove('hidden');
  box.className = 'modal-box' + (success ? '' : ' error');
  document.getElementById('modal-icon').textContent = icon;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body.replace(/\n/g,'<br>');

  const btn = document.getElementById('modal-btn');
  btn.onclick = () => {
    overlay.classList.add('hidden');
    onClose();
  };
}

// ===========================
//  VICTORY / RESTART
// ===========================
document.getElementById('btn-restart').addEventListener('click', () => {
  solvedCases.clear();
  currentWorldId = null;
  showScreen('screen-intro');
  runStoryTyping();
});

// ===========================
//  BOOT
// ===========================
window.addEventListener('load', () => {
  showScreen('screen-intro');
  runStoryTyping();
});

// Reposition tutorial popup/spotlight on resize (basic responsiveness)
window.addEventListener('resize', () => {
  if (document.getElementById('screen-tutorial').classList.contains('active') &&
      document.getElementById('tutorial-overlay').classList.contains('dimmed')) {
    showTutorialStep(tutorialStepIndex);
  }
});
