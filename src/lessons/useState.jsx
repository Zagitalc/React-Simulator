/* Lesson 1: useState */
const useStateLessonCode = `function RetailerFilter() {
  const [retailer, setRetailer] = useState("Tesco");

  return (
    <button onClick={() => setRetailer("Sainsbury's")}>
      Retailer: {retailer}
    </button>
  );
}`;

function UseStateDemo({ trace }){
  const [retailer, setRetailer] = React.useState('Tesco');
  const renderRef = React.useRef(0);
  renderRef.current++;

  React.useEffect(() => {
    trace.log('mount', 'RetailerFilter mounted', 'retailer = "Tesco"');
    trace.log('render', 'RetailerFilter', 'reason: initial mount');
  }, []);

  const changeRetailer = (value) => {
    if (value === retailer) return;
    trace.tick();
    trace.log('event', 'onClick retailer', `value = "${value}"`);
    trace.log('state', `setRetailer("${value}")`, `was "${retailer}", now "${value}"`);
    trace.log('render', 'RetailerFilter', 'reason: retailer state changed');
    setRetailer(value);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          {['Tesco',"Sainsbury's",'Ocado'].map(r => (
            <button key={r} className={`chip ${retailer === r ? 'on' : ''}`} onClick={() => changeRetailer(r)}>{r}</button>
          ))}
        </div>
        <div className="stat-card">
          <div className="stat-label">Selected retailer</div>
          <div className="stat-value">{retailer}</div>
          <div className="stat-sub">rendered <b>{renderRef.current}</b>x</div>
        </div>
        <div className="demo-meta">
          <button className="demo-reset" onClick={() => { setRetailer('Tesco'); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>State</b> is data owned by a component. Updating the retailer state schedules a render, so the selected filter and dashboard value stay in sync.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'RetailerFilter', entries: [
            { key: 'retailer', value: retailer, changed: retailer !== 'Tesco' }
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useState = {
  id: 'useState',
  title: 'useState',
  subtitle: 'filter state changes render',
  code: useStateLessonCode,
  highlightLines: [2, 5],
  interviewAnswer: 'useState stores component-owned values like the selected retailer. When the setter runs, React schedules a render and the UI updates from the new state.',
  notes: [
    { title: 'What is state?', body: 'A value the component remembers between renders. Each call to useState gives you the current value and a setter.' },
    { title: 'Setter triggers render', body: 'Calling setRetailer tells React that the component needs to run again with the new state.' },
    { title: 'Dashboard relevance', body: 'Filters, selected rows, loading flags, and API results are common dashboard state values.' },
  ],
  challenge: {
    prompt: 'Click the counter twice quickly. Why does each click cause exactly one re-render of Counter?',
    answer: 'Each setCount call marks Counter as dirty. React batches updates within the same event tick, but here each click is its own tick, so React schedules a re-render per click. The component function re-runs with the new count value, returns new JSX, and React updates the DOM.'
  },
  Demo: UseStateDemo,
};
