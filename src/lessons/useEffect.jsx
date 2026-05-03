/* Lesson 4: useEffect with mock API */
const useEffectLessonCode = `function PriceDashboard() {
  const [retailer, setRetailer] = useState("Tesco");
  const [category, setCategory] = useState("Soft Drinks");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(\`/api/prices?retailer=\${retailer}&category=\${category}\`)
      .then((res) => res.json())
      .then((data) => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load prices");
        setLoading(false);
      });
  }, [retailer, category]);

  return <PriceTable prices={prices} loading={loading} />;
}`;

const PRICE_DATA = {
  Tesco: {
    'Soft Drinks': [
      { id: 'ts-sd-1', product: 'Cola 12 x 330ml', retailer: 'Tesco', shelfPrice: 5.50, promoPrice: 4.25, date: '2026-05-01' },
      { id: 'ts-sd-2', product: 'Orange Fizz 2L', retailer: 'Tesco', shelfPrice: 1.85, promoPrice: 1.35, date: '2026-05-02' },
    ],
    Crisps: [
      { id: 'ts-cr-1', product: 'Sea Salt Crisps 6pk', retailer: 'Tesco', shelfPrice: 2.25, promoPrice: 1.75, date: '2026-05-01' },
      { id: 'ts-cr-2', product: 'Ridged Crisps 150g', retailer: 'Tesco', shelfPrice: 1.95, promoPrice: null, date: '2026-05-02' },
    ],
    Coffee: [
      { id: 'ts-co-1', product: 'Ground Coffee 227g', retailer: 'Tesco', shelfPrice: 4.80, promoPrice: 3.95, date: '2026-05-01' },
      { id: 'ts-co-2', product: 'Instant Coffee 200g', retailer: 'Tesco', shelfPrice: 6.40, promoPrice: 5.50, date: '2026-05-02' },
    ],
  },
  "Sainsbury's": {
    'Soft Drinks': [
      { id: 'sa-sd-1', product: 'Lemonade 2L', retailer: "Sainsbury's", shelfPrice: 1.75, promoPrice: 1.25, date: '2026-05-01' },
      { id: 'sa-sd-2', product: 'Cola Zero 8 x 330ml', retailer: "Sainsbury's", shelfPrice: 4.90, promoPrice: null, date: '2026-05-02' },
    ],
    Crisps: [
      { id: 'sa-cr-1', product: 'Cheese Crisps 6pk', retailer: "Sainsbury's", shelfPrice: 2.35, promoPrice: 1.85, date: '2026-05-01' },
      { id: 'sa-cr-2', product: 'Tortilla Chips 180g', retailer: "Sainsbury's", shelfPrice: 2.10, promoPrice: 1.60, date: '2026-05-02' },
    ],
    Coffee: [
      { id: 'sa-co-1', product: 'Espresso Beans 500g', retailer: "Sainsbury's", shelfPrice: 7.25, promoPrice: 6.00, date: '2026-05-01' },
      { id: 'sa-co-2', product: 'Decaf Instant 100g', retailer: "Sainsbury's", shelfPrice: 3.90, promoPrice: null, date: '2026-05-02' },
    ],
  },
  Ocado: {
    'Soft Drinks': [
      { id: 'oc-sd-1', product: 'Sparkling Water 12pk', retailer: 'Ocado', shelfPrice: 4.20, promoPrice: 3.60, date: '2026-05-01' },
      { id: 'oc-sd-2', product: 'Ginger Beer 4pk', retailer: 'Ocado', shelfPrice: 3.40, promoPrice: null, date: '2026-05-02' },
    ],
    Crisps: [
      { id: 'oc-cr-1', product: 'Vegetable Crisps 100g', retailer: 'Ocado', shelfPrice: 2.60, promoPrice: 2.00, date: '2026-05-01' },
      { id: 'oc-cr-2', product: 'Sharing Crisps 180g', retailer: 'Ocado', shelfPrice: 2.30, promoPrice: 1.90, date: '2026-05-02' },
    ],
    Coffee: [
      { id: 'oc-co-1', product: 'Cold Brew Cans 4pk', retailer: 'Ocado', shelfPrice: 5.80, promoPrice: 4.75, date: '2026-05-01' },
      { id: 'oc-co-2', product: 'Filter Coffee 250g', retailer: 'Ocado', shelfPrice: 4.65, promoPrice: null, date: '2026-05-02' },
    ],
  },
};

