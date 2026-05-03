/* Lesson 4: useEffect — Good vs Bad (stale deps / no deps) */

const useEffectGoodCode = `function ProductList() {
  const [category, setCategory] = useState("fruit");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(\`/api/items?cat=\${category}\`)
      .then((res) => res.json())
      .then(setItems);
  }, [category]); // ✓ refetch when category changes
}`;

const useEffectBadCode = `function ProductList() {
  const [category, setCategory] = useState("fruit");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(\`/api/items?cat=\${category}\`)
      .then((res) => res.json())
      .then(setItems);
  }, []); // ❌ runs once — table goes stale when category changes
}`;

const useEffectBadAltCode = `function ProductList() {
  const [category, setCategory] = useState("fruit");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(\`/api/items?cat=\${category}\`)
      .then((res) => res.json())
      .then(setItems);
  }); // ❌ no deps — fires after every render, repeated fetches
}`;

const MOCK_DATA = {
  fruit:  [{ id:1, name:'Apple', price:1.20 }, { id:2, name:'Banana', price:0.40 }, { id:3, name:'Mango', price:2.10 }],
  bakery: [{ id:4, name:'Croissant', price:2.50 }, { id:5, name:'Sourdough', price:5.00 }],
  drinks: [{ id:6, name:'Cold Brew', price:3.80 }, { id:7, name:'Sparkling', price:1.90 }, { id:8, name:'Espresso', price:2.60 }, { id:9, name:'Matcha', price:4.20 }],
};

function makeUseEffectDemo({ depMode }){
  // depMode: 'good' = [category], 'stale' = [], 'every' = no deps
  return function UseEffectDemo({ trace, onDemoState }){
    const [category, setCategory] = React.useState('fruit');
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const renderRef = React.useRef(0);
    renderRef.current++;
    const requestId = React.useRef(0);
    const everyModeRuns = React.useRef(0);
    const everyModeWarned = React.useRef(false);

    React.useEffect(() => {
      onDemoState && onDemoState({ category });
    }, [category, onDemoState]);

    React.useEffect(() => {
      trace.log('mount', 'ProductList mounted', 'category = "fruit"');
    }, []);

    // The actual effect under study, varies by depMode
    const runFetch = (catArg) => {
      trace.log('effect', 'useEffect ran', `dep mode: ${depMode}`,
        depMode === 'good'  ? 'category in deps → re-runs only when it changes' :
        depMode === 'stale' ? 'empty deps means effect runs only once' :
                              'no deps array means run after every render'
      );
      trace.log('fetch', `GET /api/items?cat=${catArg}`, 'request sent (700ms)');
      setLoading(true);
      const myId = ++requestId.current;
      setTimeout(() => {
        if (myId !== requestId.current) return;
        const data = MOCK_DATA[catArg] || [];
        trace.tick();
        trace.log('fetch', `200 OK`, `${data.length} items returned`);
        setItems(data);
        setLoading(false);
      }, 700);
    };

    if (depMode === 'good'){
      React.useEffect(() => {
        trace.tick();
        runFetch(category);
      }, [category]);
    } else if (depMode === 'stale'){
      React.useEffect(() => {
        trace.tick();
        runFetch(category); // captured at first render — won't update
      }, []);
    } else {
      // every render — deliberately capped so the teaching demo cannot lock the page.
      React.useEffect(() => {
        if (everyModeRuns.current >= 3){
          if (!everyModeWarned.current){
            everyModeWarned.current = true;
            trace.log('effect', 'demo stopped repeated no-deps effect',
              'capped after 3 runs', 'real code would keep fetching after every render');
          }
          return;
        }
        everyModeRuns.current++;
        trace.tick();
        runFetch(category);
      });
    }

    // surface the "stale" bug visually
    const showingStale = depMode === 'stale' && items.length > 0 && !MOCK_DATA[category].some(x => items.find(i => i.id === x.id));

    const change = (cat) => {
      if (cat === category) return;
      trace.tick();
      trace.log('event', 'onClick filter', `category → "${cat}"`);
      trace.log('state', `setCategory("${cat}")`, '');
      if (depMode === 'stale'){
        // proactive note in timeline since the effect won't run
        trace.log('effect', 'useEffect skipped',
          'deps unchanged — empty array', 'BUG: table will keep old data');
      }
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
                <span className="num">£{it.price.toFixed(2)}</span>
              </div>
            ))}
            {!loading && items.length === 0 && <div className="loading-row">no rows</div>}
          </div>
          {showingStale && (
            <div className="demo-explainer" style={{borderLeftColor: 'var(--accent-4)'}}>
              <b>BUG:</b> table still shows old category — effect never re-ran because deps array is empty.
            </div>
          )}
          <div className="demo-meta">
            <span>renders: <b>{renderRef.current}</b></span>
            <span>mode: <b>{depMode}</b></span>
          </div>
        </div>
        <div className="demo-explainer">
          <p><b>useEffect</b> runs side effects after render. The dependency array tells React when to re-run it. Toggle Good/Bad above to see what wrong deps do.</p>
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
              { key: 'deps', value: depMode === 'good' ? [category] : depMode === 'stale' ? [] : '(none)', changed: false },
            ]}
          ]}
        />
      </div>
    );
  };
}

