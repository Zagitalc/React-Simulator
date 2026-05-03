/* Lesson 4: useEffect with mock API */
const useEffectLessonCode = `function ProductList() {
  const [category, setCategory] = useState("fruit");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(\`/api/items?cat=\${category}\`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [category]);

  return <Table items={items} loading={loading} />;
}`;

const MOCK_DATA = {
  fruit:  [{ id:1, name:'Apple', price:1.20 }, { id:2, name:'Banana', price:0.40 }, { id:3, name:'Mango', price:2.10 }],
  bakery: [{ id:4, name:'Croissant', price:2.50 }, { id:5, name:'Sourdough', price:5.00 }],
  drinks: [{ id:6, name:'Cold Brew', price:3.80 }, { id:7, name:'Sparkling', price:1.90 }, { id:8, name:'Espresso', price:2.60 }, { id:9, name:'Matcha', price:4.20 }],
};

function UseEffectDemo({ trace }){
  const [category, setCategory] = React.useState('fruit');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const renderRef = React.useRef(0);
  renderRef.current++;
  const requestId = React.useRef(0);

  React.useEffect(() => {
    trace.log('mount', 'ProductList mounted', 'category = "fruit"');
  }, []);

  React.useEffect(() => {
    trace.tick();
    trace.log('effect', 'useEffect ran', `dep changed: category = "${category}"`);
    trace.log('fetch', `GET /api/items?cat=${category}`, 'request sent (700ms)');
    setLoading(true);
    const myId = ++requestId.current;
    const t = setTimeout(() => {
      if (myId !== requestId.current) return; // staleness guard
      const data = MOCK_DATA[category] || [];
      trace.tick();
      trace.log('fetch', `200 OK`, `${data.length} items returned`);
      trace.log('state', `setItems([…${data.length}])`, 'data into state');
      trace.log('state', 'setLoading(false)', '');
      setItems(data);
      setLoading(false);
    }, 700);
    return () => {
      clearTimeout(t);
    };
  }, [category]);

  const change = (cat) => {
    if (cat === category) return;
    trace.tick();
    trace.log('event', 'onClick filter', `category → "${cat}"`);
    trace.log('state', `setCategory("${cat}")`, '');
    setCategory(cat);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          {['fruit','bakery','drinks'].map(c => (
            <button
              key={c}
              className={`chip ${category===c?'on':''}`}
              onClick={() => change(c)}
            >{c}</button>
          ))}
        </div>
        <div className="data-table">
          <div className="th">
            <span>id</span><span>name</span><span>price</span>
          </div>
          {loading && (
            <div className="loading-row">
              <span className="spinner"></span> fetching {category}…
            </div>
          )}
          {!loading && items.map(it => (
            <div key={it.id} className="tr">
              <span className="num">{it.id}</span>
              <span>{it.name}</span>
              <span className="num">${it.price.toFixed(2)}</span>
            </div>
          ))}
          {!loading && items.length === 0 && <div className="loading-row">no rows</div>}
        </div>
        <div className="demo-meta">
          <span>renders: <b>{renderRef.current}</b></span>
          <button className="demo-reset" onClick={() => { setCategory('fruit'); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>useEffect</b> runs side effects after render. The dependency array <code>[category]</code> tells React: "run this effect again whenever <code>category</code> changes." Each filter click triggers a new fetch.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'ProductList', entries: [
            { key: 'category', value: category, changed: category !== 'fruit' },
            { key: 'items',    value: items, changed: items.length > 0 },
            { key: 'loading',  value: loading, changed: loading },
          ]},
          { label: 'effect', color: 'var(--accent-5)', component: 'ProductList', entries: [
            { key: 'deps', value: [category], changed: false },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useEffect = {
  id: 'useEffect',
  title: 'useEffect',
  subtitle: 'side effects + deps',
  code: useEffectLessonCode,
  highlightLines: [6, 13],
  notes: [
    { title: 'Side effects, not pure', body: 'Render functions should be pure. Anything that touches the outside world — fetch, subscriptions, timers — goes in useEffect.' },
    { title: 'The dependency array', body: '[] = run once after mount. [a, b] = run when a or b changes. Omitted = run after every render (rarely what you want).' },
    { title: 'Cleanup', body: 'Return a function from the effect to undo it before the next run, or on unmount. Critical for cancelling stale requests.' },
  ],
  Demo: UseEffectDemo,
};
