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

Três Máquinas de Turing foram comprometidas.
As tabelas de transição estão corrompidas.
As fitas não processam corretamente.

Sem intervenção imediata, os experimentos em
andamento serão perdidos permanentemente.

SOLICITAÇÃO:
O laboratório precisa de um técnico especializado
capaz de analisar, identificar e corrigir
as falhas nas máquinas infectadas.

Você foi selecionado(a) para esta missão.

Boa sorte, Agente.
> _`;

// ---- TUTORIAL CONTENT ----
const TUTORIAL_STEPS = [
  {
    title: "A Fita",
    body: "Uma Máquina de Turing lê e escreve em uma <code>fita</code> — uma sequência de células, cada uma com um símbolo. Usamos <code>_</code> para representar células vazias (branco).",
    demo: ["_", "1", "0", "1", "_", "_"],
    active: 1,
  },
  {
    title: "A Cabeça Leitora",
    body: "A máquina tem uma <code>cabeça leitora</code> que aponta para uma célula da fita. A cada passo ela lê o símbolo atual, escreve um novo e se move para <code>Esquerda (E)</code> ou <code>Direita (D)</code>.",
    demo: ["_", "1", "0", "1", "_", "_"],
    active: 2,
  },
  {
    title: "Estados",
    body: "A máquina está sempre em um <code>estado</code> (ex: <code>q0</code>, <code>q1</code>). O estado muda conforme as regras da tabela de transições. Existem estados especiais: <code>qA</code> (aceitação) e <code>qR</code> (rejeição).",
    demo: null,
  },
  {
    title: "Tabela de Transições",
    body: 'As <code>regras</code> da máquina ficam na tabela de transições. Cada linha diz: "Se estou no estado X e leio o símbolo Y → escrevo Z, movo para M e vou para o estado N". O vírus <strong>corrompeu</strong> algumas dessas regras!',
    demo: null,
  },
  {
    title: "Sua Missão",
    body: "Para cada caso você vai <code>executar</code> a máquina, <code>observar</code> o comportamento incorreto, <code>identificar</code> a regra com falha e <code>corrigir</code> os campos editáveis (em âmbar) na tabela.",
    demo: null,
  },
];

// ---- CASES ----
// Each case has: a description, input tape, correct transitions, the bugged transitions,
// and info about what's wrong.
const CASES = [
  // CASE 0: Simple — one wrong write value
  {
    id: 0,
    number: "CASO #001",
    title: "A Troca Silenciosa",
    desc: "A máquina deveria copiar todos os <strong>1s</strong> da fita e substituir os <strong>0s</strong> por <strong>_</strong> (branco). Mas algo está errado no que ela escreve.",
    bugType: "TRANSIÇÃO INCORRETA",
    difficulty: 1,
    input: ["1", "0", "1", "1", "_"],
    initialState: "q0",
    expectedOutput: ["1", "_", "1", "1", "_"],
    expectedFinalState: "qA",
    hint: "Observe o que a máquina escreve quando lê um 0 no estado q0. É isso mesmo que deveria acontecer?",
    // Full correct transitions
    correctTransitions: [
      { state: "q0", read: "1", write: "1", move: "D", next: "q0" },
      { state: "q0", read: "0", write: "_", move: "D", next: "q0" },
      { state: "q0", read: "_", write: "_", move: "D", next: "qA" },
    ],
    // Bugged version — write field of row 1 (reading 0) is wrong
    buggedTransitions: [
      {
        state: "q0",
        read: "1",
        write: "1",
        move: "D",
        next: "q0",
        editable: [],
      },
      {
        state: "q0",
        read: "0",
        write: "0",
        move: "D",
        next: "q0",
        editable: ["write"],
      }, // BUG: write 0 instead of _
      {
        state: "q0",
        read: "_",
        write: "_",
        move: "D",
        next: "qA",
        editable: [],
      },
    ],
    // Which row/field holds the bug (for validation)
    bugRow: 1,
    bugField: "write",
    bugCorrectValue: "_",
  },

  // CASE 1: Medium — wrong move direction
  {
    id: 1,
    number: "CASO #002",
    title: "O Loop Infinito",
    desc: "A máquina deveria percorrer a fita da esquerda para a direita marcando todos os símbolos. Mas ela parece ficar presa, andando para o lado errado.",
    bugType: "DIREÇÃO CORROMPIDA",
    difficulty: 2,
    input: ["1", "1", "0", "1", "_"],
    initialState: "q0",
    expectedOutput: ["X", "X", "X", "X", "_"],
    expectedFinalState: "qA",
    hint: "Verifique a direção de movimento no estado q0 ao ler 0. A cabeça avança ou recua?",
    correctTransitions: [
      { state: "q0", read: "1", write: "X", move: "D", next: "q0" },
      { state: "q0", read: "0", write: "X", move: "D", next: "q0" },
      { state: "q0", read: "_", write: "_", move: "D", next: "qA" },
    ],
    buggedTransitions: [
      {
        state: "q0",
        read: "1",
        write: "X",
        move: "D",
        next: "q0",
        editable: [],
      },
      {
        state: "q0",
        read: "0",
        write: "X",
        move: "E",
        next: "q0",
        editable: ["move"],
      }, // BUG: move E instead of D
      {
        state: "q0",
        read: "_",
        write: "_",
        move: "D",
        next: "qA",
        editable: [],
      },
    ],
    bugRow: 1,
    bugField: "move",
    bugCorrectValue: "D",
  },

  // CASE 2: Hard — wrong next state (missing state change)
  {
    id: 2,
    number: "CASO #003",
    title: "O Estado Fantasma",
    desc: "Esta máquina deveria processar a fita em duas fases: primeiro marcando os <strong>1s</strong> (fase q0→q1), depois limpando os <strong>0s</strong> (fase q1). O estado de transição foi corrompido e ela nunca muda de fase.",
    bugType: "ESTADO CORROMPIDO",
    difficulty: 3,
    input: ["1", "0", "1", "_"],
    initialState: "q0",
    expectedOutput: ["X", "_", "X", "_"],
    expectedFinalState: "qA",
    hint: "No estado q0, após ler um _ (branco), a máquina deve mudar para q1 e voltar para limpar os 0s. Verifique o próximo estado dessa transição.",
    correctTransitions: [
      { state: "q0", read: "1", write: "X", move: "D", next: "q0" },
      { state: "q0", read: "0", write: "0", move: "D", next: "q0" },
      { state: "q0", read: "_", write: "_", move: "E", next: "q1" },
      { state: "q1", read: "X", write: "X", move: "E", next: "q1" },
      { state: "q1", read: "0", write: "_", move: "E", next: "q1" },
      { state: "q1", read: "_", write: "_", move: "D", next: "qA" },
    ],
    buggedTransitions: [
      {
        state: "q0",
        read: "1",
        write: "X",
        move: "D",
        next: "q0",
        editable: [],
      },
      {
        state: "q0",
        read: "0",
        write: "0",
        move: "D",
        next: "q0",
        editable: [],
      },
      {
        state: "q0",
        read: "_",
        write: "_",
        move: "E",
        next: "q0",
        editable: ["next"],
      }, // BUG: stays q0 instead of going q1
      {
        state: "q1",
        read: "X",
        write: "X",
        move: "E",
        next: "q1",
        editable: [],
      },
      {
        state: "q1",
        read: "0",
        write: "_",
        move: "E",
        next: "q1",
        editable: [],
      },
      {
        state: "q1",
        read: "_",
        write: "_",
        move: "D",
        next: "qA",
        editable: [],
      },
    ],
    bugRow: 2,
    bugField: "next",
    bugCorrectValue: "q1",
  },
];

// ===========================
//  GAME STATE
// ===========================
let solvedCases = new Set();
let currentCase = null;

// Machine runtime state
let tape = [];
let headPos = 0;
let machineState = "";
let stepCount = 0;
let running = false;
let runInterval = null;
let written = new Set();

// Current transitions (editable)
let editableTransitions = [];

// ===========================
//  SCREEN MANAGEMENT
// ===========================
function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===========================
//  INTRO / STORYTELLING
// ===========================
function runStoryTyping() {
  const el = document.getElementById("story-text");
  el.innerHTML = "";
  let i = 0;
  const chars = STORY_TEXT.split("");
  const cursor = document.createElement("span");
  cursor.className = "cursor-blink";
  cursor.textContent = "_";

  function typeNext() {
    if (i < chars.length) {
      el.insertBefore(document.createTextNode(chars[i]), cursor);
      i++;
      const delay =
        chars[i - 1] === "\n" ? 60 : chars[i - 1] === "." ? 200 : 18;
      setTimeout(typeNext, delay);
    } else {
      // done typing
      setTimeout(() => {
        document.getElementById("btn-start-mission").style.display =
          "inline-block";
      }, 400);
    }
  }
  el.appendChild(cursor);
  setTimeout(typeNext, 600);
}

document.getElementById("btn-start-mission").addEventListener("click", () => {
  showScreen("screen-tutorial");
  renderTutorial();
});

// ===========================
//  TUTORIAL
// ===========================
function renderTutorial() {
  const container = document.getElementById("tutorial-steps");
  container.innerHTML = "";
  TUTORIAL_STEPS.forEach((step, i) => {
    const div = document.createElement("div");
    div.className = "tut-step";
    div.innerHTML = `
      <div class="tut-step-num">CONCEITO ${String(i + 1).padStart(2, "0")}</div>
      <h3>${step.title}</h3>
      <p>${step.body}</p>
      ${step.demo ? `<div class="mini-tape">${step.demo.map((s, j) => `<div class="mini-cell${j === step.active ? " active" : ""}${s === "_" ? " blank" : ""}">${s}</div>`).join("")}</div>` : ""}
    `;
    container.appendChild(div);
    setTimeout(() => div.classList.add("visible"), i * 200 + 100);
  });
}

document.getElementById("btn-tutorial-done").addEventListener("click", () => {
  showScreen("screen-cases");
  renderCases();
});

// ===========================
//  CASES MAP
// ===========================
function renderCases() {
  const grid = document.getElementById("cases-grid");
  grid.innerHTML = "";
  document.getElementById("cases-score").textContent =
    `CASOS RESOLVIDOS: ${solvedCases.size}/3`;

  CASES.forEach((c) => {
    const solved = solvedCases.has(c.id);
    const card = document.createElement("div");
    card.className = "case-card" + (solved ? " solved" : "");
    card.innerHTML = `
      <div class="cc-number">${c.number}</div>
      <div class="cc-title">${c.title}</div>
      <div class="cc-desc">${c.desc.replace(/<[^>]+>/g, "").substring(0, 80)}...</div>
      <div class="cc-difficulty">
        DIFICULDADE: ${[1, 2, 3].map((n) => `<span class="dot${n <= c.difficulty ? " active-dot" : ""}"></span>`).join("")}
      </div>
      ${solved ? '<div class="cc-solved-tag">✓ RESOLVIDO</div>' : ""}
    `;
    if (!solved) {
      card.addEventListener("click", () => startCase(c));
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

  // Deep copy transitions
  editableTransitions = c.buggedTransitions.map((t) => ({ ...t }));

  // Set UI
  document.getElementById("game-phase-label").textContent = `// ${c.number}`;
  document.getElementById("case-briefing").innerHTML = `
    <p>${c.desc}</p>
    <span class="bug-type">⚠ FALHA: ${c.bugType}</span>
  `;
  document.getElementById("transition-hint").textContent = c.hint;

  resetMachine();
  renderTransitionTable();
  showScreen("screen-game");
}

