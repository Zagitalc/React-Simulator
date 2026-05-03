/* App shell */
const { useState, useEffect, useRef, useMemo } = React;

const LESSONS = [
  window.LESSON_useState,
  window.LESSON_controlled,
  window.LESSON_props,
  window.LESSON_useCallback,
  window.LESSON_useEffect,
  window.LESSON_useMemo,
  window.LESSON_list,
].filter(Boolean);

// resolve { code, highlightLines, Demo } for the current variant (or fall back to lesson.code)
function resolveVariant(lesson, variantId){
  if (!lesson.variants) return { code: lesson.code, highlightLines: lesson.highlightLines, Demo: lesson.Demo };
  const v = lesson.variants[variantId] || lesson.variants.good || Object.values(lesson.variants)[0];
  return {
    code: v.code || lesson.code,
    highlightLines: v.highlightLines || lesson.highlightLines,
    Demo: v.Demo || lesson.Demo,
  };
}

// substitute :name placeholders in an SQL template with values from params object
function fillSqlTemplate(template, params){
  if (!template) return '';
  return template.replace(/:(\w+)/g, (m, k) => {
    if (params && params[k] != null) {
      const v = params[k];
      return typeof v === 'string' ? `'${v}'` : String(v);
    }
    return m;
  });
}

function ChallengeCard({ challenge }){
  const [shown, setShown] = React.useState(false);
  if (!challenge) return null;
  return (
    <div className="challenge-card">
      <span className="ch-tag">Challenge</span>
      <div className="ch-prompt">{challenge.prompt}</div>
      {!shown && (
        <button className="ch-reveal" onClick={() => setShown(true)}>Reveal answer</button>
      )}
      {shown && (
        <div className="ch-answer">{challenge.answer}</div>
      )}
    </div>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "showNotes": true,
  "showLegend": true,
  "codeFontSize": 13,
  "accentHue": 215,
  "compact": false
}/*EDITMODE-END*/;

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeId, setActiveId] = useState(LESSONS[0].id);
  const [variantId, setVariantId] = useState('good');
  const [tabId, setTabId] = useState('code');
  const [demoState, setDemoState] = useState({});
  const trace = useTrace();

  const lesson = LESSONS.find(l => l.id === activeId) || LESSONS[0];
  const resolved = resolveVariant(lesson, variantId);
  const variantKeys = lesson.variants ? Object.keys(lesson.variants) : [];

  // build available tab list dynamically
  const tabs = [{ id: 'code', label: 'Code' }];
  if (lesson.types) tabs.push({ id: 'types', label: 'Types' });
  if (lesson.backend) tabs.push({ id: 'backend', label: 'Backend' });
  if (lesson.sql) tabs.push({ id: 'sql', label: 'SQL' });

  // Apply theme to <html data-theme>, persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
    try { localStorage.setItem('rs-theme', t.theme); } catch(e){}
  }, [t.theme]);

  // Apply accent hue + code font size as CSS vars
  useEffect(() => {
    const r = document.documentElement;
    const h = t.accentHue;
    const isDark = t.theme === 'dark';
    const L = isDark ? 0.78 : 0.55;
    const C = isDark ? 0.12 : 0.13;
    r.style.setProperty('--accent', `oklch(${L} ${C} ${h})`);
    r.style.setProperty('--accent-soft', `oklch(${L} ${C} ${h} / ${isDark ? 0.12 : 0.10})`);
    r.style.setProperty('--fn', `oklch(${isDark ? 0.82 : 0.50} ${isDark ? 0.10 : 0.14} ${h})`);
  }, [t.accentHue, t.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--code-fs', t.codeFontSize + 'px');
  }, [t.codeFontSize]);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-compact', !!t.compact);
  }, [t.compact]);

  // clear timeline when lesson or variant changes; reset variant/tab on lesson change
  useEffect(() => {
    trace.clear();
    setVariantId('good');
    setTabId('code');
    setDemoState({});
  }, [activeId]);
  useEffect(() => { trace.clear(); setDemoState({}); }, [variantId]);

  // make sure tab is valid for this lesson
  useEffect(() => {
    if (!tabs.find(x => x.id === tabId)) setTabId('code');
  }, [activeId, lesson.types, lesson.backend, lesson.sql]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⟨ R ⟩</span>
          <span className="brand-name">React Simulator</span>
          <span className="brand-tag">interactive visual debugger</span>
        </div>
        <div className="topbar-right">
          <span className="status">
            <span className="status-dot"></span>
            ready
          </span>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          <div className="side-label">Lessons</div>
          <ul className="lesson-list">
            {LESSONS.map((l, i) => (
              <li
                key={l.id}
                className={`lesson-item ${l.id === activeId ? 'on' : ''}`}
                onClick={() => setActiveId(l.id)}
              >
                <span className="lesson-num">{String(i+1).padStart(2,'0')}</span>
                <span className="lesson-meta">
                  <span className="lesson-title">{l.title}</span>
                  <span className="lesson-sub">{l.subtitle}</span>
                </span>
              </li>
            ))}
          </ul>
          {t.showLegend && (
            <div className="side-foot">
              <div className="legend">
                <div className="legend-row"><span style={{color:'var(--accent-3)'}}>▲</span> event</div>
                <div className="legend-row"><span style={{color:'var(--accent-2)'}}>●</span> state change</div>
                <div className="legend-row"><span style={{color:'var(--accent)'}}>◆</span> render</div>
                <div className="legend-row"><span style={{color:'var(--accent-5)'}}>✦</span> effect</div>
                <div className="legend-row"><span style={{color:'var(--accent-4)'}}>↓</span> fetch</div>
              </div>
            </div>
          )}
        </aside>

        <main className="main">
          <section className="pane code-pane">
            <div className="panel-head">
              <div className="panel-title">
                <span className="dot" style={{background:'var(--accent)'}}></span>
                {lesson.title}.jsx
              </div>
              <span className="panel-sub">{lesson.subtitle}</span>
              {variantKeys.length > 1 && (
                <div className="variant-toggle">
                  {variantKeys.map(k => {
                    const v = lesson.variants[k];
                    const label = v.label || (k === 'good' ? 'Good' : k === 'bad' ? 'Bad' : k);
                    return (
                      <button
                        key={k}
                        className={`variant-btn ${k} ${variantId === k ? 'on' : ''}`}
                        onClick={() => setVariantId(k)}
                      >{label}</button>
                    );
                  })}
                </div>
              )}
            </div>
            {tabs.length > 1 && (
              <div className="tab-row">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${tabId === tab.id ? 'on' : ''}`}
                    onClick={() => setTabId(tab.id)}
                  >{tab.label}</button>
                ))}
              </div>
            )}
            <div className="code-wrap">
              {tabId === 'code' && (
                <CodeBlock code={resolved.code} highlightLines={resolved.highlightLines} />
              )}
              {tabId === 'types' && lesson.types && (
                <CodeBlock code={lesson.types} highlightLines={[]} />
              )}
              {tabId === 'backend' && lesson.backend && (
                <CodeBlock code={lesson.backend.source} highlightLines={[]} />
              )}
              {tabId === 'sql' && lesson.sql && (
                <CodeBlock
                  code={fillSqlTemplate(lesson.sql.template, lesson.sql.params ? lesson.sql.params(demoState) : {})}
                  highlightLines={[]}
                  mode="sql"
                />
              )}
            </div>
            {tabId === 'backend' && lesson.backend && lesson.backend.flow && (
              <ol className="flow-list">
                {lesson.backend.flow.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            )}
            {t.showNotes && lesson.notes && tabId === 'code' && (
              <div className="notes">
                {lesson.notes.map((n, i) => (
                  <div key={i} className="note">
                    <div className="note-title">{n.title}</div>
                    <div className="note-body">{n.body}</div>
                  </div>
                ))}
              </div>
            )}
            <ChallengeCard challenge={lesson.challenge} />
          </section>

          <section className="pane preview-pane">
            <div className="panel-head">
              <div className="panel-title">
                <span className="dot" style={{background:'var(--accent-2)'}}></span>
                Preview
              </div>
              <span className="panel-sub">live component {lesson.variants ? `· ${variantId}` : ''}</span>
            </div>
            <div className="preview-wrap">
              <resolved.Demo trace={trace} variantId={variantId} onDemoState={setDemoState} key={lesson.id + ':' + variantId} />
            </div>
          </section>

          <section className="pane debug-pane">
            <Timeline events={trace.events} onClear={trace.clear} />
          </section>
        </main>
      </div>

      <footer className="bottombar">
        <span>lesson <b>{LESSONS.findIndex(l=>l.id===activeId)+1}</b> / {LESSONS.length}</span>
        <span className="sep">·</span>
        <span>events: <b>{trace.events.length}</b></span>
        <span className="sep">·</span>
        <span className="muted">click any lesson on the left to load it</span>
      </footer>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakRadio
          label="Theme"
          value={t.theme}
          options={['light', 'dark']}
          onChange={(v) => setTweak('theme', v)}
        />
        <TweakSlider
          label="Accent hue"
          value={t.accentHue}
          min={0} max={360} step={5} unit="°"
          onChange={(v) => setTweak('accentHue', v)}
        />
        <TweakToggle
          label="Compact density"
          value={t.compact}
          onChange={(v) => setTweak('compact', v)}
        />

        <TweakSection label="Code panel" />
        <TweakSlider
          label="Code size"
          value={t.codeFontSize}
          min={11} max={18} step={1} unit="px"
          onChange={(v) => setTweak('codeFontSize', v)}
        />
        <TweakToggle
          label="Show lesson notes"
          value={t.showNotes}
          onChange={(v) => setTweak('showNotes', v)}
        />

        <TweakSection label="Sidebar" />
        <TweakToggle
          label="Show legend"
          value={t.showLegend}
          onChange={(v) => setTweak('showLegend', v)}
        />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