function UseEffectDemo({ trace }){
  const [retailer, setRetailer] = React.useState('Tesco');
  const [category, setCategory] = React.useState('Soft Drinks');
  const [prices, setPrices] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const renderRef = React.useRef(0);
  renderRef.current++;
  const requestId = React.useRef(0);
  const initialRenderLogged = React.useRef(false);

  React.useEffect(() => {
    trace.log('mount', 'PriceDashboard mounted', 'retailer = "Tesco", category = "Soft Drinks"');
  }, []);

  React.useEffect(() => {
    if (initialRenderLogged.current){
      trace.log('render', 'PriceDashboard', `reason: ${retailer} / ${category} filter state changed`);
    } else {
      initialRenderLogged.current = true;
    }
    trace.tick();
    trace.log('effect', 'useEffect ran', `deps changed: retailer = "${retailer}", category = "${category}"`);
    trace.log('state', 'setLoading(true)', '');
    trace.log('state', 'setError(null)', '');
    trace.log('fetch', `GET /api/prices?retailer=${retailer}&category=${category}`, 'request sent (700ms)');
    setLoading(true);
    setError(null);
    const myId = ++requestId.current;
    const t = setTimeout(() => {
      if (myId !== requestId.current) return; // staleness guard
      if (category === 'Coffee' && retailer === 'Ocado'){
        trace.tick();
        trace.log('fetch', '500 Error', 'pricing API failed');
        trace.log('state', 'setError("Could not load prices")', '');
        trace.log('state', 'setLoading(false)', '');
        trace.log('render', 'PriceDashboard', 'reason: error state changed');
        setPrices([]);
        setError('Could not load prices');
        setLoading(false);
        return;
      }
      const data = PRICE_DATA[retailer][category] || [];
      trace.tick();
      trace.log('fetch', `200 OK`, `${data.length} price rows returned`);
      trace.log('state', `setPrices([…${data.length}])`, 'data into state');
      trace.log('state', 'setLoading(false)', '');
      trace.log('render', 'PriceTable', 'reason: prices prop changed');
      trace.log('prop', '<PriceTable>', `prices = Array(${data.length}), loading = false, selectedRetailer = "${retailer}"`);
      setPrices(data);
      setLoading(false);
    }, 700);
    return () => {
      clearTimeout(t);
    };
  }, [retailer, category]);

  const changeRetailer = (value) => {
    if (value === retailer) return;
    trace.tick();
    trace.log('event', 'onClick retailer filter', `retailer = "${value}"`);
    trace.log('state', `setRetailer("${value}")`, '');
    setRetailer(value);
  };

  const changeCategory = (value) => {
    if (value === category) return;
    trace.tick();
    trace.log('event', 'onClick category filter', `category = "${value}"`);
    trace.log('state', `setCategory("${value}")`, '');
    setCategory(value);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          {['Tesco',"Sainsbury's",'Ocado'].map(r => (
            <button
              key={r}
              className={`chip ${retailer===r?'on':''}`}
              onClick={() => changeRetailer(r)}
            >{r}</button>
          ))}
        </div>
        <div className="filter-row">
          {['Soft Drinks','Crisps','Coffee'].map(c => (
            <button
              key={c}
              className={`chip ${category===c?'on':''}`}
              onClick={() => changeCategory(c)}
            >{c}</button>
          ))}
        </div>
        <div className="data-table">
          <div className="th">
            <span>Product</span><span>Retailer</span><span>Shelf Price</span><span>Promo Price</span><span>Date</span>
          </div>
          {loading && (
            <div className="loading-row">
              <span className="spinner"></span> fetching {retailer} / {category}
            </div>
          )}
          {!loading && error && <div className="error-row">{error}</div>}
          {!loading && !error && prices.map(row => (
            <div key={row.id} className="tr">
              <span>{row.product}</span>
              <span>{row.retailer}</span>
              <span className="num">£{row.shelfPrice.toFixed(2)}</span>
              <span className="promo">{row.promoPrice ? `£${row.promoPrice.toFixed(2)}` : '-'}</span>
              <span className="date">{row.date}</span>
            </div>
          ))}
          {!loading && !error && prices.length === 0 && <div className="loading-row">no rows</div>}
        </div>
        <div className="demo-meta">
          <span>renders: <b>{renderRef.current}</b></span>
          <button className="demo-reset" onClick={() => { setRetailer('Tesco'); setCategory('Soft Drinks'); setPrices([]); setError(null); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>useEffect</b> runs side effects after render. The dependency array <code>[retailer, category]</code> tells React to fetch again when either filter changes.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'PriceDashboard', entries: [
            { key: 'retailer', value: retailer, changed: retailer !== 'Tesco' },
            { key: 'category', value: category, changed: category !== 'Soft Drinks' },
            { key: 'prices',   value: prices, changed: prices.length > 0 },
            { key: 'loading',  value: loading, changed: loading },
            { key: 'error',    value: error, changed: !!error },
          ]},
          { label: 'effect', color: 'var(--accent-5)', component: 'PriceDashboard', entries: [
            { key: 'deps', value: [retailer, category], changed: false },
          ]},
          { label: 'props', color: 'var(--accent)', component: 'PriceTable', entries: [
            { key: 'prices', value: prices, changed: prices.length > 0 },
            { key: 'loading', value: loading, changed: loading },
            { key: 'selectedRetailer', value: retailer, changed: retailer !== 'Tesco' },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useEffect = {
  id: 'useEffect',
  title: 'useEffect',
  subtitle: 'API fetch + dependencies',
  code: useEffectLessonCode,
  highlightLines: [2, 3, 7, 18],
  interviewAnswer: 'useEffect is used for side effects like API calls. In this example, when retailer or category changes, React re-renders and then runs the effect because those values are in the dependency array. The effect fetches new pricing data and updates loading, success, and error state when the response returns.',
  notes: [
    { title: 'Side effects, not pure', body: 'Render functions should be pure. Anything that touches the outside world, such as fetch, subscriptions, or timers, goes in useEffect.' },
    { title: 'The dependency array', body: '[] = run once after mount. [a, b] = run when a or b changes. Omitted = run after every render (rarely what you want).' },
    { title: 'Explicit request states', body: 'This demo models loading, success, and error states instead of assuming that every API call succeeds.' },
  ],
  Demo: UseEffectDemo,
};
