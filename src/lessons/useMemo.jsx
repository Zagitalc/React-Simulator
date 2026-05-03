/* Lesson 5: useMemo */
const useMemoLessonCode = `function PriceStats({ items }) {
  const [filter, setFilter] = useState("");

  const average = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, it) =>
      sum + it.price, 0) / items.length;
  }, [items]);

  return (
    <div>
      <input value={filter}
        onChange={(e) => setFilter(e.target.value)} />
      <p>Average: \${average.toFixed(2)}</p>
    </div>
  );
}`;

const MEMO_ITEMS_A = [
  { id:1, name:'Apple',   price:1.20 },
  { id:2, name:'Banana',  price:0.40 },
  { id:3, name:'Mango',   price:2.10 },
  { id:4, name:'Pear',    price:1.80 },
];
const MEMO_ITEMS_B = [
  { id:5, name:'Croissant', price:2.50 },
  { id:6, name:'Sourdough', price:5.00 },
  { id:7, name:'Bagel',     price:1.75 },
];

function UseMemoDemo({ trace }){
  const [dataset, setDataset] = React.useState('A');
  const [filter, setFilter] = React.useState('');
  const items = dataset === 'A' ? MEMO_ITEMS_A : MEMO_ITEMS_B;
  const renderRef = React.useRef(0);
  renderRef.current++;
  const computeCount = React.useRef(0);

  React.useEffect(() => { trace.log('mount', 'PriceStats mounted', ''); }, []);

  const average = React.useMemo(() => {
    computeCount.current++;
    trace.tick();
    trace.log('memo', 'computing average', `iterating ${items.length} items`);
    if (!items.length) return 0;
    return items.reduce((s, it) => s + it.price, 0) / items.length;
  }, [items]);

  const handleType = (e) => {
    const v = e.target.value;
    trace.tick();
    trace.log('event', 'onChange filter', `value = "${v}"`);
    trace.log('state', `setFilter("${v}")`, 're-render coming, but memo will SKIP');
    setFilter(v);
  };

  const swap = (k) => {
    if (k === dataset) return;
    trace.tick();
    trace.log('event', 'switched dataset', `→ ${k}`);
    trace.log('state', `setDataset("${k}")`, 'items changed, memo will RECOMPUTE');
    setDataset(k);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          <button className={`chip ${dataset==='A'?'on':''}`} onClick={() => swap('A')}>dataset A</button>
          <button className={`chip ${dataset==='B'?'on':''}`} onClick={() => swap('B')}>dataset B</button>
        </div>
        <input
          className="demo-input"
          value={filter}
          onChange={handleType}
          placeholder="Type here — memo should NOT recompute"
        />
        <div className="stat-card">
          <div className="stat-label">average price</div>
          <div className="stat-value">${average.toFixed(2)}</div>
          <div className="stat-sub">computed <b>{computeCount.current}</b>× • rendered <b>{renderRef.current}</b>×</div>
        </div>
        <div className="demo-meta">
          <button className="demo-reset" onClick={() => { setFilter(''); setDataset('A'); trace.clear(); renderRef.current = 0; computeCount.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>useMemo</b> caches a computed value between renders. As long as the dependencies (<code>[items]</code>) haven't changed, React reuses the previous result instead of recomputing.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'PriceStats', entries: [
            { key: 'filter',  value: filter, changed: filter !== '' },
            { key: 'dataset', value: dataset, changed: dataset !== 'A' },
          ]},
          { label: 'memo', color: 'var(--accent-5)', component: 'PriceStats', entries: [
            { key: 'average', value: Number(average.toFixed(2)), changed: false },
            { key: 'computes', value: computeCount.current, changed: false },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useMemo = {
  id: 'useMemo',
  title: 'useMemo',
  subtitle: 'cache derived values',
  code: useMemoLessonCode,
  highlightLines: [4, 8],
  notes: [
    { title: 'When to reach for it', body: 'Only when a computation is genuinely expensive, or when the result must be referentially stable (e.g. fed into another memo or effect dep array).' },
    { title: 'Not for free', body: 'useMemo itself has overhead. For cheap operations, plain reassignment is faster than memoizing.' },
    { title: 'Try it', body: 'Type into the input — the component re-renders but the memo notices items has not changed and skips. Switch dataset — memo recomputes.' },
  ],
  Demo: UseMemoDemo,
};
