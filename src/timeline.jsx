/* Timeline component shows the sequence of React events */

const EVENT_META = {
  render:    { icon: '◆', color: 'var(--accent)',   label: 'RENDER' },
  state:     { icon: '●', color: 'var(--accent-2)', label: 'STATE' },
  event:     { icon: '▲', color: 'var(--accent-3)', label: 'EVENT' },
  effect:    { icon: '✦', color: 'var(--accent-5)', label: 'EFFECT' },
  fetch:     { icon: '↓', color: 'var(--accent-4)', label: 'FETCH' },
  mount:     { icon: '○', color: 'var(--fg-dim)',   label: 'MOUNT' },
  prop:      { icon: '→', color: 'var(--accent)',   label: 'PROP' },
  memo:      { icon: '✣', color: 'var(--accent-5)', label: 'MEMO' },
};

function Timeline({ events, onClear }){
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [events.length]);

  return (
    <div className="timeline">
      <div className="panel-head">
        <div className="panel-title">
          <span className="dot" style={{background:'var(--accent-3)'}}></span>
          Event Timeline
        </div>
        <button className="btn-ghost" onClick={onClear}>clear</button>
      </div>
      <div className="timeline-body" ref={ref}>
        {events.length === 0 && (
          <div className="empty">
            <div>No events yet.</div>
            <div className="hint">Interact with the preview to see what React does.</div>
          </div>
        )}
        {events.map((e, i) => {
          const meta = EVENT_META[e.kind] || EVENT_META.render;
          const prev = events[i-1];
          const groupBreak = !prev || prev.tick !== e.tick;
          return (
            <React.Fragment key={i}>
              {groupBreak && i > 0 && <div className="timeline-break"></div>}
              <div className={`tl-row tl-${e.kind}`}>
                <span className="tl-tick">{String(i+1).padStart(2,'0')}</span>
                <span className="tl-icon" style={{color: meta.color}}>{meta.icon}</span>
                <span className="tl-kind" style={{color: meta.color}}>{meta.label}</span>
                <span className="tl-msg">{e.msg}</span>
                {e.detail && <span className="tl-detail">{e.detail}</span>}
                {e.why && <span className="tl-why">why: {e.why}</span>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

window.Timeline = Timeline;

/* Hook: produce an event logger + state inspector data */
function useTrace(){
  const [events, setEvents] = React.useState([]);
  const [renderCounts, setRenderCounts] = React.useState({});
  const tickRef = React.useRef(0);
  const log = React.useCallback((kind, msg, detail, why) => {
    setEvents(prev => [...prev, { kind, msg, detail, why, tick: tickRef.current, t: Date.now() }]);
  }, []);
  const tick = React.useCallback(() => { tickRef.current++; }, []);
  const bumpRender = React.useCallback((key) => {
    setRenderCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, []);
  const clear = React.useCallback(() => {
    setEvents([]);
    setRenderCounts({});
    tickRef.current = 0;
  }, []);
  // Keep the returned object identity-stable so memoized children
  // that receive `trace` as a prop don't bail out unnecessarily.
  // We mutate fields on a ref and surface live values via getters.
  const apiRef = React.useRef(null);
  if (!apiRef.current){
    apiRef.current = { log, tick, clear, bumpRender };
    Object.defineProperty(apiRef.current, 'events', { get: () => apiRef.current._events });
    Object.defineProperty(apiRef.current, 'renderCounts', { get: () => apiRef.current._renderCounts });
  }
  apiRef.current._events = events;
  apiRef.current._renderCounts = renderCounts;
  return apiRef.current;
}

window.useTrace = useTrace;