document.getElementById("btn-back-cases").addEventListener("click", () => {
  stopRun();
  showScreen("screen-cases");
  renderCases();
});

// ===========================
//  MACHINE RESET
// ===========================
function resetMachine() {
  stopRun();
  tape = [...currentCase.input, "_", "_", "_"];
  headPos = 0;
  machineState = currentCase.initialState;
  stepCount = 0;
  written = new Set();
  document.getElementById("execution-log").innerHTML =
    '<span class="log-hint">[ Execute a máquina para ver o log ]</span>';
  updateStatusDisplay();
  renderTape();
  highlightCurrentRow();
}

// ===========================
//  TAPE RENDERING
// ===========================
function renderTape() {
  const track = document.getElementById("tape-display");
  track.innerHTML = "";
  tape.forEach((sym, i) => {
    const cell = document.createElement("div");
    let cls = "tape-cell";
    if (i === headPos) cls += " head";
    else if (written.has(i)) cls += " written";
    else if (sym === "_") cls += " blank";
    cell.className = cls;
    cell.textContent = sym;
    track.appendChild(cell);
  });
}

// ===========================
//  STATUS DISPLAY
// ===========================
function updateStatusDisplay() {
  document.getElementById("status-state").textContent = machineState;
  document.getElementById("status-pos").textContent = headPos;
  document.getElementById("status-symbol").textContent = tape[headPos] || "_";
  const resultEl = document.getElementById("status-result");
  if (machineState === "qA") {
    resultEl.textContent = "ACEITO ✓";
    resultEl.className = "status-value accept";
  } else if (machineState === "qR") {
    resultEl.textContent = "REJEITADO ✗";
    resultEl.className = "status-value reject";
  } else {
    resultEl.textContent = "Rodando…";
    resultEl.className = "status-value running";
  }
}

