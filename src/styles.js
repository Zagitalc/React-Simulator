/* All app styles. Append to the page via JS so we can keep them out of the inline style block. */
(function(){
  const css = `
  .app{
    height:100%;
    display:flex; flex-direction:column;
    background: var(--bg);
    background-image:
      radial-gradient(800px 400px at 80% -10%, oklch(0.78 0.12 215 / 0.05), transparent 60%),
      radial-gradient(600px 300px at -10% 110%, oklch(0.78 0.12 295 / 0.05), transparent 60%);
  }

  /* topbar */
  .topbar{
    display:flex; align-items:center; justify-content:space-between;
    padding: 12px 20px; border-bottom: 1px solid var(--line);
    background: linear-gradient(180deg, var(--bg-1), var(--bg));
  }
  .brand{ display:flex; align-items:baseline; gap: 14px; }
  .brand-mark{
    font-family: var(--mono); font-size: 14px; letter-spacing: 0.5px;
    color: var(--accent);
    padding: 4px 10px; border:1px solid var(--line-2); border-radius: 6px;
    background: var(--accent-soft);
  }
  .brand-name{ font-weight:600; font-size: 15px; letter-spacing:-0.01em; }
  .brand-tag{ color: var(--fg-mute); font-size: 12px; font-family: var(--mono); }
  .topbar-right{ display:flex; align-items:center; gap: 14px; }
  .status{
    display:inline-flex; align-items:center; gap: 8px;
    color: var(--fg-dim); font-size: 12px; font-family: var(--mono);
  }
  .status-dot{
    width:8px; height:8px; border-radius:50%;
    background: var(--accent-2);
    box-shadow: 0 0 8px var(--accent-2);
  }
  .toggle{
    background: transparent; border:1px solid var(--line-2); color: var(--fg-dim);
    padding: 5px 12px; border-radius: 6px; font-size: 12px; font-family: var(--mono);
    cursor: pointer; transition: all 0.15s;
  }
  .toggle:hover{ color: var(--fg); border-color: var(--fg-mute); }
  .toggle.on{ color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }

  /* layout */
  .body{ flex:1; display:grid; grid-template-columns: 240px 1fr; min-height:0; }
  .main{
    display:grid; grid-template-columns: 1.1fr 1.3fr 1fr; gap: 1px;
    background: var(--line); /* gap-as-divider trick */
    min-height:0;
  }
  .pane{
    background: var(--bg);
    display:flex; flex-direction:column;
    min-height:0; min-width:0;
  }

  /* sidebar */
  .sidebar{
    border-right: 1px solid var(--line);
    background: var(--bg-1);
    display:flex; flex-direction: column;
    padding: 18px 0;
  }
  .side-label{
    padding: 0 18px 10px;
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--fg-mute); font-family: var(--mono);
  }
  .lesson-list{ list-style:none; margin:0; padding: 0; flex:1; }
  .lesson-item{
    display:flex; gap: 12px; align-items:center;
    padding: 10px 18px;
    border-left: 2px solid transparent;
    cursor: pointer; transition: all 0.12s;
  }
  .lesson-item:hover{ background: var(--bg-2); }
  .lesson-item.on{
    background: var(--bg-2);
    border-left-color: var(--accent);
  }
  .lesson-num{
    font-family: var(--mono); font-size: 11px; color: var(--fg-mute);
    width: 22px;
  }
  .lesson-item.on .lesson-num{ color: var(--accent); }
  .lesson-meta{ display:flex; flex-direction:column; gap: 2px; }
  .lesson-title{ font-size: 13px; font-weight: 500; color: var(--fg); }
  .lesson-sub{ font-size: 11px; color: var(--fg-mute); font-family: var(--mono); }

  .side-foot{
    border-top: 1px solid var(--line);
    padding: 14px 18px;
  }
  .legend{ display:flex; flex-direction:column; gap: 6px; }
  .legend-row{
    display: flex; gap: 10px; align-items: baseline;
    font-family: var(--mono); font-size: 11px; color: var(--fg-dim);
  }

  /* panel chrome */
  .panel-head{
    display:flex; align-items:center; justify-content:space-between;
    padding: 12px 16px; border-bottom: 1px solid var(--line);
    background: var(--bg-1);
    flex-shrink: 0;
  }
  .panel-title{
    display:inline-flex; align-items:center; gap: 10px;
    font-family: var(--mono); font-size: 12px; color: var(--fg);
    letter-spacing: 0.02em;
  }
  .panel-title .dot{
    width: 8px; height: 8px; border-radius: 50%;
  }
  .panel-sub{
    font-family: var(--mono); font-size: 11px; color: var(--fg-mute);
  }
  .btn-ghost{
    background: transparent; border: 1px solid var(--line-2); color: var(--fg-mute);
    padding: 3px 10px; border-radius: 4px; cursor: pointer;
    font-family: var(--mono); font-size: 11px; transition: all 0.15s;
  }
  .btn-ghost:hover{ color: var(--fg); border-color: var(--fg-mute); }

  /* code pane */
  .code-pane .code-wrap{
    flex: 1; overflow:auto;
    padding: 16px 0;
    font-family: var(--mono);
  }
  .code-block{
    font-size: var(--code-fs, 13px); line-height: 1.7;
  }
  .code-line{
    display:flex; gap: 12px;
    padding: 0 16px;
    transition: background 0.15s;
    cursor: default;
  }
  .code-line.hi{
    background: linear-gradient(90deg, var(--accent-soft), transparent 80%);
    border-left: 2px solid var(--accent); padding-left: 14px;
  }
  .code-line .ln{
    color: var(--fg-mute); user-select: none; min-width: 24px; text-align:right;
    font-size: 11px; padding-top: 2px;
  }
  .code-line .lc{ flex:1; white-space: pre; }

  /* tokens */
  .tk-kw   { color: var(--kw); font-weight: 500; }
  .tk-hook { color: var(--accent); font-weight: 500; }
  .tk-cmp  { color: var(--accent-3); }
  .tk-fn   { color: var(--fn); }
  .tk-str  { color: var(--str); }
  .tk-num  { color: var(--num); }
  .tk-com  { color: var(--com); font-style: italic; }
  .tk-punct{ color: var(--punct); }
  .tk-op   { color: var(--punct); }
  .tk-jsx  { color: var(--accent-3); }
  .tk-id   { color: var(--fg); }
  .tk-w    { color: inherit; }

  .notes{
    border-top: 1px solid var(--line);
    padding: 14px 16px;
    background: var(--bg-1);
    display:flex; flex-direction:column; gap: 12px;
    max-height: 35%;
    overflow-y: auto;
  }
  .note-title{
    font-size: 12px; font-weight: 600; color: var(--fg);
    margin-bottom: 4px;
  }
  .note-body{
    font-size: 12.5px; line-height: 1.55; color: var(--fg-dim);
    text-wrap: pretty;
  }
  .interview-answer{
    border: 1px solid var(--line-2);
    background: var(--bg);
    border-left: 2px solid var(--accent-2);
    border-radius: 6px;
    padding: 12px;
  }
  .answer-label{
    font-family: var(--mono); font-size: 10px; color: var(--accent-2);
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 6px;
  }
  .answer-body{
    font-size: 12.5px; line-height: 1.55; color: var(--fg);
    text-wrap: pretty;
  }

  /* preview pane */
  .preview-pane .preview-wrap{
    flex:1; overflow:auto;
    padding: 24px;
    background:
      radial-gradient(800px 400px at 50% 0%, oklch(0.78 0.12 215 / 0.04), transparent 70%),
      var(--bg);
  }
  .demo-frame{
    display: flex; flex-direction: column; gap: 16px;
  }
  .demo-stage{
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 24px;
    display:flex; flex-direction:column; gap: 16px;
    box-shadow: var(--shadow);
  }
  .demo-meta{
    display:flex; align-items:center; justify-content: space-between;
    font-family: var(--mono); font-size: 11px; color: var(--fg-mute);
    padding-top: 8px; border-top: 1px dashed var(--line-2);
  }
  .demo-meta b{ color: var(--accent); font-weight: 500; }
  .demo-reset{
    background: transparent; border:1px solid var(--line-2); color: var(--fg-mute);
    padding: 4px 12px; border-radius: 4px; cursor: pointer;
    font-family: var(--mono); font-size: 11px;
  }
  .demo-reset:hover{ color: var(--fg); border-color: var(--fg-mute); }

  .demo-btn{
    background: var(--accent-soft);
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 12px 28px; border-radius: 8px;
    font-family: var(--sans); font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
    align-self: flex-start;
  }
  .demo-btn:hover{ background: oklch(0.78 0.12 215 / 0.2); transform: translateY(-1px); }
  .demo-btn:active{ transform: translateY(0); }
  .demo-btn b{ color: var(--accent); font-weight: 700; font-family: var(--mono); }

  .demo-input, .demo-select{
    background: var(--bg);
    color: var(--fg);
    border: 1px solid var(--line-2);
    padding: 10px 14px; border-radius: 6px;
    font-family: var(--mono); font-size: 13px;
    width: 100%;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .demo-input:focus, .demo-select:focus{
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .demo-select{
    appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, var(--fg-dim) 50%),
                      linear-gradient(135deg, var(--fg-dim) 50%, transparent 50%);
    background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50%;
    background-size: 5px 5px;
    background-repeat: no-repeat;
  }

  .demo-explainer{
    padding: 12px 14px;
    background: var(--bg-2);
    border-left: 2px solid var(--accent);
    border-radius: 0 6px 6px 0;
    font-size: 13px; line-height: 1.55; color: var(--fg-dim);
    text-wrap: pretty;
  }
  .demo-explainer code{
    font-family: var(--mono); font-size: 12px;
    background: var(--bg); padding: 1px 6px; border-radius: 3px;
    color: var(--accent);
  }
  .demo-explainer b{ color: var(--fg); font-weight: 600; }

  .kbd{
    font-family: var(--mono); font-size: 11px;
    background: var(--bg); padding: 2px 8px; border-radius: 3px;
    color: var(--accent-2); border: 1px solid var(--line-2);
  }

  /* parent/child cards (props lesson) */
  .parent-card{
    border: 1px dashed var(--line-2); border-radius: 8px;
    padding: 16px; display: flex; flex-direction: column; gap: 12px;
  }
  .card-tag{
    font-family: var(--mono); font-size: 11px; color: var(--accent-3);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .card-sub{
    color: var(--fg-mute); margin-left: 8px; text-transform: none; letter-spacing: 0;
  }
  .child-card{
    border: 1px dashed oklch(0.78 0.12 215 / 0.4); border-radius: 8px;
    padding: 14px; background: var(--accent-soft);
  }
  .child-card .card-tag{ color: var(--accent); }
  .greet{
    margin: 8px 0 0; font-size: 16px; color: var(--fg);
  }
  .greet b{ color: var(--accent); font-family: var(--mono); }
  .prop-arrow{
    font-family: var(--mono); font-size: 12px;
    display: flex; align-items: center; gap: 8px; padding-left: 12px;
    color: var(--fg-mute);
  }
  .prop-arrow .prop-val{ color: var(--accent-2); }
  .prop-arrow .arrow{ color: var(--accent); font-size: 16px; margin-left: auto; padding-right: 12px; animation: pulseDown 1.6s ease-in-out infinite; }
  @keyframes pulseDown{
    0%,100%{ transform: translateY(0); opacity: 0.5; }
    50%{ transform: translateY(3px); opacity: 1; }
  }

  /* filter chips + table (useEffect, useMemo) */
  .filter-row{
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  .chip{
    background: var(--bg);
    color: var(--fg-dim);
    border: 1px solid var(--line-2);
    padding: 6px 14px; border-radius: 999px;
    font-family: var(--mono); font-size: 12px;
    cursor: pointer; transition: all 0.15s;
  }
  .chip:hover{ color: var(--fg); border-color: var(--fg-mute); }
  .chip.on{
    background: var(--accent-soft);
    color: var(--accent); border-color: var(--accent);
  }

  .data-table{
    border: 1px solid var(--line);
    border-radius: 6px; overflow: hidden;
    background: var(--bg);
    font-family: var(--mono); font-size: 12px;
  }
  .data-table .th, .data-table .tr{
    display: grid; grid-template-columns: 1.4fr 1fr 0.8fr 0.8fr 1fr;
    padding: 10px 14px; gap: 12px;
    border-bottom: 1px solid var(--line);
  }
  .data-table .th{
    background: var(--bg-2); color: var(--fg-mute);
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .data-table .tr:last-child{ border-bottom: none; }
  .data-table .tr:hover{ background: var(--bg-1); }
  .data-table .num{ color: var(--num); }
  .data-table .promo{ color: var(--accent-2); }
  .data-table .date{ color: var(--fg-dim); }
  .error-row{
    padding: 14px; color: var(--accent-4); text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    background: oklch(0.78 0.12 25 / 0.08);
  }
  .loading-row{
    padding: 14px; color: var(--fg-mute); text-align: center;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .spinner{
    width: 12px; height: 12px;
    border: 2px solid var(--line-2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin{ to{ transform: rotate(360deg); } }

  .stat-card{
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 16px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .stat-label{ font-family: var(--mono); font-size: 11px; color: var(--fg-mute); text-transform: uppercase; letter-spacing: 0.1em; }
  .stat-value{ font-family: var(--mono); font-size: 28px; color: var(--accent-2); font-weight: 600; }
  .stat-sub{ font-family: var(--mono); font-size: 11px; color: var(--fg-mute); }
  .stat-sub b{ color: var(--accent); font-weight: 500; }
  .stat-grid{
    display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;
  }
  .small-code{
    font-family: var(--mono); font-size: 11px; color: var(--fg-dim);
    background: var(--bg); border: 1px solid var(--line);
    border-radius: 6px; padding: 10px; line-height: 1.6;
  }

  /* todo list */
  .todo-list{
    list-style: none; margin: 0; padding: 0;
    display: flex; flex-direction: column; gap: 6px;
  }
  .todo-item{
    display: flex; align-items: center; gap: 12px;
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 10px 14px;
    transition: all 0.2s;
  }
  .todo-item:hover{ border-color: var(--line-2); }
  .key-tag{
    font-family: var(--mono); font-size: 10px;
    color: var(--accent);
    background: var(--accent-soft);
    padding: 2px 6px; border-radius: 3px;
  }
  .todo-text{ flex:1; font-size: 13px; }
  .todo-x{
    background: transparent; border: none;
    color: var(--fg-mute); cursor: pointer;
    font-size: 18px; padding: 2px 8px; border-radius: 3px;
    transition: all 0.15s;
  }
  .todo-x:hover{ color: var(--accent-4); background: oklch(0.78 0.12 25 / 0.1); }
  .todo-empty{
    padding: 14px; text-align:center;
    color: var(--fg-mute); font-family: var(--mono); font-size: 12px;
  }

  /* timeline */
  .timeline{ display:flex; flex-direction:column; flex:1; min-height:0; }
  .timeline-body{
    flex:1; overflow:auto;
    padding: 8px 0;
    font-family: var(--mono); font-size: 12px;
  }
  .empty{
    padding: 32px 16px; text-align:center;
    color: var(--fg-mute);
  }
  .empty .hint{
    font-size: 11px; margin-top: 4px; color: var(--fg-mute);
  }
  .tl-row{
    display: grid;
    grid-template-columns: 26px 16px 60px 1fr;
    gap: 6px; align-items: baseline;
    padding: 4px 14px;
    transition: background 0.15s;
  }
  .tl-row:hover{ background: var(--bg-1); }
  .tl-tick{ color: var(--fg-mute); font-size: 10px; }
  .tl-icon{ font-size: 12px; }
  .tl-kind{ font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
  .tl-msg{ color: var(--fg); }
  .tl-detail{
    grid-column: 4;
    color: var(--fg-mute); font-size: 11px;
    padding-left: 0;
  }
  .timeline-break{
    height: 1px; background: var(--line);
    margin: 6px 14px; opacity: 0.6;
  }

  /* inspector */
  .inspector{
    margin-top: 0;
    background: var(--bg-1);
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
  }
  .inspector-body{
    padding: 12px 14px;
    display:flex; flex-direction: column; gap: 12px;
    font-family: var(--mono); font-size: 12px;
  }
  .insp-group{ display: flex; flex-direction: column; gap: 4px; }
  .insp-label{
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--fg-mute);
    padding-bottom: 4px; border-bottom: 1px dashed var(--line-2);
  }
  .insp-comp{
    margin-left: 10px; color: var(--fg-mute);
  }
  .insp-rows{ display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
  .insp-row{
    display:flex; align-items: baseline; gap: 6px;
    padding: 2px 4px; border-radius: 3px;
    transition: background 0.2s;
  }
  .insp-row.changed{ background: oklch(0.78 0.12 60 / 0.08); }
  .insp-key{ color: var(--fg); }
  .insp-eq{ color: var(--fg-mute); }
  .insp-val{ color: var(--num); }
  .insp-val.v-string{ color: var(--str); }
  .insp-val.v-boolean{ color: var(--kw); }
  .insp-empty{ color: var(--fg-mute); font-style: italic; }

  .render-pill{
    font-family: var(--mono); font-size: 11px; color: var(--fg-mute);
    background: var(--bg-2); padding: 3px 10px; border-radius: 999px;
    border: 1px solid var(--line-2);
  }
  .render-pill b{ color: var(--accent); }

  /* bottom bar */
  .bottombar{
    display:flex; align-items:center; gap: 12px;
    padding: 8px 20px;
    border-top: 1px solid var(--line);
    background: var(--bg-1);
    font-family: var(--mono); font-size: 11px; color: var(--fg-mute);
  }
  .bottombar b{ color: var(--accent); font-weight: 500; }
  .bottombar .sep{ color: var(--line-2); }
  .bottombar .muted{ color: var(--fg-mute); margin-left: auto; }

  /* responsive squish */
  @media (max-width: 1280px){
    .main{ grid-template-columns: 1fr 1fr 1fr; }
  }
  @media (max-width: 1024px){
    .body{ grid-template-columns: 200px 1fr; }
    .main{ grid-template-columns: 1fr; grid-auto-rows: minmax(0, 1fr); }
  }

  /* compact density */
  html[data-compact] .topbar{ padding: 8px 16px; }
  html[data-compact] .lesson-item{ padding: 7px 16px; }
  html[data-compact] .panel-head{ padding: 8px 14px; }
  html[data-compact] .demo-stage{ padding: 16px; gap: 12px; }
  html[data-compact] .preview-pane .preview-wrap{ padding: 16px; }
  html[data-compact] .notes{ padding: 10px 14px; gap: 8px; }
  html[data-compact] .tl-row{ padding: 3px 14px; }
  html[data-compact] .code-pane .code-wrap{ padding: 10px 0; }
  html[data-compact] .bottombar{ padding: 6px 16px; }
  `;
  const tag = document.createElement('style');
  tag.textContent = css;
  document.head.appendChild(tag);
})();
