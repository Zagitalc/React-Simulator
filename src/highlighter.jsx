/* Tiny JSX/JS syntax highlighter. Tokenizes -> spans. Good enough for lessons. */
const KEYWORDS = new Set([
  'const','let','var','function','return','if','else','for','while','do','switch','case','break','continue',
  'new','class','extends','this','super','import','from','export','default','typeof','instanceof','in','of',
  'try','catch','finally','throw','async','await','yield','null','undefined','true','false'
]);
const REACT_HOOKS = new Set([
  'useState','useEffect','useMemo','useCallback','useRef','useReducer','useContext','useLayoutEffect','useId'
]);
const SQL_KEYWORDS = new Set([
  'SELECT','FROM','JOIN','LEFT','RIGHT','INNER','OUTER','ON','WHERE','AND','OR','NOT','IN','IS','NULL',
  'ORDER','BY','GROUP','HAVING','LIMIT','OFFSET','AS','DESC','ASC','INSERT','INTO','VALUES','UPDATE',
  'SET','DELETE','CREATE','TABLE','DROP','ALTER','WITH','UNION','ALL','DISTINCT','CASE','WHEN','THEN',
  'ELSE','END','BETWEEN','LIKE','EXISTS','COUNT','SUM','AVG','MIN','MAX'
]);

function tokenizeSql(src){
  const out = [];
  let i = 0;
  const push = (t, v) => out.push({t,v});
  while (i < src.length){
    const c = src[i];
    if (c === '-' && src[i+1] === '-'){
      const j = src.indexOf('\n', i); const end = j === -1 ? src.length : j;
      push('com', src.slice(i, end)); i = end; continue;
    }
    if (c === "'" || c === '"'){
      const q = c; let j = i+1;
      while (j < src.length && src[j] !== q){ j++; }
      if (j < src.length) j++;
      push('str', src.slice(i, j)); i = j; continue;
    }
    if (/[0-9]/.test(c)){
      let j = i+1; while (j < src.length && /[0-9.]/.test(src[j])) j++;
      push('num', src.slice(i, j)); i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)){
      let j = i+1; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (SQL_KEYWORDS.has(word.toUpperCase())) push('kw', word);
      else push('id', word);
      i = j; continue;
    }
    if (/[(),;.*]/.test(c)){ push('punct', c); i++; continue; }
    if (/[+\-=<>!]/.test(c)){ push('op', c); i++; continue; }
    push('w', c); i++;
  }
  return out;
}

function tokenize(src){
  const out = [];
  let i = 0;
  const push = (t, v) => out.push({t,v});
  while (i < src.length){
    const c = src[i];
    const c2 = src.slice(i, i+2);
    // comments
    if (c2 === '//'){
      const j = src.indexOf('\n', i);
      const end = j === -1 ? src.length : j;
      push('com', src.slice(i, end));
      i = end;
      continue;
    }
    if (c2 === '/*'){
      const j = src.indexOf('*/', i+2);
      const end = j === -1 ? src.length : j+2;
      push('com', src.slice(i, end));
      i = end;
      continue;
    }
    // strings
    if (c === '"' || c === "'" || c === '`'){
      const quote = c;
      let j = i+1;
      while (j < src.length){
        if (src[j] === '\\'){ j+=2; continue; }
        if (src[j] === quote){ j++; break; }
        j++;
      }
      push('str', src.slice(i, j));
      i = j;
      continue;
    }
    // numbers
    if (/[0-9]/.test(c)){
      let j = i+1;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      push('num', src.slice(i, j));
      i = j;
      continue;
    }
    // identifiers
    if (/[A-Za-z_$]/.test(c)){
      let j = i+1;
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (KEYWORDS.has(word)) push('kw', word);
      else if (REACT_HOOKS.has(word)) push('hook', word);
      else if (/^[A-Z]/.test(word)) push('cmp', word); // PascalCase = component
      else if (src[j] === '(') push('fn', word);
      else push('id', word);
      i = j;
      continue;
    }
    // jsx tags - cheap detection: < followed by letter or /
    if (c === '<' && /[A-Za-z\/]/.test(src[i+1] || '')){
      let j = i+1;
      while (j < src.length && src[j] !== '>' && src[j] !== '\n') j++;
      if (j < src.length && src[j] === '>') j++;
      push('jsx', src.slice(i, j));
      i = j;
      continue;
    }
    // punctuation
    if (/[{}()\[\];,.]/.test(c)){ push('punct', c); i++; continue; }
    if (/[+\-*/%=!<>&|^~?:]/.test(c)){ push('op', c); i++; continue; }
    // whitespace / other
    push('w', c);
    i++;
  }
  return out;
}

function CodeBlock({ code, highlightLines = [], onLineHover, onLineClick, activeLine, mode }){
  const lines = code.split('\n');
  const tk = mode === 'sql' ? tokenizeSql : tokenize;
  return (
    <div className="code-block">
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        const isHi = highlightLines.includes(lineNum);
        const isActive = activeLine === lineNum;
        const tokens = tk(line);
        return (
          <div
            key={idx}
            className={`code-line ${isHi ? 'hi' : ''} ${isActive ? 'active' : ''}`}
            onMouseEnter={() => onLineHover && onLineHover(lineNum)}
            onMouseLeave={() => onLineHover && onLineHover(null)}
            onClick={() => onLineClick && onLineClick(lineNum)}
          >
            <span className="ln">{String(lineNum).padStart(2, ' ')}</span>
            <span className="lc">
              {tokens.map((tk, j) => (
                <span key={j} className={`tk-${tk.t}`}>{tk.v}</span>
              ))}
              {line.length === 0 ? ' ' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

window.CodeBlock = CodeBlock;
