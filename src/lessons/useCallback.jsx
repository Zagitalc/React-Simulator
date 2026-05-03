/* Lesson: useCallback — Good vs Bad with PriceDashboard / memoized PriceRow */

const PRODUCTS = [
  { id: 'ts-sd-1', name: 'Cola 12 x 330ml',     retailer: 'Tesco',  category: 'soft drinks', price: 6.00 },
  { id: 'ts-sd-2', name: 'Sea Salt Crisps',     retailer: 'Tesco',  category: 'snacks',      price: 1.20 },
  { id: 'ts-cr-1', name: 'Sourdough Loaf',      retailer: 'Tesco',  category: 'bakery',      price: 2.40 },
  { id: 'oc-sd-1', name: 'Sparkling Water 6pk', retailer: 'Ocado',  category: 'soft drinks', price: 3.00 },
  { id: 'oc-cr-1', name: 'Croissant 4pk',       retailer: 'Ocado',  category: 'bakery',      price: 2.80 },
];

const useCallbackGoodCode = `function PriceDashboard() {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // stable function reference — same identity across renders
  const handleToggleWatch = useCallback((id) => {
    setSelectedIds((ids) =>
      ids.includes(id)
        ? ids.filter((rowId) => rowId !== id)
        : [...ids, id]
    );
  }, []);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.map((row) => (
        <PriceRow
          key={row.id}
          row={row}
          selected={selectedIds.includes(row.id)}
          onToggleWatch={handleToggleWatch}
        />
      ))}
    </>
  );
}

const PriceRow = React.memo(function PriceRow({ row, selected, onToggleWatch }) {
  return <button onClick={() => onToggleWatch(row.id)}>watch</button>;
});`;

const useCallbackBadCode = `function PriceDashboard() {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // ❌ recreated on every parent render — breaks React.memo
  const handleToggleWatch = (id) => {
    setSelectedIds((ids) =>
      ids.includes(id)
        ? ids.filter((rowId) => rowId !== id)
        : [...ids, id]
    );
  };

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.map((row) => (
        <PriceRow
          key={row.id}
          row={row}
          selected={selectedIds.includes(row.id)}
          onToggleWatch={handleToggleWatch}
        />
      ))}
    </>
  );
}`;

function makePriceRow({ stable }){
  const PriceRow = function PriceRow({ row, selected, onToggleWatch, trace }){
    React.useEffect(() => {
      trace && trace.bumpRender('PriceRow:' + row.id);
    });
    return (
      <div className={`tr ${selected ? 'watched' : ''}`}>
        <span>{row.name}</span>
        <span className="num">£{row.price.toFixed(2)}</span>
        <span className={`renders ${(trace && (trace.renderCounts['PriceRow:' + row.id] || 0) > 1) ? 'hot' : ''}`}>
          ×{(trace && trace.renderCounts['PriceRow:' + row.id]) || 1}
        </span>
        <button
          className={`watch-btn ${selected ? 'on' : ''}`}
          onClick={() => onToggleWatch(row.id)}
        >{selected ? '★ watched' : '☆ watch'}</button>
      </div>
    );
  };
  return stable ? React.memo(PriceRow) : PriceRow;
}

const PriceRowMemo = makePriceRow({ stable: true });

function makeDashboard({ stableCallback }){
  return function PriceDashboard({ trace }){
    const [query, setQuery] = React.useState('');
    const [selectedIds, setSelectedIds] = React.useState([]);
    const renderRef = React.useRef(0);
    renderRef.current++;

    React.useEffect(() => {
      trace.log('mount', 'PriceDashboard mounted', 'initial render');
    }, []);

    const prevQuery = React.useRef('');
    React.useEffect(() => {
      if (prevQuery.current !== query){
        trace.log('render', 'PriceDashboard re-rendered', `query = "${query}"`);
        const why = stableCallback
          ? 'useCallback returned the same function between renders'
          : 'normal functions are recreated on every parent render';
        trace.log(
          'prop',
          stableCallback
            ? 'onToggleWatch reference unchanged'
            : 'onToggleWatch got new function reference',
          `<PriceRow> propagation`,
          why
        );
        if (stableCallback){
          trace.log('memo', 'React.memo skipped unchanged rows', 'same props → same output', 'props identity stable');
        } else {
          trace.log('render', 'PriceRow rows re-rendered unnecessarily', 'every memoized row re-ran', 'function prop changed → React.memo bail-out failed');
        }
        prevQuery.current = query;
      }
    });

    const handleToggleWatchStable = React.useCallback((id) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }, []);

    const handleToggleWatchUnstable = (id) => {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    };

    const handleToggleWatch = stableCallback ? handleToggleWatchStable : handleToggleWatchUnstable;

    const onSearchChange = (e) => {
      const v = e.target.value;
      trace.tick();
      trace.log('event', 'onChange search input', `value = "${v}"`);
      trace.log('state', `setQuery("${v}")`, `was "${query}"`);
      setQuery(v);
    };

    const onWatchClick = (id) => {
      trace.tick();
      trace.log('event', 'onClick Watch', `row = ${id}`);
      trace.log(
        'state',
        `setSelectedIds(toggle ${id})`,
        selectedIds.includes(id) ? 'remove' : 'add'
      );
      handleToggleWatch(id);
    };

    const filtered = PRODUCTS.filter(p =>
      query.length === 0 || p.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div className="demo-frame">
        <div className="demo-stage">
          <input
            className="demo-input"
            placeholder="search products…"
            value={query}
            onChange={onSearchChange}
          />
          <div className="price-table">
            <div className="th">
              <span>Product</span>
              <span>Price</span>
              <span style={{textAlign:'right'}}>Renders</span>
              <span>Action</span>
            </div>
            {filtered.map(row => (
              <PriceRowMemo
                key={row.id}
                row={row}
                selected={selectedIds.includes(row.id)}
                onToggleWatch={onWatchClick}
                trace={trace}
              />
            ))}
            {filtered.length === 0 && (
              <div className="loading-row">no rows match "{query}"</div>
            )}
          </div>
          <div className="demo-meta">
            <span>parent renders: <b>{renderRef.current}</b></span>
            <span>callback identity: <b>{stableCallback ? 'stable' : 'new every render'}</b></span>
          </div>
        </div>
        <div className="demo-explainer">
          <p>
            Type in the search box. In <b>Good</b> mode, only <code>PriceDashboard</code> re-renders — the row counters stay flat because <code>onToggleWatch</code> is a stable reference and <code>React.memo</code> can skip unchanged rows.
            In <b>Bad</b> mode, the inline closure is a new value on every render, <code>React.memo</code> bails out, and every row re-renders.
          </p>
        </div>
        <Inspector
          renderCount={renderRef.current}
          renderCounts={trace.renderCounts}
          groups={[
            { label: 'state', color: 'var(--accent-2)', component: 'PriceDashboard', entries: [
              { key: 'query', value: query, changed: query.length > 0 },
              { key: 'selectedIds', value: selectedIds, changed: selectedIds.length > 0 },
            ]},
          ]}
        />
      </div>
    );
  };
}

