import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { skyRedRaw, skyMultiRaw, partnersRaw, partnersRowRaw } from "./svgs.js";
import { AREAS } from "./data.js";
import { FOTO_PAPEL } from "./pessoas.js";


/* ───────── forma torta: quadrilátero com cantos arredondados (como no Figma) ─────────
   ins = [topo-esq, topo-dir, base-dir, base-esq] em px (quanto cada canto "entra" na vertical) */
export function quadPath(w, h, ins, r, o = 0) {
  const [tl, tr, br, bl] = ins;
  const P = [
    [o, tl + o],
    [w - o, tr + o],
    [w - o, h - br - o],
    [o, h - bl - o],
  ];
  let d = "";
  for (let i = 0; i < 4; i++) {
    const p = P[i], a = P[(i + 3) % 4], b = P[(i + 1) % 4];
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1;
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const ra = Math.min(r, la / 2), rb = Math.min(r, lb / 2);
    const s1 = [p[0] + ((a[0] - p[0]) * ra) / la, p[1] + ((a[1] - p[1]) * ra) / la];
    const s2 = [p[0] + ((b[0] - p[0]) * rb) / lb, p[1] + ((b[1] - p[1]) * rb) / lb];
    d += (i === 0 ? "M" : "L") + s1[0].toFixed(2) + " " + s1[1].toFixed(2) + "Q" + p[0].toFixed(2) + " " + p[1].toFixed(2) + " " + s2[0].toFixed(2) + " " + s2[1].toFixed(2);
  }
  return d + "Z";
}

/* foto do topo dos cards: mesma inclinação do card, com TODAS as pontas de cima arredondadas */
function caminhoFoto(w, h, alto, r) {
  /* alto = [esquerda, direita]: quanto cada canto de cima desce */
  const P = [[0, alto[0]], [w, alto[1]], [w, h], [0, h]];
  const rs = [r, r, 0, 0];
  let d = "";
  for (let i = 0; i < 4; i++) {
    const p = P[i], a = P[(i + 3) % 4], b = P[(i + 1) % 4];
    const rr = rs[i];
    if (!rr) {
      d += (i === 0 ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2);
      continue;
    }
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1;
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const s1 = [p[0] + ((a[0] - p[0]) * rr) / la, p[1] + ((a[1] - p[1]) * rr) / la];
    const s2 = [p[0] + ((b[0] - p[0]) * rr) / lb, p[1] + ((b[1] - p[1]) * rr) / lb];
    d += (i === 0 ? "M" : "L") + s1[0].toFixed(2) + " " + s1[1].toFixed(2) + "Q" + p[0].toFixed(2) + " " + p[1].toFixed(2) + " " + s2[0].toFixed(2) + " " + s2[1].toFixed(2);
  }
  return d + "Z";
}
export function CardFoto({ inv = false, children }) {
  const ref = useRef(null);
  const [d, setD] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ler = () => el.offsetWidth && setD(caminhoFoto(el.offsetWidth, el.offsetHeight, inv ? [0.7, 14] : [16, 0.7], 9));
    ler();
    const ro = new ResizeObserver(ler);
    ro.observe(el);
    return () => ro.disconnect();
  }, [inv]);
  return (
    <div ref={ref} className="card-foto" style={d ? { clipPath: `path("${d}")`, borderRadius: 0 } : undefined}>
      {children}
    </div>
  );
}

/* tag torta do Figma: forma "a" = lado direito mais curto, "b" = lado esquerdo mais curto */
export function Tag({ as = "span", className = "", forma = "a", k = 2, r = 3, fill = "none", stroke, sw = 1.3, children, ...rest }) {
  return (
    <Shape as={as} className={"tg " + className} fill={fill} stroke={stroke} sw={sw} ins={FORMAS[forma](k)} r={r} {...rest}>
      {children}
    </Shape>
  );
}

export const FORMAS = {
  a: (k) => [0, k, k, 0],
  b: (k) => [k, 0, 0, k],
  c: (k) => [k, 0, k, 0],
  d: (k) => [0, k, 0, k],
};

