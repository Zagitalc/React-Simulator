/* Lesson 6: list rendering + keys */
const listLessonCode = `function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Read docs" },
    { id: 2, text: "Build demo" },
  ]);

  const add = () => setTodos([
    ...todos,
    { id: Date.now(), text: "New task" }
  ]);

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  );
}`;

let idCounter = 100;

function ListDemo({ trace }){
  const [todos, setTodos] = React.useState([
    { id: 1, text: 'Read docs' },
    { id: 2, text: 'Build demo' },
    { id: 3, text: 'Ship it' },
  ]);
  const renderRef = React.useRef(0);
  renderRef.current++;

  React.useEffect(() => {
    trace.log('mount', 'TodoList mounted', `${todos.length} initial items`);
  }, []);

  const add = () => {
    const id = ++idCounter;
    const text = ['Refactor','Write tests','Open PR','Review','Deploy'][Math.floor(Math.random()*5)];
    trace.tick();
    trace.log('event', 'onClick add', '');
    trace.log('state', `setTodos([…, { id:${id} }])`, '');
    trace.log('render', 'list re-rendered', `${todos.length + 1} items, keys preserve identity`);
    setTodos(t => [...t, { id, text }]);
  };

  const remove = (id) => {
    trace.tick();
    trace.log('event', 'onClick remove', `id=${id}`);
    trace.log('state', `setTodos(filter id !== ${id})`, '');
    trace.log('render', 'list re-rendered', 'React diffs by key, removes one DOM node');
    setTodos(t => t.filter(x => x.id !== id));
  };

  const shuffle = () => {
    trace.tick();
    trace.log('event', 'shuffle', 'reordered array');
    trace.log('render', 'list re-rendered', 'keys keep DOM nodes — no remount');
    setTodos(t => [...t].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="demo-frame">
      <div className="demo-stage">
        <div className="filter-row">
          <button className="chip" onClick={add}>+ add</button>
          <button className="chip" onClick={shuffle}>shuffle</button>
          <button className="demo-reset" onClick={() => { setTodos([{id:1,text:'Read docs'},{id:2,text:'Build demo'},{id:3,text:'Ship it'}]); trace.clear(); renderRef.current = 0; }}>reset</button>
        </div>
        <ul className="todo-list">
          {todos.map(t => (
            <li key={t.id} className="todo-item">
              <span className="key-tag">key={t.id}</span>
              <span className="todo-text">{t.text}</span>
              <button className="todo-x" onClick={() => remove(t.id)}>×</button>
            </li>
          ))}
          {todos.length === 0 && <li className="todo-empty">empty list</li>}
        </ul>
        <div className="demo-meta">
          <span>{todos.length} items</span>
        </div>
      </div>
      <div className="demo-explainer">
        <p><b>Keys</b> tell React which item is which across renders. With stable keys, React reuses DOM nodes when items are reordered or removed instead of recreating them.</p>
      </div>
      <Inspector
        renderCount={renderRef.current}
        groups={[
          { label: 'state', color: 'var(--accent-2)', component: 'TodoList', entries: [
            { key: 'todos.length', value: todos.length, changed: false },
            { key: 'keys', value: todos.map(t => t.id), changed: false },
          ]}
        ]}
      />
    </div>
  );
}

window.LESSON_list = {
  id: 'list',
  title: 'Lists & keys',
  subtitle: 'identity across renders',
  code: listLessonCode,
  highlightLines: [14, 15],
  notes: [
    { title: 'Why keys?', body: 'React uses keys to match items across renders. Without them (or with index keys), React cannot tell if an item moved or changed, and may rebuild DOM unnecessarily.' },
    { title: 'Use stable IDs', body: 'A row\u2019s database ID is a perfect key. The array index is a fallback only when the list never reorders.' },
  ],
  Demo: ListDemo,
};
