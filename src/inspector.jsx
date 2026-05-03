/* State inspector - shows current values of state, props, render counts */

function formatValue(v){
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return `"${v}"`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)){
    if (v.length === 0) return '[]';
    if (v.length <= 3 && v.every(x => typeof x !== 'object')) return `[${v.map(formatValue).join(', ')}]`;
    return `Array(${v.length})`;
  }
  if (typeof v === 'object'){
    const keys = Object.keys(v);
    if (keys.length === 0) return '{}';
    if (keys.length <= 3) return `{${keys.map(k => `${k}: ${formatValue(v[k])}`).join(', ')}}`;
    return `Object(${keys.length} keys)`;
  }
  if (typeof v === 'function') return 'fn()';
  return String(v);
}

function Inspector({ groups, renderCount, renderCounts, typeRows }){
  const rcEntries = renderCounts ? Object.entries(renderCounts) : [];
  return (
    <div className="inspector">
      <div className="panel-head">
        <div className="panel-title">
          <span className="dot" style={{background:'var(--accent-2)'}}></span>
          Inspector
        </div>
        {typeof renderCount === 'number' && (
          <span className="render-pill">renders: <b>{renderCount}</b></span>
        )}
      </div>
      <div className="inspector-body">
        {groups.map((g, i) => (
          <div key={i} className="insp-group">
            <div className="insp-label">
              <span style={{color: g.color || 'var(--fg-dim)'}}>{g.label}</span>
              {g.component && <span className="insp-comp">‹{g.component}›</span>}
            </div>
            <div className="insp-rows">
              {g.entries.length === 0 && <div className="insp-empty">— none —</div>}
              {g.entries.map((e, j) => (
                <div key={j} className={`insp-row ${e.changed ? 'changed' : ''}`}>
                  <span className="insp-key">{e.key}</span>
                  <span className="insp-eq">=</span>
                  <span className={`insp-val v-${typeof e.value}`}>{formatValue(e.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {rcEntries.length > 0 && (
          <div className="insp-group">
            <div className="insp-label">
              <span style={{color: 'var(--accent-3)'}}>render counts</span>
            </div>
            <div className="insp-rows">
              {rcEntries.map(([k, v]) => (
                <div key={k} className="insp-row">
                  <span className="insp-key">{k}</span>
                  <span className="insp-eq">×</span>
                  <span className="insp-val v-number">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {typeRows && typeRows.length > 0 && (
          <div className="insp-group">
            <div className="insp-label">
              <span style={{color: 'var(--accent-5)'}}>type check</span>
            </div>
            <div className="insp-rows">
              {typeRows.map((r, i) => (
                <div key={i} className="insp-row">
                  <span className="insp-key">{r.key}</span>
                  <span className="insp-eq">:</span>
                  <span className="insp-val v-string">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.Inspector = Inspector;
window.formatValue = formatValue;