export function Shape({ as: Tag = "div", className = "", style, fill = "none", stroke, sw = 1.5, ins = [0, 6, 6, 0], r = 6, band = 0, bandFill, children, ...rest }) {
  const ref = useRef(null);
  const [sz, setSz] = useState(null);
  const id = "s" + useId().replace(/[^a-zA-Z0-9]/g, "");
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setSz((old) => (old && old[0] === el.offsetWidth && old[1] === el.offsetHeight ? old : [el.offsetWidth, el.offsetHeight]));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  let svg = null;
  if (sz && sz[0] > 0) {
    const [w, h] = sz;
    const o = stroke ? sw / 2 : 0;
    const d = quadPath(w, h, ins, r, o);
    svg = (
      <svg className="shape-bg" width={w} height={h} aria-hidden="true" focusable="false">
        {band > 0 && (
          <defs>
            <clipPath id={id}>
              <path d={d} />
            </clipPath>
          </defs>
        )}
        <path d={d} style={{ fill }} />
        {band > 0 && <rect x="0" y="0" width={w} height={band} style={{ fill: bandFill }} clipPath={`url(#${id})`} />}
        {stroke && <path d={d} style={{ fill: "none", stroke, strokeWidth: sw, strokeLinejoin: "round" }} />}
      </svg>
    );
  }
  return (
    <Tag ref={ref} className={"shape " + className} style={style} {...rest}>
      {svg}
      {children}
    </Tag>
  );
}

/* ───────── logo (SVG oficial, viewBox 0 0 967 547) ───────── */
export function Logo({ color = "currentColor", className = "", title = "CRIA" }) {
  return (
    <svg viewBox="0 0 967 547" className={className} role="img" aria-label={title}>
      <g fill={color}>
        <path d="M8.94 537.68L0 315.81L9.84 11.63L106.46.89L249.61 7.15L236.19 194.13L242.45 312.21L133.3 310.42L63.52 317.58L68.89 485.77L155.67 487.56L241.55 480.4L240.66 512.61L239.77 538.56L84.1 543.92L8.95 537.66Z" />
        <path d="M476.43 444.63L397.7 450.89L325.24 447.32L320.76 539.47L289.44 538.58L264.4 537.69L273.34 352.49L258.38 198.23L267.99 2.68L379.81 8.94L540.86 4.47L547.11 339.95L525.64 416L557.85 534.99L502.38 546.62L476.43 444.63ZM480.91 388.27L491.64 350.7L488.96 309.55L414.7 314.03L328.82 312.24L329.71 392.75L405.76 395.44Z" />
        <path d="M569.38 78.73V3.57L592.64 7.15L697.31 2.67L695.52 76.93L654.37 81.4L569.38 78.72ZM578.36 366.19L574.78 112.11L616.83 113.9L695.57 109.42L697.11 336.42L690.2 535.27L644.57 532.59L575.68 536.16L578.37 366.18Z" />
        <path d="M723.19 537.68L722.29 458.05L730.35 368.58L844.86 369.48L895.85 378.42L894.06 308.64L817.12 309.53L728.95 307.36L724.97 201.27L717.82 0L832.33 8.94L966.52 9.83L953.99 170.87L957.57 539.47L869.89 542.15L723.17 537.68ZM898.54 428.53L805.49 421.37L775.08 423.16L775.97 479.52L869.9 484L900.33 481.32Z" />
      </g>
    </svg>
  );
}

/* ───────── skyline de casinhas (vetor extraído do Figma) ───────── */
const skyRed = skyRedRaw.replaceAll('fill="#e92b1a"', 'fill="currentColor"').replace("<svg ", '<svg preserveAspectRatio="xMidYMax meet" ');
const skyMulti = skyMultiRaw.replace("<svg ", '<svg preserveAspectRatio="xMidYMax meet" ');
export function Skyline({ multi = false, className = "" }) {
  return (
    <div
      className={"skyline " + className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: multi ? skyMulti : skyRed }}
    />
  );
}

