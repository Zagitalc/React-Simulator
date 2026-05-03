/* Lesson 3: props */
const propsLessonCode = `function PriceDashboard() {
  const [retailer, setRetailer] = useState("Tesco");
  const prices = [
    { id: 1, product: "Cola 12 x 330ml", shelfPrice: 5.50 },
    { id: 2, product: "Orange Fizz 2L", shelfPrice: 1.85 },
  ];

  return (
    <PriceTable
      prices={prices}
      loading={false}
      selectedRetailer={retailer}
    />
  );
}

function PriceTable({ prices, loading, selectedRetailer }) {
  return <table>{/* render pricing rows */}</table>;
}`;

const PROPS_PRICES = [
  { id: 'ts-sd-1', product: 'Cola 12 x 330ml', retailer: 'Tesco', shelfPrice: 5.50, promoPrice: 4.25, date: '2026-05-01' },
  { id: 'ts-sd-2', product: 'Orange Fizz 2L', retailer: 'Tesco', shelfPrice: 1.85, promoPrice: 1.35, date: '2026-05-02' },
];

function PropsDemo({ trace }){
  const [retailer, setRetailer] = React.useState('Tesco');
  const [loading, setLoading] = React.useState(false);
  const parentRenders = React.useRef(0);
  parentRenders.current++;

  React.useEffect(() => {
    trace.log('mount', 'PriceDashboard mounted', 'parent owns state');
    trace.log('prop', '<PriceTable>', 'prices = Array(2), loading = false, selectedRetailer = "Tesco"');
  }, []);

  const handleRetailer = (value) => {
    if (value === retailer) return;
    trace.tick();
    trace.log('event', 'onClick retailer filter', `value = "${value}"`);
    trace.log('state', `setRetailer("${value}")`, 'parent state changed');
    trace.log('render', 'PriceDashboard', 'reason: retailer state changed');
    trace.log('prop', '<PriceTable>', `selectedRetailer = "${value}"`);
    trace.log('render', 'PriceTable', 'reason: selectedRetailer prop changed');
    setRetailer(value);
  };

  const toggleLoading = () => {
    trace.tick();
    trace.log('event', 'toggle loading', '');
    trace.log('state', `setLoading(${!loading})`, 'parent state changed');
    trace.log('prop', '<PriceTable>', `loading = ${!loading}`);
    trace.log('render', 'PriceTable', 'reason: loading prop changed');
    setLoading(v => !v);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="parent-card">
          <div className="card-tag">PriceDashboard <span className="card-sub">parent</span></div>
          <div className="filter-row">
            {['Tesco',"Sainsbury's",'Ocado'].map(r => (
              <button key={r} className={`chip ${retailer === r ? 'on' : ''}`} onClick={() => handleRetailer(r)}>{r}</button>
            ))}
            <button className={`chip ${loading ? 'on' : ''}`} onClick={toggleLoading}>loading</button>
          </div>
          <div className="prop-arrow">
            <span>prices, loading, selectedRetailer</span>
            <span className="arrow">↓</span>
          </div>
          <div className="child-card">
            <div className="card-tag">PriceTable <span className="card-sub">child</span></div>
            <div className="data-table">
              <div className="th">
                <span>Product</span><span>Retailer</span><span>Shelf Price</span><span>Promo Price</span><span>Date</span>
              </div>
              {loading && <div className="loading-row"><span className="spinner"></span> loading rows</div>}
              {!loading && PROPS_PRICES.map(row => (
                <div key={row.id} className="tr">
                  <span>{row.product}</span>
                  <span>{retailer}</span>
                  <span className="num">£{row.shelfPrice.toFixed(2)}</span>
                  <span className="promo">£{row.promoPrice.toFixed(2)}</span>
                  <span className="date">{row.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="demo-meta">
          <span>parent renders: <b>{parentRenders.current}</b></span>
          <button className="demo-reset" onClick={() => { setRetailer('Tesco'); setLoading(false); trace.clear(); parentRenders.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>Props</b> flow downward. <code>PriceDashboard</code> owns the filter and data state, then passes table-ready values into <code>PriceTable</code>.</p>
      </div>
      <Inspector
        renderCount={parentRenders.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'PriceDashboard', entries: [
            { key: 'retailer', value: retailer, changed: retailer !== 'Tesco' },
            { key: 'loading', value: loading, changed: loading },
          ]},
          { label: 'props', color: 'var(--accent)', component: 'PriceTable', entries: [
            { key: 'prices', value: PROPS_PRICES, changed: false },
            { key: 'loading', value: loading, changed: loading },
            { key: 'selectedRetailer', value: retailer, changed: retailer !== 'Tesco' },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_props = {
  id: 'props',
  title: 'Props',
  subtitle: 'parent state to table',
  code: propsLessonCode,
  highlightLines: [9, 10, 11, 12, 17],
  interviewAnswer: 'The parent owns the state. It passes filtered data and loading state into the child table as props, so the child can stay focused on rendering rows and does not need to know where the data came from.',
  notes: [
    { title: 'One-way data flow', body: 'Parent state moves down into child props. To change data, the child would call a callback prop and let the parent update state.' },
    { title: 'Prop changes can re-render children', body: 'When PriceDashboard re-renders with changed props, PriceTable receives the new values and renders the right table state.' },
  ],
  types: `type Retailer = 'Tesco' | "Sainsbury's" | 'Ocado';

type PriceRow = {
  id: string;
  product: string;
  retailer: Retailer;
  shelfPrice: number;
  promoPrice: number | null;
  date: string;
};

type PriceTableProps = {
  prices: PriceRow[];
  loading: boolean;
  selectedRetailer: Retailer;
};

function PriceTable(props: PriceTableProps): JSX.Element {
  const { prices, loading, selectedRetailer } = props;
  return <table>{/* render rows */}</table>;
}`,
  challenge: {
    prompt: 'When the parent updates a prop, why does the child re-render even though its own state has not changed?',
    answer: 'A child renders whenever its parent renders — that is how React propagates new prop values down. To skip the child render when its props are the same, wrap the child in React.memo (and keep callback props stable with useCallback). Without memo, React always re-runs the child function to diff its output against the previous JSX.'
  },
  Demo: PropsDemo,
};
