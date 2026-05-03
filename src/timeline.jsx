/* Timeline component shows the sequence of React events */

const EVENT_META = {
  render:    { icon: '◆', color: 'var(--accent)',   label: 'Render' },
  state:     { icon: '●', color: 'var(--accent-2)', label: 'State' },
  event:     { icon: '▲', color: 'var(--accent-3)', label: 'Event' },
  effect:    { icon: '✦', color: 'var(--accent-5)', label: 'Effect' },
  fetch:     { icon: '↓', color: 'var(--accent-4)', label: 'Fetch' },
  mount:     { icon: '○', color: 'var(--fg-dim)',   label: 'Mount' },
  prop:      { icon: '→', color: 'var(--accent)',   label: 'Prop' },
  memo:      { icon: '✣', color: 'var(--accent-5)', label: 'Memo' },
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
  const tickRef = React.useRef(0);
  const log = React.useCallback((kind, msg, detail) => {
    setEvents(prev => [...prev, { kind, msg, detail, tick: tickRef.current, t: Date.now() }]);
  }, []);
  const tick = React.useCallback(() => { tickRef.current++; }, []);
  const clear = React.useCallback(() => { setEvents([]); tickRef.current = 0; }, []);
  return { events, log, tick, clear };
}

window.useTrace = useTrace;
