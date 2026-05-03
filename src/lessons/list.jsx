/* Lesson 7: list rendering + keys */
const listLessonCode = `function PriceTable({ prices }) {
  return (
    <table>
      <tbody>
        {prices.map((row) => (
          <PriceRow key={row.id} row={row} />
        ))}
      </tbody>
    </table>
  );
}

// Bad example:
prices.map((row, index) => (
  <PriceRow key={index} row={row} />
));`;

let priceIdCounter = 100;

function ListDemo({ trace }){
  const initialPrices = [
    { id: 'ts-sd-1', product: 'Cola 12 x 330ml', retailer: 'Tesco', shelfPrice: 5.50 },
    { id: 'ts-sd-2', product: 'Orange Fizz 2L', retailer: 'Tesco', shelfPrice: 1.85 },
    { id: 'ts-sd-3', product: 'Lemonade 2L', retailer: 'Tesco', shelfPrice: 2.15 },
  ];
  const [prices, setPrices] = React.useState(initialPrices);
  const renderRef = React.useRef(0);
  renderRef.current++;

  React.useEffect(() => {
    trace.log('mount', 'PriceTable mounted', `${prices.length} initial price rows`);
  }, []);

  const add = () => {
    const id = `new-${++priceIdCounter}`;
    const products = [
      { product: 'Sparkling Water 12pk', shelfPrice: 4.20 },
      { product: 'Sharing Crisps 180g', shelfPrice: 2.30 },
      { product: 'Ground Coffee 227g', shelfPrice: 4.95 },
    ];
    const next = products[Math.floor(Math.random() * products.length)];
    trace.tick();
    trace.log('event', 'onClick add row', '');
    trace.log('state', `setPrices([..., { id: "${id}" }])`, '');
    trace.log('render', 'PriceTable', 'reason: prices state changed');
    setPrices(rows => [...rows, { id, retailer: 'Tesco', ...next }]);
  };

  const remove = (id) => {
    trace.tick();
    trace.log('event', 'onClick remove row', `id = "${id}"`);
    trace.log('state', `setPrices(filter id !== "${id}")`, '');
    trace.log('render', 'PriceTable', 'reason: prices state changed; stable keys preserve row identity');
    setPrices(rows => rows.filter(row => row.id !== id));
  };

  const shuffle = () => {
    trace.tick();
    trace.log('event', 'sort by price', 'rows reordered');
    trace.log('render', 'PriceTable', 'reason: row order changed; keys keep rows matched');
    setPrices(rows => [...rows].sort((a, b) => b.shelfPrice - a.shelfPrice));
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          <button className="chip" onClick={add}>add row</button>
          <button className="chip" onClick={shuffle}>sort by price</button>
          <button className="demo-reset" onClick={() => { setPrices(initialPrices); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
        <div className="data-table">
          <div className="th">
            <span>Product</span><span>Retailer</span><span>Shelf Price</span><span>Key</span><span>Action</span>
          </div>
          {prices.map(row => (
            <div key={row.id} className="tr">
              <span>{row.product}</span>
              <span>{row.retailer}</span>
              <span className="num">£{row.shelfPrice.toFixed(2)}</span>
              <span className="key-tag">key={row.id}</span>
              <button className="todo-x" onClick={() => remove(row.id)}>x</button>
            </div>
          ))}
          {prices.length === 0 && <div className="loading-row">empty table</div>}
        </div>
        <div className="small-code">
          Bad: key=&#123;index&#125; when rows can be inserted, removed, or reordered.
        </div>
        <div className="demo-meta">
          <span>{prices.length} rows</span>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>Keys</b> tell React which row is which across renders. Product IDs are stable, so React can track row identity when pricing rows move or disappear.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'PriceTableDemo', entries: [
            { key: 'prices.length', value: prices.length, changed: prices.length !== 3 },
            { key: 'rowIds', value: prices.map(row => row.id), changed: false },
          ]},
          { label: 'props', color: 'var(--accent)', component: 'PriceRow', entries: [
            { key: 'row', value: prices[0] || null, changed: false },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_list = {
  id: 'list',
  title: 'Lists & keys',
  subtitle: 'stable product IDs',
  code: listLessonCode,
  highlightLines: [5, 6, 14, 15],
  interviewAnswer: 'Using stable IDs helps React track list items correctly across re-renders. Index keys can cause bugs when rows are inserted, removed, or reordered because React may match the wrong component instance to the wrong data row.',
  notes: [
    { title: 'Why keys?', body: 'React uses keys to match items across renders. Without them or with index keys, React cannot tell if an item moved or changed, and may rebuild DOM unnecessarily.' },
    { title: 'Use stable IDs', body: 'A product or price-row ID is a strong key. The array index is a fallback only when the list never reorders.' },
  ],
  Demo: ListDemo,
};