/* ───────── ícones (preenchidos, como no wireframe) ───────── */
export const Ico = {
  cal: (p) => (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M3 2.5h1.5V1h1.6v1.5h3.8V1h1.6v1.5H13a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 13 15H3a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 3 2.5Zm-.1 4.2v6.6h10.2V6.7H2.9Z" />
    </svg>
  ),
  clock: (p) => (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M8 .8a7.2 7.2 0 1 1 0 14.4A7.2 7.2 0 0 1 8 .8Zm-.8 3.3v4.6l3.6 2.2.8-1.3-2.8-1.7V4.1H7.2Z" />
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M8 1.2a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8ZM1.6 14.6c.3-3.3 2.9-5.3 6.4-5.3s6.1 2 6.4 5.3H1.6Z" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" {...p}>
      <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m3 8.5 3 3 7-7" />
    </svg>
  ),
  block: (p) => (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" {...p}>
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path stroke="var(--color-jovem)" strokeWidth="2" strokeLinecap="round" d="m5.5 5.5 5 5m0-5-5 5" />
    </svg>
  ),
  search: (p) => (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" {...p}>
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="m11 11 3.5 3.5" />
    </svg>
  ),
  camera: (p) => (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M8.6 4h6.8l1.5 2.2H20a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.2a2 2 0 0 1 2-2h3.1L8.6 4Zm3.4 4.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 2.2a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8Z" />
    </svg>
  ),
  heart: ({ filled, ...p }) => (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}>
      <path
        fill={filled ? "var(--color-jovem)" : "none"}
        stroke={filled ? "var(--color-jovem)" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
        d="M12 20.5s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.4-8 10.4Z"
      />
    </svg>
  ),
  upload: (p) => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M12 15V4M7 9l5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
    </svg>
  ),
  okc: ({ on, ...p }) => (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" {...p}>
      <circle cx="8" cy="8" r="6.6" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8.2l2 2 4-4.2" fill="none" stroke={on ? "#fff" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  xc: ({ on, ...p }) => (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" {...p}>
      <circle cx="8" cy="8" r="6.6" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" fill="none" stroke={on ? "#fff" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  download: (p) => (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" {...p}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
    </svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M4.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5h.8c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1H3.7c-.6 0-1-.4-1-1v-6c0-.6.4-1 1-1h.8Zm1.6 0h3.8V5a1.9 1.9 0 0 0-3.8 0v1.5Z" />
    </svg>
  ),
  menu: (p) => (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...p}>
      <path stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  ),
  clip: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="m20 11-8.2 8.2a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.2 8.2a1.7 1.7 0 0 1-2.4-2.4L14.6 7" />
    </svg>
  ),
};

/* ───────── topbar ───────── */
/* itens do menu por papel (mesmo padrão no desktop e no celular) */
function itensMenu({ logado, papel, go, trilha, onIdeias }) {
  if (!logado)
    return [
      ["Início", ["lp"], () => go("lp")],
      ["Entrar", ["login", "cadastro", "artista-cadastro", "parceiro-cadastro", "confira"], () => go("login", { trilha: trilha === "lp" ? "jovem" : trilha })],
      ["Sobre", [], () => go("lp", { secao: "sobre" })],
      ["Contato", [], () => go(null, { secao: "contato" })],
    ];
  if (papel === "artista")
    return [
      ["Início", ["lp"], () => go("lp")],
      ["Minhas turmas", ["artista", "oficina-artista", "certificado-educador"], () => go("artista", { secao: "proximas" })],
      ["Criar oficina", ["oficina-nova", "analise"], () => go("oficina-nova")],
      ["Ideias", [], () => onIdeias?.()],
    ];
  if (papel === "espaco")
    return [
      ["Início", ["lp"], () => go("lp")],
      ["Meus espaços", ["parceiro", "espaco"], () => go("parceiro", { secao: "proximas" })],
      ["Criar espaço", ["espaco-novo", "espaco-disponibilidade", "analise"], () => go("espaco-novo")],
    ];
  return [
    ["Início", ["lp"], () => go("lp")],
    ["Cursos", ["home", "curso"], () => go("home", { secao: "proximas" })],
    ["Perfil", ["perfil", "minha", "certificado"], () => go("perfil")],
    ["Ideias", [], () => onIdeias?.()],
  ];
}

