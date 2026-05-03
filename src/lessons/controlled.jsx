/* Lesson 2: controlled input */
const controlledLessonCode = `function ProductSearch() {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search products"
    />
  );
}`;

function ControlledDemo({ trace }){
  const [query, setQuery] = React.useState('');
  const renderRef = React.useRef(0);
  renderRef.current++;

  React.useEffect(() => {
    trace.log('mount', 'ProductSearch mounted', 'query = ""');
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    trace.tick();
    trace.log('event', 'onChange search', `event.target.value = "${value}"`);
    trace.log('state', `setQuery("${value}")`, `was "${query}", now "${value}"`);
    trace.log('render', 'ProductSearch', 'reason: query state changed');
    setQuery(value);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <input
          className="demo-input"
          value={query}
          onChange={handleChange}
          placeholder="Search product rows"
        />
        <div className="data-table">
          <div className="th">
            <span>Product</span><span>Retailer</span><span>Shelf Price</span><span>Promo Price</span><span>Date</span>
          </div>
          {['Cola 12 x 330ml', 'Orange Fizz 2L'].filter(name => name.toLowerCase().includes(query.toLowerCase())).map((name, index) => (
            <div key={name} className="tr">
              <span>{name}</span>
              <span>Tesco</span>
              <span className="num">£{index === 0 ? '5.50' : '1.85'}</span>
              <span className="promo">£{index === 0 ? '4.25' : '1.35'}</span>
              <span className="date">2026-05-02</span>
            </div>
          ))}
        </div>
        <div className="demo-meta">
          <span>input value follows state: <code className="kbd">{query || 'empty'}</code></span>
          <button className="demo-reset" onClick={() => { setQuery(''); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p>This is a <b>controlled input</b>: React state is the source of truth for the product search value, so every keystroke can filter the table predictably.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'ProductSearch', entries: [
            { key: 'query', value: query, changed: query !== '' }
          ]},
          { label: 'DOM', color: 'var(--fg-dim)', component: 'input', entries: [
            { key: 'value', value: query, changed: false }
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_controlled = {
  id: 'controlled',
  title: 'Controlled input',
  subtitle: 'search state drives table',
  code: controlledLessonCode,
  highlightLines: [2, 6, 7],
  interviewAnswer: 'A controlled input keeps the form value in React state. That makes dashboard search and validation predictable because the input value, filter logic, and rendered rows all come from the same state.',
  notes: [
    { title: 'Why controlled?', body: 'Because React owns the input value, you can validate, transform, or sync it with other state. The input cannot drift away from your model.' },
    { title: 'The data round-trip', body: 'User types, onChange runs, state updates, React renders, and the input shows the new value.' },
  ],
  types: `type ProductSearchProps = {
  placeholder?: string;
};

function ProductSearch(props: ProductSearchProps): JSX.Element {
  const [query, setQuery] = useState<string>('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  return (
    <input
      value={query}
      onChange={handleChange}
      placeholder={props.placeholder ?? 'Search products'}
    />
  );
}`,
  challenge: {
    prompt: 'Type "abc" into the input. How many renders happen, and where does the typed value live between keystrokes?',
    answer: 'Three renders — one per keystroke. The typed value lives in React state, not in the DOM input element. Each keystroke fires onChange → setState → React re-renders the component → React tells the input what value to show. The DOM input is essentially a slave to React state.'
  },
  Demo: ControlledDemo,
};
