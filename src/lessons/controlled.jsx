/* Lesson 2: controlled input */
const controlledLessonCode = `function SearchBox() {
  const [query, setQuery] = useState("");

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}`;

function ControlledDemo({ trace }){
  const [query, setQuery] = React.useState("");
  const renderRef = React.useRef(0);
  renderRef.current++;

  React.useEffect(() => {
    trace.log('mount', 'SearchBox mounted', 'query = ""');
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    trace.tick();
    trace.log('event', 'onChange fired', `event.target.value = "${v}"`);
    trace.log('state', `setQuery("${v}")`, `was "${query}", now "${v}"`);
    setQuery(v);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <input
          className="demo-input"
          value={query}
          onChange={handleChange}
          placeholder="Type something..."
        />
        <div className="demo-meta">
          <span>value follows state: <code className="kbd">{query || '∅'}</code></span>
          <button className="demo-reset" onClick={() => { setQuery(""); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p>This is a <b>controlled input</b>: React state is the source of truth for the input value. Every keystroke fires <code>onChange</code>, updates state, and React re-renders the input with the new value.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'SearchBox', entries: [
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
  subtitle: 'state is the source of truth',
  code: controlledLessonCode,
  highlightLines: [2, 6, 7],
  notes: [
    { title: 'Why controlled?', body: 'Because React owns the input value, you can validate, transform, or sync it with other state. The input cannot drift away from your model.' },
    { title: 'The data round-trip', body: 'User types → onChange → setState → re-render → input shows new value. It feels instant but those steps really happen on every keystroke.' },
  ],
  challenge: {
    prompt: 'Type "abc" into the input. How many renders happen, and where does the typed value live between keystrokes?',
    answer: 'Three renders — one per keystroke. The typed value lives in React state, not in the DOM input element. Each keystroke fires onChange → setState → React re-renders the component → React tells the input what value to show. The DOM input is essentially a slave to React state.'
  },
  Demo: ControlledDemo,
};
