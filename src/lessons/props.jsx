/* Lesson 3: props */
const propsLessonCode = `function Dashboard() {
  const [user, setUser] = useState("Ada");

  return (
    <div>
      <select value={user} onChange={(e) => setUser(e.target.value)}>
        <option>Ada</option>
        <option>Linus</option>
        <option>Grace</option>
      </select>
      <Greeting name={user} />
    </div>
  );
}

function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}`;

function PropsDemo({ trace }){
  const [user, setUser] = React.useState("Ada");
  const parentRenders = React.useRef(0);
  parentRenders.current++;

  React.useEffect(() => {
    trace.log('mount', 'Dashboard mounted', 'parent component');
    trace.log('mount', 'Greeting mounted', 'child receives name="Ada"');
  }, []);

  const prevUser = React.useRef("Ada");
  React.useEffect(() => {
    if (prevUser.current !== user){
      trace.log('prop', `<Greeting name="${user}" />`, 'parent passes new prop');
      trace.log('render', 'Greeting re-rendered', `name = "${user}"`);
      prevUser.current = user;
    }
  });

  const handleChange = (e) => {
    const v = e.target.value;
    trace.tick();
    trace.log('event', 'onChange (parent select)', `value = "${v}"`);
    trace.log('state', `setUser("${v}")`, `Dashboard state changed`);
    trace.log('render', 'Dashboard re-rendered', 'child gets new prop');
    setUser(v);
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="parent-card">
          <div className="card-tag">Dashboard <span className="card-sub">parent</span></div>
          <select className="demo-select" value={user} onChange={handleChange}>
            <option>Ada</option>
            <option>Linus</option>
            <option>Grace</option>
            <option>Hedy</option>
          </select>
          <div className="prop-arrow">
            <span>name=</span>
            <span className="prop-val">"{user}"</span>
            <span className="arrow">↓</span>
          </div>
          <div className="child-card">
            <div className="card-tag">Greeting <span className="card-sub">child</span></div>
            <p className="greet">Hello, <b>{user}</b>!</p>
          </div>
        </div>
        <div className="demo-meta">
          <button className="demo-reset" onClick={() => { setUser("Ada"); trace.clear(); parentRenders.current = 0; }}>reset</button>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>Props</b> flow downward. <code>Dashboard</code> owns the state; it passes <code>user</code> to <code>Greeting</code> as a prop. The child reads it but never mutates it.</p>
      </div>
      <Inspector
        renderCount={parentRenders.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'Dashboard', entries: [
            { key: 'user', value: user, changed: user !== 'Ada' }
          ]},
          { label: 'props', color: 'var(--accent)', component: 'Greeting', entries: [
            { key: 'name', value: user, changed: user !== 'Ada' }
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_props = {
  id: 'props',
  title: 'Props',
  subtitle: 'data flows down',
  code: propsLessonCode,
  highlightLines: [11, 16],
  notes: [
    { title: 'One-way data flow', body: 'Parent owns state, child receives it as a prop. To "change" a prop, the child asks the parent (via a callback prop) to update its state.' },
    { title: 'Re-renders cascade', body: 'When the parent re-renders with a new prop value, the child re-renders too. React diffs the JSX and updates only the parts that changed.' },
  ],
  Demo: PropsDemo,
};