export function Topbar({ logado, papel, go, trilha = "jovem", page, onIdeias, onSair }) {
  const casa = papel === "artista" ? "artista" : papel === "espaco" ? "parceiro" : "home";
  const [open, setOpen] = useState(false);
  const [conta, setConta] = useState(false);
  const links = itensMenu({ logado, papel, go, trilha, onIdeias });
  const ativo = (pgs) => pgs.includes(page);
  const minhaArea = () => go(papel === "jovem" ? "perfil" : casa);
  useEffect(() => {
    if (!conta) return undefined;
    const fecha = (e) => !e.target.closest(".topbar-conta") && setConta(false);
    document.addEventListener("pointerdown", fecha);
    return () => document.removeEventListener("pointerdown", fecha);
  }, [conta]);
  return (
    <header className="topbar" data-trilha={trilha}>
      <div className="wrap topbar-in">
        <button type="button" className="topbar-logo" onClick={() => go("lp")} aria-label="CRIA, ir para o início">
          <Logo color={trilha === "espaco" ? "#fff" : "var(--color-sol)"} />
        </button>
        <nav className="topbar-nav" aria-label="principal">
          {links.map(([label, pgs, fn]) => (
            <button key={label} type="button" data-t={label.toLowerCase()} className={ativo(pgs) ? "is-ativo" : ""} aria-current={ativo(pgs) ? "page" : undefined} onClick={fn}>
              <span>{label.toLowerCase()}</span>
            </button>
          ))}
          {logado && (
            <div className="topbar-conta">
              <button type="button" className="topbar-avatar" aria-label="minha conta" aria-expanded={conta} onClick={() => setConta((v) => !v)}>
                <img src={FOTO_PAPEL[papel]} alt="" />
              </button>
              {conta && (
                <div className="topbar-pop" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setConta(false); minhaArea(); }}>{papel === "jovem" ? "meu perfil" : "minha área"}</button>
                  <button type="button" role="menuitem" className="is-sair" onClick={() => { setConta(false); onSair?.(); }}>sair</button>
                </div>
              )}
            </div>
          )}
        </nav>
        <Burger open={open} onClick={() => setOpen((v) => !v)} />
      </div>
      <MenuMobile open={open} setOpen={setOpen} links={links} ativo={ativo} trilha={trilha} logado={logado} papel={papel} go={go} casa={casa} minhaArea={minhaArea} onSair={onSair} />
    </header>
  );
}

const COR_TRILHA = { jovem: "var(--color-jovem)", artista: "var(--color-artista)", lp: "var(--color-artista)", espaco: "var(--color-espaco)" };

function Burger({ open, onClick, className = "" }) {
  return (
    <button type="button" className={"topbar-burger burger" + (open ? " is-open" : "") + " " + className} aria-label={open ? "fechar menu" : "abrir menu"} aria-expanded={open} onClick={onClick}>
      <span />
      <span />
      <span />
    </button>
  );
}

