/* Lesson 1: useState */
const useStateLessonCode = `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`;

function UseStateDemo({ trace }){
  const [count, setCount] = React.useState(0);
  const renderRef = React.useRef(0);
  renderRef.current++;

  React.useEffect(() => {
    trace.log('mount', 'Counter mounted', 'initial state set');
    trace.log('render', 'Counter rendered', `count = 0`);
  }, []);

  const prevCount = React.useRef(0);
  React.useEffect(() => {
    if (prevCount.current !== count){
      trace.log('render', 'Counter re-rendered', `count = ${count}`);
      prevCount.current = count;
    }
  });

  const handleClick = () => {
    trace.tick();
    trace.log('event', 'onClick fired', 'user clicked button');
    trace.log('state', `setCount(${count + 1})`, `was ${count}, now ${count + 1}`);
    setCount(c => c + 1);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <button className="demo-btn" onClick={handleClick}>
          Count: <b>{count}</b>
        </button>
        <div className="demo-meta">
          <span>renders: <b>{renderRef.current}</b></span>
          <button className="demo-reset" onClick={() => { setCount(0); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>State</b> is data that belongs to a component. When you call <code>setCount</code>, React schedules a re-render and the UI catches up to the new value.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'Counter', entries: [
            { key: 'count', value: count, changed: count !== 0 }
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_useState = {
  id: 'useState',
  title: 'useState',
  subtitle: 'state triggers re-renders',
  code: useStateLessonCode,
  highlightLines: [2, 5],
  notes: [
    { title: 'What is state?', body: 'A value the component remembers between renders. Each call to useState gives you the current value and a setter.' },
    { title: 'Setter triggers render', body: 'Calling setCount tells React: this component is dirty, re-run it. React calls Counter() again with the new state.' },
    { title: 'Renders are functions', body: 'A "render" is just calling the component function. Same component, new state in, new JSX out.' },
  ],
  Demo: UseStateDemo,
};
