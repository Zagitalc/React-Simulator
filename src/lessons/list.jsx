/* Lesson 6: list rendering + keys — Good vs Bad */

const listGoodCode = `function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Read docs" },
    { id: 2, text: "Build demo" },
  ]);

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>          {/* ✓ stable identity */}
          <TodoItem todo={t} />
        </li>
      ))}
    </ul>
  );
}`;

const listBadCode = `function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Read docs" },
    { id: 2, text: "Build demo" },
  ]);

  return (
    <ul>
      {todos.map((t, index) => (
        <li key={index}>         {/* ❌ identity tied to position */}
          <TodoItem todo={t} />   {/* internal state ends up on wrong row */}
        </li>
      ))}
    </ul>
  );
}`;

let idCounter = 100;

// child component holds its own state — exposes the index-key bug
function TodoItemWithLocalState({ todo, onRemove }){
  const [watched, setWatched] = React.useState(false);
  return (
    <>
      <span className="key-tag">{todo.label}</span>
      <span className="todo-text">{todo.text}</span>
      <button
        className={`watch-btn ${watched ? 'on' : ''}`}
        onClick={() => setWatched(w => !w)}
      >{watched ? '★' : '☆'}</button>
      <button className="todo-x" onClick={() => onRemove(todo.id)}>×</button>
    </>
  );
}

function makeListDemo({ keyMode }){
  // keyMode: 'id' (good) | 'index' (bad)
  return function ListDemo({ trace }){
    const [todos, setTodos] = React.useState([
      { id: 1, text: 'Read docs' },
      { id: 2, text: 'Build demo' },
      { id: 3, text: 'Ship it' },
    ]);
    const renderRef = React.useRef(0);
    renderRef.current++;

    React.useEffect(() => {
      trace.log('mount', 'TodoList mounted', `${todos.length} initial items, key=${keyMode}`);
    }, []);

    const add = () => {
      const id = ++idCounter;
      const text = ['Refactor','Write tests','Open PR','Review','Deploy'][Math.floor(Math.random()*5)];
      trace.tick();
      trace.log('event', 'onClick add', '');
      trace.log('state', `setTodos([…, { id:${id} }])`, '');
      setTodos(t => [...t, { id, text }]);
    };

    const remove = (id) => {
      trace.tick();
      trace.log('event', 'onClick remove', `id=${id}`);
      trace.log('state', `setTodos(filter id !== ${id})`, '');
      if (keyMode === 'index'){
        trace.log('render', 'list re-rendered',
          'React reused wrong row identity',
          'index keys break identity when list reorders');
      } else {
        trace.log('render', 'list re-rendered',
          'React diffed by id key — internal state stayed with the right item');
      }
      setTodos(t => t.filter(x => x.id !== id));
    };

    const shuffle = () => {
      trace.tick();
      trace.log('event', 'shuffle', 'reordered array');
      if (keyMode === 'index'){
        trace.log('render', 'list re-rendered',
          'BUG: watch ★ markers stayed at the same positions, not the same items',
          'index keys → React thinks the item at index 0 is the same item');
      } else {
        trace.log('render', 'list re-rendered', 'keys preserved identity — ★ followed each item');
      }
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
            {todos.map((t, index) => {
              const k = keyMode === 'index' ? index : t.id;
              const label = keyMode === 'index' ? `key=${index}` : `key=${t.id}`;
              return (
                <li key={k} className="todo-item">
                  <TodoItemWithLocalState
                    todo={{ ...t, label }}
                    onRemove={remove}
                  />
                </li>
              );
            })}
            {todos.length === 0 && <li className="todo-empty">empty list</li>}
          </ul>
          <div className="demo-meta">
            <span>{todos.length} items · keyed by <b>{keyMode}</b></span>
          </div>
        </div>
        <div className="demo-explainer">
          <p>Toggle the <b>★</b> on a couple of rows, then click <b>shuffle</b>. With <b>id</b> keys the stars follow each item. With <b>index</b> keys the stars stay glued to the visible position — that's the bug.</p>
        </div>
        <Inspector
          renderCount={renderRef.current}
          groups={[
            { label: 'state', color: 'var(--accent-2)', component: 'TodoList', entries: [
              { key: 'todos.length', value: todos.length, changed: false },
              { key: 'order',        value: todos.map(t => t.id), changed: false },
              { key: 'keyMode',      value: keyMode, changed: false },
            ]}
          ]}
        />
      </div>
    );
  };
}

const ListGoodDemo = makeListDemo({ keyMode: 'id' });
const ListBadDemo  = makeListDemo({ keyMode: 'index' });

window.LESSON_list = {
  id: 'list',
  title: 'Lists & keys',
  subtitle: 'identity across renders',
  code: listGoodCode,
  highlightLines: [10, 11, 12],
  notes: [
    { title: 'Why keys?', body: 'React uses keys to match items across renders. Without stable keys, React cannot tell if an item moved or changed, and child state ends up attached to position rather than data.' },
    { title: 'Use stable IDs', body: 'A row’s database ID is a perfect key. The array index is a fallback only when the list never reorders.' },
  ],
  types: `type Todo = {
  id: number;
  text: string;
};

type TodoItemProps = {
  todo: Todo;
  onRemove: (id: Todo['id']) => void;
};

function TodoItem({ todo, onRemove }: TodoItemProps): JSX.Element {
  const [watched, setWatched] = useState<boolean>(false);
  return (
    <li>
      <button onClick={() => setWatched((value) => !value)} />
      <button onClick={() => onRemove(todo.id)} />
    </li>
  );
}

type ListKey = Todo['id']; // preferred key type for stable identity`,
  variants: {
    good: { code: listGoodCode, highlightLines: [10, 11, 12], Demo: ListGoodDemo },
    bad:  { code: listBadCode,  highlightLines: [10, 11, 12], Demo: ListBadDemo },
  },
  challenge: {
    prompt: 'Toggle ★ on the first two rows, then click shuffle. In Bad mode (key={index}) the stars stop tracking the right items. Why?',
    answer: 'React identifies list children by their key. With key={index}, the row at position 0 is "the same row" before and after a shuffle, even though the underlying todo changed. Internal state inside that row (the ★) belongs to the position, not the todo, so it visually attaches to the wrong item. With key={id}, React matches each rendered row to its data and the state moves with the item.'
  },
  Demo: ListGoodDemo,
};