/* menu do celular (Figma): tela cheia na cor da trilha, abre em círculo a partir do hambúrguer */
function MenuMobile({ open, setOpen, links, ativo, trilha, logado, papel, go, casa, minhaArea, onSair }) {
  const primeiro = useRef(null);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  useEffect(() => {
    if (!open) return undefined;
    const fecha = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > 900 && setOpen(false);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fecha);
    window.addEventListener("resize", onResize);
    const t = setTimeout(() => primeiro.current?.focus({ preventScroll: true }), 260);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", fecha);
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [open, setOpen]);
  if (!montado) return null;
  const cor = COR_TRILHA[trilha] || COR_TRILHA.jovem;
  const tinta = trilha === "espaco" ? "#fff" : "var(--color-sol)";
  const clique = (fn) => () => {
    setOpen(false);
    fn();
  };
  const tab = open ? 0 : -1;
  return createPortal(
    <div className={"mnav is-" + trilha + (open ? " is-open" : "")} style={{ "--mc": cor, "--mt": tinta }} aria-hidden={!open} inert={!open}>
      <div className="mnav-top">
        <button type="button" className="mnav-logo" onClick={clique(() => go("lp"))} aria-label="CRIA, ir para o início" tabIndex={tab}>
          <Logo color={tinta} />
        </button>
        <Burger open onClick={() => setOpen(false)} className="mnav-x" />
      </div>
      <nav className="mnav-links" aria-label="menu">
        {links.map(([label, pgs, fn], i) => (
          <button key={label} ref={i === 0 ? primeiro : undefined} type="button" style={{ "--i": i }} className={ativo(pgs) ? "is-ativo" : ""} aria-current={ativo(pgs) ? "page" : undefined} onClick={clique(fn)} tabIndex={tab}>
            <small>0{i + 1}</small>
            <span>{label.toLowerCase()}</span>
          </button>
        ))}
      </nav>
      {logado && (
        <div className="mnav-conta" style={{ "--i": links.length }}>
          <button type="button" onClick={clique(minhaArea)} tabIndex={tab}>
            <img src={FOTO_PAPEL[papel]} alt="" />
            minha área
          </button>
          <button type="button" className="mnav-sair" onClick={clique(() => onSair?.())} tabIndex={tab}>sair</button>
        </div>
      )}
      <p className="mnav-slogan" style={{ "--i": links.length + 1 }}>
        A cultura cria encontros.
        <br />E os encontros criam possibilidades.
      </p>
      <div className="mnav-sky" aria-hidden="true" dangerouslySetInnerHTML={{ __html: skyRed }} />
    </div>,
    document.body
  );
}

