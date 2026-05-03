/* Lesson 5: useMemo */
const useMemoLessonCode = `function PriceStats({ prices }) {
  const [filter, setFilter] = useState("");

  const averagePrice = useMemo(() => {
    if (prices.length === 0) return 0;
    return prices.reduce((sum, item) =>
      sum + item.shelfPrice, 0) / prices.length;
  }, [prices]);

  const promotionCount = useMemo(() => {
    return prices.filter((item) => item.promoPrice).length;
  }, [prices]);

  return (
    <div>
      <input value={filter}
        onChange={(e) => setFilter(e.target.value)} />
      <p>Average shelf price: £{averagePrice.toFixed(2)}</p>
      <p>Promotion count: {promotionCount}</p>
    </div>
  );
}`;

const MEMO_PRICES_A = [
  { id:'ts-sd-1', product:'Cola 12 x 330ml', shelfPrice:5.50, promoPrice:4.25 },
  { id:'ts-sd-2', product:'Orange Fizz 2L', shelfPrice:1.85, promoPrice:1.35 },
  { id:'ts-sd-3', product:'Lemonade 2L', shelfPrice:2.15, promoPrice:null },
  { id:'ts-sd-4', product:'Energy Drink 4pk', shelfPrice:4.80, promoPrice:3.90 },
];
const MEMO_PRICES_B = [
  { id:'sa-co-1', product:'Espresso Beans 500g', shelfPrice:7.25, promoPrice:6.00 },
  { id:'sa-co-2', product:'Decaf Instant 100g', shelfPrice:3.90, promoPrice:null },
  { id:'sa-co-3', product:'Ground Coffee 227g', shelfPrice:4.95, promoPrice:4.20 },
];

function UseMemoDemo({ trace }){
  const [dataset, setDataset] = React.useState('Soft Drinks');
  const [filter, setFilter] = React.useState('');
  const prices = dataset === 'Soft Drinks' ? MEMO_PRICES_A : MEMO_PRICES_B;
  const renderRef = React.useRef(0);
  renderRef.current++;
  const computeCount = React.useRef(0);

  React.useEffect(() => { trace.log('mount', 'PriceStats mounted', ''); }, []);

  const averagePrice = React.useMemo(() => {
    computeCount.current++;
    trace.tick();
    trace.log('memo', 'MEMO recalculated', 'dependency changed: prices');
    if (!prices.length) return 0;
    return prices.reduce((sum, item) => sum + item.shelfPrice, 0) / prices.length;
  }, [prices]);

  const promotionCount = React.useMemo(() => {
    return prices.filter((item) => item.promoPrice).length;
  }, [prices]);

  const handleType = (e) => {
    const v = e.target.value;
    trace.tick();
    trace.log('event', 'onChange filter', `value = "${v}"`);
    trace.log('state', `setFilter("${v}")`, 'render reason: filter state changed, memo reuses prices result');
    trace.log('render', 'PriceStats', 'reason: filter state changed');
    setFilter(v);
  };

  const swap = (k) => {
    if (k === dataset) return;
    trace.tick();
    trace.log('event', 'switched category', `category = "${k}"`);
    trace.log('state', `setDataset("${k}")`, 'prices changed, memo will recalculate');
    trace.log('render', 'PriceStats', 'reason: prices state changed');
    setDataset(k);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          <button className={`chip ${dataset==='Soft Drinks'?'on':''}`} onClick={() => swap('Soft Drinks')}>Soft Drinks</button>
          <button className={`chip ${dataset==='Coffee'?'on':''}`} onClick={() => swap('Coffee')}>Coffee</button>
        </div>
        <input
          className="demo-input"
          value={filter}
          onChange={handleType}
          placeholder="Type here: memo should not recalculate"
        />
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Average shelf price</div>
            <div className="stat-value">£{averagePrice.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Promotion count</div>
            <div className="stat-value">{promotionCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-sub">memo recalculated <b>{computeCount.current}</b>x | rendered <b>{renderRef.current}</b>x</div>
        </div>
        <div className="demo-meta">
          <button className="demo-reset" onClick={() => { setFilter(''); setDataset('Soft Drinks'); trace.clear(); renderRef.current = 0; computeCount.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>useMemo</b> caches derived dashboard metrics. Typing in the filter re-renders the component, but the average only recalculates when <code>prices</code> changes.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'PriceStats', entries: [
            { key: 'filter',  value: filter, changed: filter !== '' },
            { key: 'dataset', value: dataset, changed: dataset !== 'Soft Drinks' },
            { key: 'prices', value: prices, changed: dataset !== 'Soft Drinks' },
          ]},
          { label: 'memo', color: 'var(--accent-5)', component: 'PriceStats', entries: [
            { key: 'averagePrice', value: Number(averagePrice.toFixed(2)), changed: false },
            { key: 'promotionCount', value: promotionCount, changed: false },
            { key: 'recalculations', value: computeCount.current, changed: false },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useMemo = {
  id: 'useMemo',
  title: 'useMemo',
  subtitle: 'derived dashboard metrics',
  code: useMemoLessonCode,
  highlightLines: [4, 8, 10, 12],
  interviewAnswer: 'I would use useMemo for derived values like average shelf price or promotion count, especially if the table is large. It keeps those calculations tied to the prices dependency, so unrelated state changes can re-render without repeating the work.',
  notes: [
    { title: 'When to reach for it', body: 'Only when a computation is genuinely expensive, or when the result must be referentially stable (e.g. fed into another memo or effect dep array).' },
    { title: 'Not for free', body: 'useMemo itself has overhead. For cheap operations, plain reassignment is faster than memoizing.' },
    { title: 'Try it', body: 'Type into the input: the component re-renders but prices has not changed, so the memoized average is reused. Switch category and the memo recalculates.' },
  ],
  Demo: UseMemoDemo,
};