const UseCallbackGoodDemo = makeDashboard({ stableCallback: true });
const UseCallbackBadDemo  = makeDashboard({ stableCallback: false });

window.LESSON_useCallback = {
  id: 'useCallback',
  title: 'useCallback',
  subtitle: 'stable function references for memoized children',
  code: useCallbackGoodCode,
  highlightLines: [6, 7, 8, 9, 10, 11, 12],
  notes: [
    { title: 'Why useCallback?', body: 'It returns the same function across renders so memoized children can skip work. Without it, every render hands children a brand-new function prop.' },
    { title: 'React.memo + stable props', body: 'React.memo only skips re-rendering when props are referentially equal. A new function = new prop = no skip.' },
  ],
  variants: {
    good: { code: useCallbackGoodCode, highlightLines: [6, 7, 8, 9, 10, 11, 12], Demo: UseCallbackGoodDemo },
    bad:  { code: useCallbackBadCode,  highlightLines: [5, 6, 7, 8, 9, 10, 11], Demo: UseCallbackBadDemo },
  },
  challenge: {
    prompt: 'Type "c" in the search box. Why did PriceDashboard re-render but PriceRow did not (Good mode)? And why did all rows re-render in Bad mode?',
    answer: 'Typing changes query state in the parent, so PriceDashboard re-renders. In Good mode, useCallback returned the same handleToggleWatch function reference, so the prop passed to each memoized PriceRow was unchanged — React.memo bailed out and skipped rendering. In Bad mode, the inline arrow function is a brand-new value every render. React.memo does a shallow prop comparison, sees a different function reference, and re-renders every row.'
  },
  types: `// Domain types passed across the dashboard
type PriceRowData = {
  id: string;
  name: string;
  retailer: 'Tesco' | 'Ocado';
  category: 'soft drinks' | 'snacks' | 'bakery';
  price: number;
};

type PriceRowProps = {
  row: PriceRowData;
  selected: boolean;
  onToggleWatch: (id: string) => void;
};

// useCallback signature
function useCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList
): T;`,
  backend: {
    language: 'ts',
    source: `// Koa-style route that the dashboard calls
router.get('/api/prices', async (ctx) => {
  const { retailer, category, q } = ctx.query;
  const rows = await db.query(/* see SQL tab */, {
    retailer,
    category,
    q: q ? \`%\${q}%\` : '%',
  });
  ctx.body = rows;
});`,
    flow: [
      'user types in search → onChange handler',
      'setQuery → React schedules re-render',
      'PriceDashboard re-renders (filtered list recomputed locally)',
      'in real app: useEffect with [query] would fire and call /api/prices',
      'backend reads query, runs SQL, returns rows',
      'setRows → table re-renders',
    ],
  },
  sql: {
    template: `SELECT
  p.name,
  r.name AS retailer,
  ps.shelf_price,
  ps.promo_price
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN products p           ON rp.product_id          = p.id
JOIN retailers r          ON rp.retailer_id         = r.id
WHERE r.name = :retailer
  AND p.category = :category
  AND p.name ILIKE :q
ORDER BY ps.captured_at DESC;`,
    params: (s) => ({ retailer: 'Tesco', category: 'soft drinks', q: s.query ? `%${s.query}%` : '%' }),
  },
  Demo: UseCallbackGoodDemo,
};
