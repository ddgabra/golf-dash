const style = document.createElement("style");
style.textContent = `
  :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; background: #f4f7ef; color: #17210f; }
  body { margin: 0; }
  .shell { min-height: 100vh; display: grid; align-content: center; gap: 1rem; padding: clamp(1rem, 4vw, 4rem); box-sizing: border-box; }
  .eyebrow { color: #47720f; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
  h1 { font-size: clamp(2.3rem, 8vw, 5.8rem); line-height: .95; max-width: 11ch; margin: 0; }
  .lede { font-size: clamp(1rem, 2vw, 1.35rem); max-width: 62ch; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1rem; max-width: 58rem; }
  .cards div { background: white; border: 1px solid #dce7d1; border-radius: 1rem; padding: 1rem; box-shadow: 0 .75rem 2rem rgb(23 33 15 / .08); }
  dt { color: #59704a; font-size: .85rem; }
  dd { margin: .25rem 0 0; font-weight: 800; }
  button { width: fit-content; min-height: 48px; border: 0; border-radius: 999px; padding: .9rem 1.2rem; background: #275f1b; color: white; font-weight: 800; }
  button:focus-visible { outline: 4px solid #ffcf4a; outline-offset: 3px; }
`;
document.head.append(style);