const UseEffectGoodDemo = makeUseEffectDemo({ depMode: 'good' });
const UseEffectBadDemo = makeUseEffectDemo({ depMode: 'stale' });
const UseEffectBadAltDemo = makeUseEffectDemo({ depMode: 'every' });

window.LESSON_useEffect = {
  id: 'useEffect',
  title: 'useEffect',
  subtitle: 'side effects + deps',
  code: useEffectGoodCode,
  highlightLines: [6, 11],
  notes: [
    { title: 'Side effects, not pure', body: 'Render functions should be pure. Anything that touches the outside world — fetch, subscriptions, timers — goes in useEffect.' },
    { title: 'The dependency array', body: '[] = run once after mount. [a, b] = run when a or b changes. Omitted = run after every render (rarely what you want).' },
  ],
  variants: {
    good:   { code: useEffectGoodCode,   highlightLines: [6,7,8,9,10,11], Demo: UseEffectGoodDemo, label: 'Good' },
    bad:    { code: useEffectBadCode,    highlightLines: [6,7,8,9,10,11], Demo: UseEffectBadDemo,  label: 'Bad: stale deps' },
    badAlt: { code: useEffectBadAltCode, highlightLines: [6,7,8,9,10,11], Demo: UseEffectBadAltDemo, label: 'Bad: no deps' },
  },
  challenge: {
    prompt: 'Switch retailer/category between Good and Bad mode. Why does the Bad mode keep showing stale data, and why does the "no deps" mode flood the network tab?',
    answer: '"Bad: stale deps" passes [] so React captures the original category and never re-runs the effect — the table shows the first category forever. "Bad: no deps" omits the array entirely, which means React runs the effect after every render; setting state inside it triggers another render, which triggers the effect again, repeating fetches. Good mode lists [category] so the effect only re-runs when category actually changes — no staleness, no over-fetching.'
  },
  types: `type Item = { id: number; name: string; price: number };
type Category = 'fruit' | 'bakery' | 'drinks';

// Effect signature
function useEffect(
  effect: () => void | (() => void),
  deps?: React.DependencyList
): void;`,
  backend: {
    language: 'ts',
    source: `// Backend route the dashboard hits
import Router from '@koa/router';
const router = new Router();

router.get('/api/items', async (ctx) => {
  const { cat } = ctx.query;
  const rows = await db.query(/* see SQL tab */, { cat });
  ctx.body = rows;
});`,
    flow: [
      'user clicks category chip → onClick handler',
      'setCategory → React re-renders',
      'useEffect sees deps change → runs',
      'fetch /api/items?cat=… → backend route',
      'backend runs SQL, returns JSON',
      'setItems → table re-renders',
    ],
  },
  sql: {
    template: `SELECT
  p.id,
  p.name,
  ps.shelf_price AS price
FROM products p
JOIN price_snapshots ps ON ps.product_id = p.id
WHERE p.category = :cat
ORDER BY ps.captured_at DESC
LIMIT 50;`,
    params: (s) => ({ cat: s.category || 'fruit' }),
  },
  Demo: UseEffectGoodDemo,
};
