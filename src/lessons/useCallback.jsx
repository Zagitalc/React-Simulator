/* Lesson 6: useCallback */
const useCallbackLessonCode = `const PriceRow = memo(function PriceRow({
  row,
  selected,
  onToggleWatch
}) {
  return (
    <tr>
      <td>{row.product}</td>
      <td>£{row.shelfPrice.toFixed(2)}</td>
      <td>
        <button onClick={() => onToggleWatch(row.id)}>
          {selected ? "Watching" : "Watch"}
        </button>
      </td>
    </tr>
  );
});

function PriceDashboard({ prices }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");

  const handleToggleWatch = useCallback((id) => {
    setSelectedIds((ids) =>
      ids.includes(id)
        ? ids.filter((rowId) => rowId !== id)
        : [...ids, id]
    );
  }, []);

  return prices.map((row) => (
    <PriceRow
      key={row.id}
      row={row}
      selected={selectedIds.includes(row.id)}
      onToggleWatch={handleToggleWatch}
    />
  ));
}`;

const CALLBACK_PRICES = [
  { id: 'ts-sd-1', product: 'Cola 12 x 330ml', retailer: 'Tesco', shelfPrice: 5.50, promoPrice: 4.25, date: '2026-05-01' },
  { id: 'ts-sd-2', product: 'Orange Fizz 2L', retailer: 'Tesco', shelfPrice: 1.85, promoPrice: 1.35, date: '2026-05-02' },
  { id: 'ts-cr-1', product: 'Sea Salt Crisps 6pk', retailer: 'Tesco', shelfPrice: 2.25, promoPrice: 1.75, date: '2026-05-01' },
];

const PriceRowPreview = React.memo(function PriceRowPreview({ row, selected, onToggleWatch, traceRender }){
  React.useEffect(() => {
    traceRender(row.id);
  });

  return (
    <div className="tr">
      <span>{row.product}</span>
      <span>{row.retailer}</span>
      <span className="num">£{row.shelfPrice.toFixed(2)}</span>
      <span className="promo">{selected ? 'Watching' : 'Not watched'}</span>
      <button className="todo-x" onClick={() => onToggleWatch(row.id)}>{selected ? 'remove' : 'watch'}</button>
    </div>
  );
});

function UseCallbackDemo({ trace }){
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const renderRef = React.useRef(0);
  const rowRenderCounts = React.useRef({});
  const callbackRef = React.useRef(null);
  renderRef.current++;

  const handleToggleWatch = React.useCallback((id) => {
    trace.tick();
    trace.log('event', 'onClick watch row', `id = "${id}"`);
    trace.log('state', 'setSelectedIds(updater)', 'watchlist state changed');
    trace.log('render', 'PriceDashboard', 'reason: selectedIds state changed');
    setSelectedIds(ids =>
      ids.includes(id)
        ? ids.filter(rowId => rowId !== id)
        : [...ids, id]
    );
  }, []);

  React.useEffect(() => {
    callbackRef.current = handleToggleWatch;
    trace.log('mount', 'PriceDashboard mounted', 'callback lesson');
    trace.log('memo', 'useCallback stored function', 'deps = []');
  }, [handleToggleWatch]);

  const traceRowRender = React.useCallback((id) => {
    rowRenderCounts.current[id] = (rowRenderCounts.current[id] || 0) + 1;
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    trace.tick();
    trace.log('event', 'onChange search', `value = "${value}"`);
    trace.log('state', `setQuery("${value}")`, 'parent re-renders; row callback prop remains stable');
    trace.log('render', 'PriceDashboard', 'reason: query state changed');
    trace.log('prop', '<PriceRow>', 'onToggleWatch function reference unchanged');
    setQuery(value);
  };

  const visiblePrices = CALLBACK_PRICES.filter(row =>
    row.product.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <input
          className="demo-input"
          value={query}
          onChange={handleSearch}
          placeholder="Search rows: callback stays stable"
        />
        <div className="data-table">
          <div className="th">
            <span>Product</span><span>Retailer</span><span>Shelf Price</span><span>Watchlist</span><span>Action</span>
          </div>
          {visiblePrices.map(row => (
            <PriceRowPreview
              key={row.id}
              row={row}
              selected={selectedIds.includes(row.id)}
              onToggleWatch={handleToggleWatch}
              traceRender={traceRowRender}
            />
          ))}
          {visiblePrices.length === 0 && <div className="loading-row">no rows match search</div>}
        </div>
        <div className="stat-card">
          <div className="stat-label">Callback identity</div>
          <div className="stat-sub">stable function prop passed to memoized rows</div>
        </div>
        <div className="demo-meta">
          <span>dashboard renders: <b>{renderRef.current}</b></span>
          <button className="demo-reset" onClick={() => { setSelectedIds([]); setQuery(''); trace.clear(); renderRef.current = 0; rowRenderCounts.current = {}; callbackRef.current = null; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>useCallback</b> memoizes a function reference. That matters when a handler is passed to memoized children, because a new function prop can make those children render again.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'PriceDashboard', entries: [
            { key: 'query', value: query, changed: query !== '' },
            { key: 'selectedIds', value: selectedIds, changed: selectedIds.length > 0 },
          ]},
          { label: 'props', color: 'var(--accent)', component: 'PriceRow', entries: [
            { key: 'onToggleWatch', value: 'stable fn()', changed: false },
            { key: 'selected', value: selectedIds.length > 0, changed: selectedIds.length > 0 },
          ]},
          { label: 'memo', color: 'var(--accent-5)', component: 'PriceRow', entries: [
            { key: 'React.memo', value: true, changed: false },
            { key: 'rowRenderCounts', value: rowRenderCounts.current, changed: false },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useCallback = {
  id: 'useCallback',
  title: 'useCallback',
  subtitle: 'stable handler props',
  code: useCallbackLessonCode,
  highlightLines: [21, 22, 28, 35],
  interviewAnswer: 'I would use useCallback when I pass a handler into memoized child components and function identity matters. In this dashboard, the parent can re-render for search input changes without creating a new onToggleWatch prop for every price row.',
  notes: [
    { title: 'What it memoizes', body: 'useCallback memoizes the function reference, not the result of calling the function. useMemo memoizes values; useCallback memoizes callbacks.' },
    { title: 'When it helps', body: 'It helps when the callback is passed to memoized children, used in dependency arrays, or needs stable identity for another hook.' },
    { title: 'When to skip it', body: 'Do not wrap every handler by default. If the function is cheap and not passed to memoized children, useCallback may add complexity without value.' },
  ],
  Demo: UseCallbackDemo,
};
