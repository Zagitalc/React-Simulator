# Retail React Interview Simulator

An interactive React visual debugger for learning component state, props, effects, render cycles, memoized derived values, and API-driven dashboard behavior through a retail pricing dashboard scenario.

The app is intentionally simple: it is a static HTML page that loads React, ReactDOM, and Babel from a CDN, then runs the lesson files in `src/`. There is no build step or package install required.

## Run locally

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/React%20Simulator.html
```

You can also open `React Simulator.html` directly in a browser, but using a local server is closer to how the app is normally tested.

## What it teaches

The simulator uses a retail pricing dashboard with these dimensions:

- Retailers: `Tesco`, `Sainsbury's`, `Ocado`
- Categories: `Soft Drinks`, `Crisps`, `Coffee`
- Table columns: `Product`, `Retailer`, `Shelf Price`, `Promo Price`, `Date`

Each lesson includes live UI, highlighted code, an event timeline, an inspector, and a short interview answer you can say out loud.

## Lessons

1. `useState`: filter state changes and why setters trigger renders.
2. Controlled input: product search state drives table output.
3. Props: parent dashboard state flows into a child `PriceTable`.
4. `useEffect`: fetching prices when `retailer` or `category` changes.
5. `useMemo`: deriving average shelf price and promotion count from table data.
6. `useCallback`: keeping event handler props stable for memoized table rows.
7. Lists and keys: using stable product IDs instead of array indexes.

## Timeline labels

The timeline shows the React sequence behind each interaction:

- `EVENT`: a user action, such as clicking a filter.
- `STATE`: a state setter call.
- `RENDER`: which component rendered and why.
- `EFFECT`: a `useEffect` callback running after render.
- `FETCH`: mock API request and response events.
- `MEMO`: a memoized value recalculating.
- `PROP`: parent data passed into a child component.

## Error path

In the `useEffect` lesson, selecting `Ocado` and `Coffee` triggers the mock error flow:

```text
GET /api/prices?retailer=Ocado&category=Coffee
500 Error
setError("Could not load prices")
setLoading(false)
```

This demonstrates handling loading, success, and error states explicitly.

## Project structure

```text
React Simulator.html
src/
  app.jsx
  highlighter.jsx
  inspector.jsx
  timeline.jsx
  tweaks-panel.jsx
  styles.js
  lessons/
    controlled.jsx
    list.jsx
    props.jsx
    useEffect.jsx
    useCallback.jsx
    useMemo.jsx
    useState.jsx
```

## Notes

- This is a learning tool, not a production React architecture.
- The browser console will show Babel's expected development warning because JSX is transformed in the browser.
- React, ReactDOM, Babel, and fonts are loaded from external CDNs, so internet access is needed unless those assets are vendored locally.
