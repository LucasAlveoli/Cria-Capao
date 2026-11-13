import { useEffect, useRef, useState } from "react";
import { Ico, Shape, Tag } from "../ui.jsx";

/* ───────── carrossel de fotos do espaço ─────────
   arrasta/rola no celular (scroll-snap), setas e bolinhas no desktop, ← → no teclado */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function Carrossel({ fotos, alt, className = "", indice, setIndice, children }) {
  const trilho = useRef(null);
  const [interno, setInterno] = useState(0);
  const i = indice ?? interno;
  const setI = setIndice ?? setInterno;
  const n = fotos.length;

  const ir = (k, suave = true) => {
    const el = trilho.current;
    if (!el) return;
    const alvo = clamp(k, 0, n - 1);
    el.scrollTo({ left: alvo * el.clientWidth, behavior: suave ? "smooth" : "auto" });
    setI(alvo);
  };

  /* quando o índice muda por fora (miniaturas), acompanha */
  useEffect(() => {
    const el = trilho.current;
    if (!el || !el.clientWidth) return;
    if (Math.round(el.scrollLeft / el.clientWidth) !== i) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, [i]);
  useEffect(() => {
    if (i > n - 1) setI(Math.max(0, n - 1));
  }, [n, i, setI]);

  const onScroll = () => {
    const el = trilho.current;
    if (!el || !el.clientWidth) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== i) setI(k);
  };

  return (
    <div className={"carr " + className} role="region" aria-roledescription="carrossel" aria-label={alt}>
      <div
        className="carr-trilho"
        ref={trilho}
        onScroll={onScroll}
        tabIndex={0}
        aria-label={`${alt}: foto ${i + 1} de ${n}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); ir(i + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); ir(i - 1); }
        }}
      >
        {fotos.map((f, k) => (
          <img key={k + f.slice(-24)} className="carr-foto" src={f} alt={`${alt}, foto ${k + 1} de ${n}`} draggable={false} loading={k === 0 ? "eager" : "lazy"} />
        ))}
      </div>
      {n > 1 && (
        <>
          <button type="button" className="carr-seta is-esq" aria-label="foto anterior" disabled={i === 0} onClick={() => ir(i - 1)}>‹</button>
          <button type="button" className="carr-seta is-dir" aria-label="próxima foto" disabled={i === n - 1} onClick={() => ir(i + 1)}>›</button>
          <div className="carr-dots" role="tablist" aria-label="escolher foto">
            {fotos.map((_, k) => (
              <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`foto ${k + 1}`} className={k === i ? "is-on" : ""} onClick={() => ir(k)} />
            ))}
          </div>
          <Tag className="carr-cont" forma="b" k={2} r={3} fill="var(--color-terra)">{i + 1}/{n}</Tag>
        </>
      )}
      {children}
    </div>
  );
}

/* reduz a foto antes de guardar (cabe no armazenamento do navegador) */
const reduzir = (file) =>
  new Promise((res) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1100 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.74));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      res(null);
    };
    img.src = url;
  });

const MAX = 10;

/* campo do formulário: várias fotos, com capa, remover e miniaturas */
export function CampoFotos({ fotos, setFotos }) {
  const inp = useRef(null);
  const [i, setI] = useState(0);
  const [sobre, setSobre] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const adicionar = async (lista) => {
    const arquivos = [...lista].filter((f) => f.type.startsWith("image/")).slice(0, MAX - fotos.length);
    if (!arquivos.length) return;
    setCarregando(true);
    const novas = (await Promise.all(arquivos.map(reduzir))).filter(Boolean);
    setCarregando(false);
    setFotos([...fotos, ...novas]);
    setI(fotos.length);
  };
  const remover = () => {
    setFotos(fotos.filter((_, k) => k !== i));
    setI(Math.max(0, i - 1));
  };
  const capa = () => {
    setFotos([fotos[i], ...fotos.filter((_, k) => k !== i)]);
    setI(0);
  };
  const soltar = {
    onDragOver: (e) => {
      e.preventDefault();
      setSobre(true);
    },
    onDragLeave: () => setSobre(false),
    onDrop: (e) => {
      e.preventDefault();
      setSobre(false);
      adicionar(e.dataTransfer.files);
    },
  };
  const input = (
    <input
      ref={inp}
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={(e) => {
        adicionar(e.target.files);
        e.target.value = "";
      }}
    />
  );

  if (!fotos.length)
    return (
      <div className="campo-fotos">
        {input}
        <Shape as="button" type="button" className={"upload-foto" + (sobre ? " is-sobre" : "")} fill="var(--color-camera)" ins={[0, 0, 0, 0]} r={8} aria-label="adicionar fotos do espaço" onClick={() => inp.current.click()} {...soltar}>
          <span className="upload-in">
            <Ico.camera />
            {carregando && <b>carregando...</b>}
            <small>clique ou arraste · até {MAX} fotos · a primeira vira a capa</small>
          </span>
        </Shape>
      </div>
    );

  return (
    <div className={"campo-fotos" + (sobre ? " is-sobre" : "")} {...soltar}>
      {input}
      <Carrossel fotos={fotos} alt="fotos do espaço" className="cf-carr" indice={i} setIndice={setI}>
        {i === 0 && <Tag className="cf-capa" k={2.4} fill="var(--color-sol)">capa</Tag>}
        <div className="cf-acoes">
          {i > 0 && <button type="button" onClick={capa}>definir como capa</button>}
          <button type="button" className="is-del" onClick={remover} aria-label={`remover foto ${i + 1}`}>remover</button>
        </div>
      </Carrossel>
      <div className="cf-thumbs" role="list" aria-label="miniaturas">
        {fotos.map((f, k) => (
          <button key={k + f.slice(-24)} type="button" role="listitem" className={"cf-thumb" + (k === i ? " is-on" : "")} onClick={() => setI(k)} aria-label={`ver foto ${k + 1}`}>
            <img src={f} alt="" />
          </button>
        ))}
        {fotos.length < MAX && (
          <button type="button" className="cf-thumb cf-mais" onClick={() => inp.current.click()} aria-label="adicionar mais fotos">
            {carregando ? "…" : "+"}
          </button>
        )}
      </div>
      <p className="cf-dica">{fotos.length} de {MAX} fotos · arraste novas fotos aqui</p>
    </div>
  );
}
