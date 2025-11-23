<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Simple Turn-Based Tracker</title>
  <style>
    :root {
      --bg: #0f1220;
      --panel: #171a2b;
      --panel-2: #1f2340;
      --text: #e7e9f4;
      --muted: #a7adc7;
      --accent: #7aa2ff;
      --good: #35d49a;
      --warn: #ffb454;
      --bad: #ff6b6b;
      --line: rgba(255,255,255,0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 12px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: var(--bg); color: var(--text);
    }
    .app {
      display: grid;
      grid-template-columns: 330px 1fr;
      gap: 12px;
      min-height: 92vh;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.35);
    }
    h2, h3 { margin: 0 0 8px 0; }
    h2 { font-size: 18px; }
    h3 { font-size: 14px; color: var(--muted); font-weight: 600; letter-spacing: .03em; }

    .row { display: flex; gap: 8px; align-items: center; }
    .row.wrap { flex-wrap: wrap; }
    label { font-size: 12px; color: var(--muted); }

    input[type="text"], select {
      width: 100%;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      outline: none;
    }
    input[type="number"]{
      padding: 7px 9px;
      border-radius: 8px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      width: 70px;
    }

    button {
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      padding: 7px 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: transform .03s ease, background .12s ease, border-color .12s ease;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
    }
    button:hover { background: #252a4a; border-color: rgba(255,255,255,0.16); }
    button:active { transform: translateY(1px); }
    button.primary { background: var(--accent); color: #0b1020; border-color: transparent; }
    button.good { background: rgba(53,212,154,0.12); border-color: rgba(53,212,154,0.45); }
    button.warn { background: rgba(255,180,84,0.12); border-color: rgba(255,180,84,0.5); }
    button.bad { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.5); }
    button.ghost { background: transparent; }
    button.small { padding: 4px 7px; font-size: 11px; border-radius: 8px; }

    .list { display: grid; gap: 6px; max-height: 38vh; overflow: auto; padding-right: 2px; }
    .entity {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 8px;
    }
    .entity .name {
      display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px;
    }
    .pill {
      font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 999px; letter-spacing: .05em;
      border: 1px solid var(--line); color: var(--muted);
    }
    .pill.player { color: #bfe1ff; border-color: rgba(122,162,255,.5); background: rgba(122,162,255,.08); }
    .pill.enemy { color: #ffd1d1; border-color: rgba(255,107,107,.5); background: rgba(255,107,107,.08); }
    .pill.group { color: #d0ffea; border-color: rgba(53,212,154,.5); background: rgba(53,212,154,.08); }

    .turn-card {
      display: grid; gap: 10px;
    }
    .big {
      font-size: 22px; font-weight: 900;
    }
    .muted { color: var(--muted); font-size: 12px; }
    .meter { display:flex; gap: 8px; align-items:center; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #333; border: 1px solid var(--line); }
    .dot.on.move { background: var(--good); }
    .dot.on.action { background: var(--accent); }

    .queue { display:flex; gap:6px; flex-wrap:wrap; }
    .queue .qitem { font-size:12px; padding:4px 7px; border-radius:8px; background: var(--panel-2); border:1px solid var(--line); }

    .log { max-height: 22vh; overflow:auto; font-size:12px; color: var(--muted); line-height:1.4; }

    .footer { font-size:11px; color: var(--muted); margin-top: 6px; }

    @media (max-width: 900px) {
      .app { grid-template-columns: 1fr; }
      .list { max-height: 30vh; }
    }
  </style>
</head>
<body>
  <div class="app">
    <!-- Left panel: setup -->
    <div class="card">
      <h2>Setup</h2>
      <div style="display:grid; gap:8px;">
        <div>
          <label>Add entity</label>
          <div class="row">
            <input id="nameInput" type="text" placeholder="Name (e.g., Liam, Wolf)" />
          </div>
          <div class="row" style="margin-top:6px;">
            <select id="typeInput">
              <option value="player">Player</option>
              <option value="enemy">Enemy</option>
            </select>
            <button id="addBtn" class="primary">Add</button>
          </div>
        </div>

        <div class="row wrap">
          <label style="display:flex; gap:6px; align-items:center;">
            <input type="checkbox" id="groupMode" />
            Group actions mode (players act as a group, then enemies)
          </label>
        </div>

        <div class="row wrap">
          <button id="startBtn" class="good">Start / Restart</button>
          <button id="nextBtn" class="primary">Force Next Turn</button>
          <button id="resetBtn" class="bad">Reset All</button>
        </div>

        <div>
          <h3>Turn order (drag not needed)</h3>
          <div id="entityList" class="list"></div>
        </div>
      </div>
      <div class="footer">Tip: This file is a single HTML page. You can host it (Drive/Dropbox/GitHub Pages) and embed it in Google Slides as a Web Object / iframe.</div>
    </div>

    <!-- Right panel: turn UI -->
    <div class="card turn-card">
      <div>
        <h2>Current Turn</h2>
        <div class="muted" id="phaseLabel"></div>
      </div>

      <div class="card" style="background: transparent; border-style:dashed;">
        <div class="big" id="currentName">—</div>
        <div class="row" style="gap:10px; margin-top:6px;">
          <span id="currentType" class="pill">—</span>
          <span class="muted">Round: <b id="roundNum">1</b></span>
        </div>

        <div style="margin-top:10px; display:grid; gap:6px;">
          <div class="meter">
            <div class="dot move" id="moveDot"></div>
            <div class="muted">Move available</div>
          </div>
          <div class="meter">
            <div class="dot action" id="actionDot"></div>
            <div class="muted">Action available</div>
          </div>
        </div>

        <div class="row wrap" style="margin-top:12px;">
          <button id="moveBtn" class="good">Use Move</button>
          <button id="actionBtn" class="primary">Use Action (ends turn)</button>
          <button id="skipMoveBtn" class="ghost">Skip Move</button>
          <button id="skipActionBtn" class="ghost">Skip Action / End Turn</button>
        </div>
      </div>

      <div>
        <h3>Next 3 turns</h3>
        <div id="queue" class="queue"></div>
      </div>

      <div>
        <h3>Log</h3>
        <div id="log" class="log"></div>
      </div>
    </div>
  </div>

<script>
(() => {
  const LS_KEY = 'simple_turn_tracker_v1';

  /** Entity shape
   * { id, name, type: 'player'|'enemy' }
   */
  let entities = [];
  let started = false;

  // Turn state
  let turnIndex = 0;          // index into entities
  let round = 1;
  let moveAvailable = false;
  let actionAvailable = false;

  // Group mode state
  let groupMode = false;
  let phase = 'players';      // 'players'|'enemies'
  let groupPlayerOrder = [];  // array of entity indices that are players
  let groupEnemyOrder = [];   // array of entity indices that are enemies
  let groupSubIndex = 0;      // index into groupPlayerOrder or groupEnemyOrder

  const el = (id) => document.getElementById(id);
  const logEl = el('log');

  function uid() { return Math.random().toString(36).slice(2, 9); }

  function save() {
    const data = { entities, started, turnIndex, round, groupMode, phase, groupSubIndex };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (!data) return;
      entities = data.entities || [];
      started = !!data.started;
      turnIndex = data.turnIndex || 0;
      round = data.round || 1;
      groupMode = !!data.groupMode;
      phase = data.phase || 'players';
      groupSubIndex = data.groupSubIndex || 0;
    } catch (e) {}
  }

  function writeLog(msg) {
    const t = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.textContent = `[${t}] ${msg}`;
    logEl.prepend(div);
  }

  function players() { return entities.filter(e => e.type === 'player'); }
  function enemies() { return entities.filter(e => e.type === 'enemy'); }

  function rebuildGroupOrders() {
    groupPlayerOrder = [];
    groupEnemyOrder = [];
    entities.forEach((e, i) => {
      if (e.type === 'player') groupPlayerOrder.push(i);
      else groupEnemyOrder.push(i);
    });
    if (groupPlayerOrder.length === 0 && groupEnemyOrder.length > 0) phase = 'enemies';
    if (groupEnemyOrder.length === 0 && groupPlayerOrder.length > 0) phase = 'players';
  }

  function currentEntity() {
    if (!entities.length) return null;
    if (!groupMode) return entities[turnIndex % entities.length];

    rebuildGroupOrders();
    const order = (phase === 'players') ? groupPlayerOrder : groupEnemyOrder;
    if (!order.length) return null;
    const idx = order[groupSubIndex % order.length];
    return entities[idx];
  }

  function startTurn() {
    const ce = currentEntity();
    if (!ce) {
      moveAvailable = actionAvailable = false;
      render();
      return;
    }
    if (ce.type === 'player') {
      moveAvailable = true;
      actionAvailable = true;
    } else {
      moveAvailable = false;
      actionAvailable = true; // enemy only has one action
    }
    writeLog(`${ce.name}'s turn begins.${groupMode ? ` (Phase: ${phase})` : ''}`);
    render();
    save();
  }

  // Advance to next entity following rules
  function nextTurn(reason='next') {
    if (!entities.length) return;

    if (!groupMode) {
      turnIndex = (turnIndex + 1) % entities.length;
      if (turnIndex === 0) round += 1;
      startTurn();
      return;
    }

    // Group mode: players act through all players, then enemies act through all enemies.
    rebuildGroupOrders();
    const order = (phase === 'players') ? groupPlayerOrder : groupEnemyOrder;

    if (!order.length) {
      // if current phase empty, flip phase
      phase = (phase === 'players') ? 'enemies' : 'players';
      groupSubIndex = 0;
      nextTurn(reason);
      return;
    }

    groupSubIndex += 1;
    if (groupSubIndex >= order.length) {
      // phase complete; switch
      groupSubIndex = 0;
      phase = (phase === 'players') ? 'enemies' : 'players';
      // one full round increments when enemies phase ends
      if (phase === 'players') round += 1;
    }
    startTurn();
  }

  // Lookahead for next N turns
  function getLookahead(n=3) {
    const names = [];
    if (!entities.length) return names;

    if (!groupMode) {
      for (let k=1; k<=n; k++) {
        const idx = (turnIndex + k) % entities.length;
        names.push(entities[idx].name);
      }
      return names;
    }

    rebuildGroupOrders();

    let ph = phase;
    let sub = groupSubIndex;
    for (let step=0; step<n; step++) {
      const order = (ph === 'players') ? groupPlayerOrder : groupEnemyOrder;
      if (!order.length) {
        ph = (ph === 'players') ? 'enemies' : 'players';
        sub = 0;
        step--; // retry this step in new phase
        continue;
      }
      let nextSub = sub + 1;
      let nextPh = ph;
      if (nextSub >= order.length) {
        nextSub = 0;
        nextPh = (ph === 'players') ? 'enemies' : 'players';
      }
      const nextOrder = (nextPh === 'players') ? groupPlayerOrder : groupEnemyOrder;
      if (!nextOrder.length) {
        // if next phase empty, flip again
        nextPh = (nextPh === 'players') ? 'enemies' : 'players';
      }
      const actualOrder = (nextPh === 'players') ? groupPlayerOrder : groupEnemyOrder;
      const actualIndex = actualOrder[nextSub % actualOrder.length];
      names.push(entities[actualIndex].name + (nextPh !== phase ? ` (${nextPh})` : ''));

      ph = nextPh;
      sub = nextSub;
    }
    return names;
  }

  // Actions
  function useMove() {
    const ce = currentEntity();
    if (!ce || ce.type !== 'player') return;
    if (!moveAvailable) return;
    moveAvailable = false;
    writeLog(`${ce.name} used MOVE. (Action still available)`);
    render(); save();
  }

  function useAction() {
    const ce = currentEntity();
    if (!ce) return;
    if (!actionAvailable) return;
    actionAvailable = false;
    moveAvailable = false; // if you action without moving, you lose move; if you moved already, still no move anyway.
    writeLog(`${ce.name} used ACTION. Turn ends.`);
    render(); save();
    nextTurn('action');
  }

  function skipMove() {
    const ce = currentEntity();
    if (!ce) return;
    if (ce.type !== 'player') return;
    moveAvailable = false;
    writeLog(`${ce.name} skipped MOVE.`);
    render(); save();
  }

  function skipActionEnd() {
    const ce = currentEntity();
    if (!ce) return;
    actionAvailable = false;
    moveAvailable = false;
    writeLog(`${ce.name} ended turn without action.`);
    render(); save();
    nextTurn('skip');
  }

  // Entity list UI
  function renderEntityList() {
    const list = el('entityList');
    list.innerHTML = '';
    entities.forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'entity';

      const left = document.createElement('div');
      left.className = 'name';
      left.innerHTML = `<span>${e.name}</span><span class="pill ${e.type}">${e.type}</span>`;

      const right = document.createElement('div');
      right.className = 'row';

      const up = document.createElement('button');
      up.className = 'small'; up.textContent = '▲';
      up.onclick = () => { if (i===0) return; [entities[i-1], entities[i]] = [entities[i], entities[i-1]]; if (started) { turnIndex = 0; } render(); save(); };

      const down = document.createElement('button');
      down.className = 'small'; down.textContent = '▼';
      down.onclick = () => { if (i===entities.length-1) return; [entities[i+1], entities[i]] = [entities[i], entities[i+1]]; if (started) { turnIndex = 0; } render(); save(); };

      const del = document.createElement('button');
      del.className = 'small bad'; del.textContent = 'Delete';
      del.onclick = () => {
        const wasCurrent = (!groupMode && i===turnIndex);
        entities.splice(i,1);
        if (wasCurrent) turnIndex = 0;
        if (turnIndex >= entities.length) turnIndex = 0;
        render(); save();
      };

      right.append(up, down, del);
      row.append(left, right);
      list.appendChild(row);
    });
  }

  function render() {
    groupMode = el('groupMode').checked;

    renderEntityList();

    const ce = currentEntity();
    el('currentName').textContent = ce ? ce.name : '—';
    el('currentType').textContent = ce ? ce.type.toUpperCase() : '—';
    el('currentType').className = ce ? `pill ${ce.type}` : 'pill';

    el('roundNum').textContent = round;

    el('moveDot').className = `dot move ${moveAvailable ? 'on' : ''}`;
    el('actionDot').className = `dot action ${actionAvailable ? 'on' : ''}`;

    // Phase label
    el('phaseLabel').textContent = groupMode ? `Group Mode ON — ${phase === 'players' ? 'Players Phase' : 'Enemies Phase'}` : 'Normal Mode';

    // Buttons enable/disable
    el('moveBtn').disabled = !ce || ce.type !== 'player' || !moveAvailable;
    el('skipMoveBtn').disabled = !ce || ce.type !== 'player' || !moveAvailable;
    el('actionBtn').disabled = !ce || !actionAvailable;
    el('skipActionBtn').disabled = !ce;

    // Queue
    const q = el('queue');
    q.innerHTML = '';
    const look = getLookahead(3);
    look.forEach(name => {
      const s = document.createElement('div');
      s.className = 'qitem';
      s.textContent = name;
      q.appendChild(s);
    });
  }

  // Wire up UI
  el('addBtn').onclick = () => {
    const name = el('nameInput').value.trim();
    const type = el('typeInput').value;
    if (!name) return;
    entities.push({ id: uid(), name, type });
    el('nameInput').value = '';
    render(); save();
  };

  el('startBtn').onclick = () => {
    if (!entities.length) return;
    started = true;
    round = 1;
    turnIndex = 0;
    groupSubIndex = 0;
    phase = 'players';
    startTurn();
  };

  el('nextBtn').onclick = () => {
    if (!started) return;
    writeLog('Forced next turn.');
    nextTurn('force');
  };

  el('resetBtn').onclick = () => {
    if (!confirm('Reset everything?')) return;
    entities = []; started = false; turnIndex = 0; round = 1; groupSubIndex = 0; phase = 'players';
    moveAvailable = actionAvailable = false;
    logEl.innerHTML='';
    render(); save();
  };

  el('groupMode').onchange = () => {
    if (started) {
      groupSubIndex = 0;
      phase = 'players';
      startTurn();
    } else render();
    save();
  };

  el('moveBtn').onclick = useMove;
  el('actionBtn').onclick = useAction;
  el('skipMoveBtn').onclick = skipMove;
  el('skipActionBtn').onclick = skipActionEnd;

  // Init
  load();
  el('groupMode').checked = groupMode;
  render();
  if (started) startTurn();
})();
</script>
</body>
</html>