// ===========================
//  ONE STEP
// ===========================
function step() {
  if (machineState === "qA" || machineState === "qR") return false;

  const sym = tape[headPos] || "_";
  const rule = editableTransitions.find(
    (t) => t.state === machineState && t.read === sym,
  );

  if (!rule) {
    // No rule found → reject
    addLog(
      `<span class="le">✗ Sem regra para (${machineState}, '${sym}') → REJEIÇÃO</span>`,
    );
    machineState = "qR";
    updateStatusDisplay();
    renderTape();
    return false;
  }

  // Apply rule
  const oldState = machineState;
  const oldPos = headPos;
  addLog(
    `<span class="ls">(${oldState}, '${sym}')</span> → escreve <span class="lw">'${rule.write}'</span>, move <strong>${rule.move}</strong>, vai para <span class="ls">${rule.next}</span>`,
  );

  if (rule.write !== sym) written.add(headPos);
  tape[headPos] = rule.write;

  headPos += rule.move === "D" ? 1 : -1;

  if (headPos < 0) {
    tape.unshift("_"); // infinite tape to the left
    headPos = 0;
  }

  if (headPos >= tape.length) {
    tape.push("_");
  }

  machineState = rule.next;
  stepCount++;

  updateStatusDisplay();
  renderTape();
  highlightCurrentRow();

  if (stepCount > 150) {
    addLog(
      `<span class="le">⚠ Limite de passos atingido — possível loop infinito!</span>`,
    );
    stopRun();
    return false;
  }

  if (machineState === "qA") {
    addLog(`<span class="la">✓ ACEITO — Máquina encerrou com sucesso!</span>`);
    return false;
  }
  if (machineState === "qR") {
    addLog(
      `<span class="le">✗ REJEITADO — Máquina encerrou com rejeição.</span>`,
    );
    return false;
  }
  return true;
}