/* ───────── footer (igual em todas as páginas) ───────── */
export function Footer({ go, onInfo }) {
  const col = (titulo, itens) => (
    <div className="footer-col">
      <h3>{titulo}</h3>
      <ul>
        {itens.map(([t, fn]) => (
          <li key={t}>
            <button type="button" onClick={fn}>{t}</button>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="footer" id="contato">
      <div className="wrap footer-in">
        <div className="footer-left">
          <div className="footer-brand">
            <Logo color="var(--color-background)" className="footer-logo" />
            <div>
              <strong>CRIA</strong>
              <span>Cultura, Relações, Inclusão e Arte.</span>
            </div>
          </div>
          <p className="footer-slogan">A cultura cria encontros. E os encontros criam possibilidades.</p>
          <div className="footer-cols">
            {col("Explore", [
              ["Início", () => go("lp")],
              ["Sobre o CRIA", () => go("lp", { secao: "sobre" })],
              ["Como funciona", () => go("lp", { secao: "como" })],
              ["Oficinas", () => go("home")],
            ])}
            {col("Faça Parte", [
              ["Para jovens", () => go("cadastro")],
              ["Para artistas", () => go("artista-cadastro")],
              ["Para espaços parceiros", () => go("parceiro-cadastro")],
            ])}
            {col("Contato", [
              ["Fale com o CRIA", () => onInfo?.("contato")],
              ["Instagram", () => window.open("https://www.instagram.com/", "_blank", "noopener")],
            ])}
            {col("Informações", [
              ["Privacidade", () => onInfo?.("privacidade")],
              ["Termos de uso", () => onInfo?.("termos")],
              ["Acessibilidade", () => onInfo?.("acessibilidade")],
            ])}
          </div>
        </div>
        <div className="footer-right">
          <h3>Instituições Parceiras:</h3>
          <div className="footer-partners" role="img" aria-label="Itaú Cultural, Faber-Castell, Sesc e Natura" dangerouslySetInnerHTML={{ __html: partnersRaw }} />
          <div className="footer-partners-row" role="img" aria-label="Itaú Cultural, Faber-Castell, Natura e Sesc" dangerouslySetInnerHTML={{ __html: partnersRowRaw }} />
        </div>
      </div>
      <p className="wrap footer-copy">© 2026 CRIA. Todos os direitos reservados.</p>
    </footer>
  );
}

/* ───────── botão torto ───────── */
export function Btn({ children, cor = "var(--color-jovem)", texto = "#fff", forma = "a", className = "", size = "md", ...rest }) {
  const k = { xs: 3, sm: 3, md: 5, xl: 7 }[size] ?? 5;
  return (
    <Shape as="button" type="button" className={`btn btn-${size} ${className}`} style={{ "--fg": texto }} fill={cor} ins={FORMAS[forma](k)} r={size === "xl" ? 7 : 5} {...rest}>
      {children}
    </Shape>
  );
}

/* ───────── campo de formulário torto ───────── */
export function FieldBox({ forma = "a", area = false, children, className = "" }) {
  return (
    <Shape as="span" className={"field-box" + (area ? " is-area" : "") + " " + className} fill="var(--color-background)" stroke="var(--color-terra)" sw={1.2} ins={FORMAS[forma](area ? 7 : 5)} r={5}>
      {children}
    </Shape>
  );
}

export function Field({ label, id, forma = "a", as = "input", children, className = "", ...rest }) {
  const Tag = as;
  return (
    <label className={"field " + className} htmlFor={id}>
      <span className="field-label">{label}</span>
      <FieldBox forma={forma} area={as === "textarea"}>
        {children ? children : <Tag id={id} {...rest} />}
      </FieldBox>
    </label>
  );
}

/* ───────── box lateral (cabeçalho sólido + corpo contornado) ───────── */
export function SideBox({ titulo, cor = "var(--color-jovem)", children, className = "", head = 46 }) {
  return (
    <Shape as="section" className={"sidebox " + className} style={{ "--head": head + "px" }} fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={[0, 11, 9, 0]} r={9} band={cor === "transparent" ? 0 : head} bandFill={cor}>
      <h2 className="sidebox-head" style={{ color: cor === "transparent" ? "var(--color-terra)" : "#fff" }}>{titulo}</h2>
      <div className="sidebox-body">{children}</div>
    </Shape>
  );
}

export function DateChip({ data, hora, cor }) {
  return (
    <span className="datechip" style={{ "--c": cor }}>
      <b>{data}</b>
      <span>{hora}</span>
    </span>
  );
}

/* ───────── card de oficina ───────── */
export function OficinaCard({ o, onOpen, inscrito, onCert, i = 0 }) {
  const area = AREAS[o.area] || AREAS["artes visuais"];
  const passada = o.status === "passada";
  const agora = o.status === "agora";
  const finalizado = !!o.periodo;
  const cor = passada ? "var(--color-cinza)" : area.cor;
  const inv = i % 3 === 1;
  return (
    <Shape
      as="article"
      className={"card" + (passada ? " is-passada" : "") + (finalizado ? " is-final" : "") + (inv ? " inv" : "")}
      style={{ "--c": cor, "--d": `${(i % 6) * 40}ms` }}
      fill="var(--color-background)"
      stroke={cor}
      sw={1.4}
      ins={finalizado ? [0, 0, 0, 0] : inv ? [0, 14, 0, 0] : [16, 0, 0, 0]}
      r={10}
    >
      <button type="button" className="card-hit" onClick={onOpen} aria-label={`ver ${o.titulo}`} />
      {!finalizado && (
        <CardFoto inv={inv}>
          <img src={o.foto} alt="" loading="lazy" style={{ objectPosition: o.pos }} />
        </CardFoto>
      )}
      {finalizado && (
        <button type="button" className="card-cert" onClick={onCert}>
          baixar certificado
        </button>
      )}
      <div className="card-body">
        <Tag className="card-area" k={1.8} fill="var(--color-background)" stroke="var(--c)">{area.curta}</Tag>
        <p className="card-tipo">{o.tipo}</p>
        <h3 className="card-title">{o.titulo}</h3>
        <p className="card-desc">{o.resumo}</p>
        <ul className="card-meta">
          {finalizado ? (
            <>
              <li><Ico.cal />{o.periodo}</li>
              <li><Ico.clock />{o.duracao}</li>
              <li className="full"><Ico.user />{o.mentor}</li>
            </>
          ) : (
            <>
              <li><Ico.cal />{o.data}</li>
              <li><Ico.clock />{o.duracao}</li>
              <li><Ico.user />{o.mentor}</li>
            </>
          )}
        </ul>
        {!finalizado && !passada && o.status !== "ativo" && (
          <div className="card-tags">
            {agora ? (
              <span className="tag tag-encerrada"><Ico.block />inscrições encerradas</span>
            ) : inscrito ? (
              <span className="tag tag-inscrito"><Ico.check />inscrito!</span>
            ) : o.vagas === 0 ? (
              <span className="tag tag-cheia">turma cheia</span>
            ) : o.vagas <= 2 ? (
              <span className="tag tag-poucas"><Ico.check />só mais {o.vagas} vagas</span>
            ) : (
              <span className="tag tag-vagas"><Ico.check />{o.vagas} vagas</span>
            )}
            {o.amigo && !agora && (
              <span className="tag tag-amigo"><i />{o.amigo} vai nessa</span>
            )}
          </div>
        )}
      </div>
    </Shape>
  );
}

export function Modal({ children, onClose, className = "", label, ins = [0, 8, 5, 3], r = 10, fill = "var(--color-background)" }) {
  return (
    <div className="modal-veil" role="dialog" aria-modal="true" aria-label={label} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Shape className={"modal " + className} fill={fill} stroke="var(--color-terra)" sw={2} ins={ins} r={r}>
        <button type="button" className="modal-x" onClick={onClose} aria-label="fechar">x</button>
        <button type="button" className="modal-fechar" onClick={onClose}>fechar</button>
        {children}
      </Shape>
    </div>
  );
}

/* textos curtos do rodapé (protótipo) */
const INFOS = {
  contato: ["fale com o CRIA", ["Dúvidas, ideias ou parcerias? Escreve pra gente que a resposta chega em até 2 dias úteis.", "contato@criacapao.org.br", "R. Aglaê Reis, 337 - Capão Redondo, São Paulo"]],
  privacidade: ["privacidade", ["Seus dados (nome, contato, idade e bairro) servem só pra organizar inscrições, reservas e certificados.", "Nada é vendido ou repassado. Você pode pedir a exclusão da sua conta quando quiser."]],
  termos: ["termos de uso", ["O CRIA conecta jovens, artistas-educadores e espaços parceiros para oficinas culturais gratuitas.", "Cada proposta e cada espaço passam por análise. Respeito, cuidado e presença valem pra todo mundo."]],
  acessibilidade: ["acessibilidade", ["A plataforma funciona no celular, aceita navegação por teclado e leitor de tela, e usa contraste alto nos textos.", "Precisa de alguma adaptação numa oficina? Avisa na inscrição que a gente combina com o artista e o espaço."]],
};
export function ModalInfo({ qual, onClose }) {
  const [titulo, linhas] = INFOS[qual] || INFOS.contato;
  return (
    <Modal onClose={onClose} className="m-info" label={titulo} ins={[0, 6, 4, 2]}>
      <h2 className="m-info-t">{titulo}</h2>
      {linhas.map((l) => (
        <p key={l} className={l.includes("@") ? "m-info-mail" : ""}>{l.includes("@") ? <a href={"mailto:" + l}>{l}</a> : l}</p>
      ))}
    </Modal>
  );
}
