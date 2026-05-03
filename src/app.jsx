/* App shell */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const LESSONS = [
  window.LESSON_useState,
  window.LESSON_controlled,
  window.LESSON_props,
  window.LESSON_useEffect,
  window.LESSON_useMemo,
  window.LESSON_useCallback,
  window.LESSON_list,
];

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
  const trace = useTrace();

  const lesson = LESSONS.find(l => l.id === activeId) || LESSONS[0];

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

  // clear timeline when lesson changes
  useEffect(() => { trace.clear(); }, [activeId]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⟨ R ⟩</span>
          <span className="brand-name">Retail React Interview Simulator</span>
          <span className="brand-tag">pricing dashboard visual debugger</span>
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
                <div className="legend-row"><span style={{color:'var(--accent-3)'}}>▲</span> EVENT</div>
                <div className="legend-row"><span style={{color:'var(--accent-2)'}}>●</span> STATE</div>
                <div className="legend-row"><span style={{color:'var(--accent)'}}>◆</span> RENDER</div>
                <div className="legend-row"><span style={{color:'var(--accent-5)'}}>✦</span> EFFECT</div>
                <div className="legend-row"><span style={{color:'var(--accent-4)'}}>↓</span> FETCH</div>
                <div className="legend-row"><span style={{color:'var(--accent-5)'}}>✣</span> MEMO</div>
                <div className="legend-row"><span style={{color:'var(--accent)'}}>→</span> PROP</div>
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
            </div>
            <div className="code-wrap">
              <CodeBlock code={lesson.code} highlightLines={lesson.highlightLines} />
            </div>
          {t.showNotes && (lesson.interviewAnswer || lesson.notes) && (
            <div className="notes">
              {lesson.interviewAnswer && (
                <div className="interview-answer">
                  <div className="answer-label">Interview answer</div>
                  <div className="answer-body">{lesson.interviewAnswer}</div>
                </div>
              )}
              {(lesson.notes || []).map((n, i) => (
                <div key={i} className="note">
                  <div className="note-title">{n.title}</div>
                    <div className="note-body">{n.body}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="pane preview-pane">
            <div className="panel-head">
              <div className="panel-title">
                <span className="dot" style={{background:'var(--accent-2)'}}></span>
                Preview
              </div>
              <span className="panel-sub">live component</span>
            </div>
            <div className="preview-wrap">
              <lesson.Demo trace={trace} key={lesson.id} />
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