function addLog(html) {
  const log = document.getElementById("execution-log");
  if (log.querySelector(".log-hint")) log.innerHTML = "";
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `<span style="color:var(--grey)">[${String(stepCount).padStart(3, "0")}]</span> ${html}`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

// ===========================
//  RUN / STOP / STEP BUTTONS
// ===========================
document.getElementById("btn-step").addEventListener("click", () => {
  if (machineState === "qA" || machineState === "qR") return;
  step();
});

document.getElementById("btn-run").addEventListener("click", () => {
  if (running) {
    stopRun();
    return;
  }
  if (machineState === "qA" || machineState === "qR") return;
  running = true;
  document.getElementById("btn-run").textContent = "■ PARAR";
  runInterval = setInterval(() => {
    const cont = step();
    if (!cont) stopRun();
  }, 350);
});

document.getElementById("btn-reset").addEventListener("click", resetMachine);

function stopRun() {
  running = false;
  clearInterval(runInterval);
  document.getElementById("btn-run").textContent = "▶▶ EXECUTAR";
}

// ===========================
//  TRANSITION TABLE RENDER
// ===========================
function renderTransitionTable() {
  const tbody = document.getElementById("transition-body");
  tbody.innerHTML = "";

  editableTransitions.forEach((t, i) => {
    const tr = document.createElement("tr");
    tr.dataset.index = i;

    const fields = ["state", "read", "write", "move", "next"];
    fields.forEach((f) => {
      const td = document.createElement("td");
      if (t.editable && t.editable.includes(f)) {
        // Editable / bugged field
        if (f === "move") {
          const sel = document.createElement("select");
          sel.className = "cell-edit";
          sel.dataset.row = i;
          sel.dataset.field = f;
          ["D", "E"].forEach((opt) => {
            const o = document.createElement("option");
            o.value = opt;
            o.textContent = opt;
            if (t[f] === opt) o.selected = true;
            sel.appendChild(o);
          });
          sel.addEventListener("change", (e) => {
            editableTransitions[+e.target.dataset.row][e.target.dataset.field] =
              e.target.value;
          });
          td.appendChild(sel);
        } else {
          const inp = document.createElement("input");
          inp.type = "text";
          inp.className = "cell-edit corrupted";
          inp.value = t[f];
          inp.maxLength = 4;
          inp.dataset.row = i;
          inp.dataset.field = f;
          inp.addEventListener("input", (e) => {
            editableTransitions[+e.target.dataset.row][e.target.dataset.field] =
              e.target.value.trim();
            e.target.classList.remove("corrupted");
          });
          td.appendChild(inp);
        }
      } else {
        td.textContent = f === "read" && t[f] === "_" ? "_ (branco)" : t[f];
        if (f === "state") td.style.color = "var(--green-dim)";
        if (f === "next" && (t[f] === "qA" || t[f] === "qR"))
          td.style.color = t[f] === "qA" ? "var(--green)" : "var(--red)";
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function highlightCurrentRow() {
  const rows = document.querySelectorAll("#transition-body tr");
  rows.forEach((r) => r.classList.remove("current-row"));
  if (machineState === "qA" || machineState === "qR") return;
  const sym = tape[headPos] || "_";
  const idx = editableTransitions.findIndex(
    (t) => t.state === machineState && t.read === sym,
  );
  if (idx >= 0 && rows[idx]) rows[idx].classList.add("current-row");
}

// ===========================
//  SUBMIT / VALIDATE
// ===========================
document.getElementById("btn-submit").addEventListener("click", validateFix);

function validateFix() {
  const c = currentCase;
  const bugRow = c.bugRow;
  const bugField = c.bugField;
  const correctValue = c.bugCorrectValue;
  const submitted = editableTransitions[bugRow][bugField];

  if (submitted.trim() === correctValue) {
    // Correct!
    solvedCases.add(c.id);
    showModal(
      true,
      "✓",
      "MÁQUINA RESTAURADA!",
      `Excelente trabalho, Agente!\n\nA correção estava na linha onde a máquina estava no estado <strong>${c.buggedTransitions[bugRow].state}</strong> lendo <strong>'${c.buggedTransitions[bugRow].read}'</strong>.\n\nO campo <strong>${bugField.toUpperCase()}</strong> estava com o valor incorreto. O valor correto é <strong>'${correctValue}'</strong>.`,
      () => {
        showScreen("screen-cases");
        renderCases();
        if (solvedCases.size === 3) {
          setTimeout(() => showScreen("screen-victory"), 800);
        }
      },
    );
  } else {
    showModal(
      false,
      "✗",
      "CORREÇÃO INCORRETA",
      `A máquina ainda não está funcionando corretamente.\n\nVerifique os campos marcados em âmbar e certifique-se de entender o comportamento esperado antes de submeter.\n\n<em>Dica: ${c.hint}</em>`,
      () => {},
    );
  }
}

// ===========================
//  MODAL
// ===========================
function showModal(success, icon, title, body, onClose) {
  const overlay = document.getElementById("modal-overlay");
  const box = document.getElementById("modal-box");
  overlay.classList.remove("hidden");
  box.className = "modal-box" + (success ? "" : " error");
  document.getElementById("modal-icon").textContent = icon;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body.replace(/\n/g, "<br>");

  const btn = document.getElementById("modal-btn");
  btn.onclick = () => {
    overlay.classList.add("hidden");
    onClose();
  };
}

// ===========================
//  VICTORY / RESTART
// ===========================
document.getElementById("btn-restart").addEventListener("click", () => {
  solvedCases.clear();
  showScreen("screen-intro");
  runStoryTyping();
});

// ===========================
//  BOOT
// ===========================
window.addEventListener("load", () => {
  showScreen("screen-intro");
  runStoryTyping();
});
