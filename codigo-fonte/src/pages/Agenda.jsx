import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../ui.jsx";

/* ───────── agenda estilo Google Agenda ─────────
   arrastar no vazio = cria · arrastar o bloco = move (inclusive pra outro dia)
   puxar a borda de cima/baixo = ajusta · clicar = editar/excluir · Delete apaga */

export const INI = 7 * 60;
export const FIM = 22 * 60;
export const PASSO = 30;
const HPX = 44; // altura de 1 hora
const PX = HPX / 60;

export const DOW = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DOW_LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MES_CURTO = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

const p2 = (n) => String(n).padStart(2, "0");
export const hhmm = (m) => `${p2(Math.floor(m / 60))}:${p2(m % 60)}`;
export const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const fromYmd = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDias = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const inicioSemana = (d) => addDias(d, -d.getDay());
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const snap = (m) => Math.round(m / PASSO) * PASSO;
const piso = (m) => Math.floor(m / PASSO) * PASSO;
let seq = 0;
export const novoId = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`;

/* junta blocos que se sobrepõem ou encostam no mesmo dia */
export function juntar(slots) {
  const por = {};
  slots.forEach((s) => (por[s.dia] = por[s.dia] || []).push({ ...s }));
  const out = [];
  Object.values(por).forEach((l) => {
    l.sort((a, b) => a.ini - b.ini);
    let cur = null;
    l.forEach((s) => {
      if (cur && s.ini <= cur.fim) cur.fim = Math.max(cur.fim, s.fim);
      else {
        if (cur) out.push(cur);
        cur = { ...s };
      }
    });
    if (cur) out.push(cur);
  });
  return out;
}

export const totalHoras = (slots) => slots.reduce((t, s) => t + (s.fim - s.ini), 0) / 60;
const fmtHoras = (h) => (Number.isInteger(h) ? `${h}h` : `${Math.floor(h)}h${p2(Math.round((h % 1) * 60))}`);

const OPCOES = [];
for (let m = INI; m <= FIM; m += PASSO) OPCOES.push(m);

export function Agenda({ modo = "datas", slots, onChange, eventos = [], data, setData, legenda = true, onRecorrencia }) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const dragRef = useRef(null);
  const [largura, setLargura] = useState(900);
  const [vista, setVista] = useState(null);
  const [offset, setOffset] = useState(0); // modo semanal no celular
  const [drag, setDrag] = useState(null);
  const [sel, setSel] = useState(null);
  const [info, setInfo] = useState(null);
  const [agora, setAgora] = useState(() => new Date());

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setLargura(el.offsetWidth));
    ro.observe(el);
    setLargura(el.offsetWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const estreito = largura < 480;
  const v = vista || (largura < 470 ? "3" : "semana");
  const n = v === "dia" ? 1 : v === "3" ? 3 : 7;

  /* colunas visíveis */
  const cols = useMemo(() => {
    if (modo === "semanal") {
      const ini = n === 7 ? 0 : clamp(offset, 0, 7 - n);
      return Array.from({ length: n }, (_, i) => {
        const w = ini + i;
        return { key: String(w), dow: w, curto: DOW[w], longo: DOW_LONGO[w] };
      });
    }
    const base = n === 7 ? inicioSemana(data) : data;
    return Array.from({ length: n }, (_, i) => {
      const d = addDias(base, i);
      return { key: ymd(d), dow: d.getDay(), num: d.getDate(), date: d, curto: DOW[d.getDay()], longo: `${DOW_LONGO[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`, hoje: ymd(d) === ymd(agora) };
    });
  }, [modo, n, offset, data, agora]);

  const colIndex = Object.fromEntries(cols.map((c, i) => [c.key, i]));
  const visiveis = slots.filter((s) => s.dia in colIndex);

  /* posição do ponteiro → coluna + minuto */
  const pos = (e) => {
    const r = gridRef.current.getBoundingClientRect();
    const col = clamp(Math.floor(((e.clientX - r.left) / r.width) * n), 0, n - 1);
    const min = INI + (e.clientY - r.top) / PX;
    return { col, min };
  };

  const fechar = () => {
    setSel(null);
    setInfo(null);
  };

  const commit = (lista) => onChange(juntar(lista));

  const onGridDown = (e) => {
    if (e.button !== 0 || e.target.closest(".ag-ev, .ag-pop")) return;
    fechar();
    const p = pos(e);
    const ancora = clamp(piso(p.min), INI, FIM - PASSO);
    dragRef.current = { modo: "criar", col: p.col, ancora, x: e.clientX, y: e.clientY, moveu: false, toque: e.pointerType === "touch" };
    if (e.pointerType !== "touch") {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ok */ }
      e.preventDefault();
    }
  };

  const onEvDown = (e, s, alca) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setInfo(null);
    const p = pos(e);
    dragRef.current = { modo: alca || "mover", s, desloc: p.min - s.ini, x: e.clientX, y: e.clientY, moveu: false };
    try { gridRef.current.setPointerCapture(e.pointerId); } catch { /* ok */ }
  };

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moveu && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return;
    if (d.toque) {
      dragRef.current = null; // no toque, arrastar no vazio rola a tela
      return;
    }
    d.moveu = true;
    const p = pos(e);
    if (d.modo === "criar") {
      const cur = clamp(snap(p.min), INI, FIM);
      const ini = Math.min(d.ancora, cur >= d.ancora ? d.ancora : piso(p.min));
      const fim = cur > d.ancora ? cur : d.ancora + PASSO;
      setDrag({ dia: cols[d.col].key, ini: clamp(ini, INI, FIM - PASSO), fim: clamp(Math.max(fim, ini + PASSO), INI + PASSO, FIM), fantasma: true });
      return;
    }
    const { s } = d;
    const dur = s.fim - s.ini;
    if (d.modo === "mover") {
      const ini = clamp(snap(p.min - d.desloc), INI, FIM - dur);
      setDrag({ ...s, dia: cols[p.col].key, ini, fim: ini + dur });
    } else if (d.modo === "baixo") {
      setDrag({ ...s, fim: clamp(snap(p.min), s.ini + PASSO, FIM) });
    } else if (d.modo === "cima") {
      setDrag({ ...s, ini: clamp(snap(p.min), INI, s.fim - PASSO) });
    }
  };

  const onUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.modo === "criar") {
      const novo = d.moveu && drag ? { id: novoId(), dia: drag.dia, ini: drag.ini, fim: drag.fim } : { id: novoId(), dia: cols[d.col].key, ini: d.ancora, fim: Math.min(d.ancora + 60, FIM) };
      setDrag(null);
      const lista = juntar([...slots, novo]);
      onChange(lista);
      const achado = lista.find((x) => x.dia === novo.dia && x.ini <= novo.ini && x.fim >= novo.fim);
      setSel(achado ? achado.id : null);
      return;
    }
    if (!d.moveu) {
      setSel(d.s.id);
      return;
    }
    const final = drag;
    setDrag(null);
    if (final) {
      const lista = juntar([...slots.filter((x) => x.id !== d.s.id), { id: d.s.id, dia: final.dia, ini: final.ini, fim: final.fim }]);
      onChange(lista);
      const achado = lista.find((x) => x.dia === final.dia && x.ini <= final.ini && x.fim >= final.fim);
      setSel(achado ? achado.id : null);
    }
  };

  /* teclado: Delete apaga, Esc fecha */
  useEffect(() => {
    if (!sel) return undefined;
    const k = (e) => {
      if (e.target.closest && e.target.closest("input, select, textarea")) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onChange(slots.filter((x) => x.id !== sel));
        setSel(null);
      }
      if (e.key === "Escape") setSel(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [sel, slots, onChange]);

  const selSlot = slots.find((x) => x.id === sel);
  const editar = (campo, val) => {
    if (!selSlot) return;
    let { ini, fim } = selSlot;
    if (campo === "ini") {
      ini = val;
      if (fim <= ini) fim = Math.min(ini + 60, FIM);
    } else {
      fim = val;
      if (fim <= ini) ini = Math.max(fim - 60, INI);
    }
    commit(slots.map((x) => (x.id === sel ? { ...x, ini, fim } : x)));
  };
  const excluir = () => {
    onChange(slots.filter((x) => x.id !== sel));
    setSel(null);
  };

  /* navegação */
  const passo = n === 7 ? 7 : n;
  const nav = (dir) => {
    fechar();
    if (modo === "semanal") setOffset((o) => clamp(o + dir * n, 0, 7 - n));
    else setData(addDias(data, dir * passo));
  };
  const titulo = (() => {
    if (modo === "semanal") return "semana padrão";
    const a = cols[0].date;
    const b = cols[cols.length - 1].date;
    if (n === 1) return `${a.getDate()} de ${MESES[a.getMonth()]} de ${a.getFullYear()}`;
    if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} de ${MES_CURTO[a.getMonth()]} de ${a.getFullYear()}`;
    return `${a.getDate()} de ${MES_CURTO[a.getMonth()]} – ${b.getDate()} de ${MES_CURTO[b.getMonth()]} de ${b.getFullYear()}`;
  })();

  const horas = [];
  for (let m = INI; m < FIM; m += 60) horas.push(m);
  const altura = (FIM - INI) * PX;
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  const colHoje = cols.findIndex((c) => c.hoje);

  /* popover: posição relativa ao bloco */
  const popPos = (s) => {
    const i = colIndex[s.dia];
    if (i === undefined) return null;
    const gw = largura - (estreito ? 62 : 90);
    const cw = gw / n;
    const lado = n > 1 && (i + 1) * cw + 280 <= gw ? "dir" : n > 1 && i * cw - 280 >= 0 ? "esq" : "meio";
    return { i, lado, top: clamp((s.ini - INI) * PX, 0, altura - 170) };
  };
  const pp = selSlot && !drag ? popPos(selSlot) : null;
  const infoEv = info ? eventos.find((x) => x.id === info) : null;
  const pi = infoEv ? popPos(infoEv) : null;

  const blocoStyle = (s) => ({ top: (s.ini - INI) * PX, height: Math.max((s.fim - s.ini) * PX - 2, 14) });

  return (
    <div className={"ag" + (estreito ? " is-estreito" : "")} ref={rootRef} style={{ "--n": n }}>
      <div className="ag-bar">
        <div className="ag-nav">
          {modo === "datas" && (
            <button type="button" className="ag-hoje" onClick={() => { fechar(); setData(new Date()); }}>hoje</button>
          )}
          {(modo === "datas" || n < 7) && (
            <>
              <button type="button" className="ag-seta" aria-label="anterior" onClick={() => nav(-1)} disabled={modo === "semanal" && offset <= 0}>‹</button>
              <button type="button" className="ag-seta" aria-label="próximo" onClick={() => nav(1)} disabled={modo === "semanal" && offset + n >= 7}>›</button>
            </>
          )}
          <Tag as="b" className="ag-titulo" forma="b" k={3} r={4} fill="var(--color-terra)">{titulo}</Tag>
        </div>
        <div className="ag-vistas" role="group" aria-label="visualização">
          {[["dia", "dia"], ["3", "3 dias"], ["semana", "semana"]].map(([k, l]) => (
            <button key={k} type="button" aria-pressed={v === k} onClick={() => { fechar(); setVista(k); }}>{l}</button>
          ))}
        </div>
      </div>

      <div className="ag-cab">
        <span className="ag-fuso">GMT-3</span>
        <div className="ag-cab-dias">
          {cols.map((c) => (
            <div key={c.key} className={"ag-cab-dia" + (c.hoje ? " is-hoje" : "")}>
              <small>{c.curto}</small>
              {c.num !== undefined && (
                <button type="button" onClick={() => { fechar(); setVista("dia"); setData(c.date); }} aria-label={`ver ${c.longo}`}>
                  {c.num}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="ag-corpo">
        <div className="ag-horas" style={{ height: altura }}>
          {horas.map((m) => (
            <span key={m} style={{ top: (m - INI) * PX }}>{hhmm(m)}</span>
          ))}
        </div>
        <div
          className="ag-grade"
          ref={gridRef}
          style={{ height: altura }}
          onPointerDown={onGridDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
          role="application"
          aria-label="agenda de horários: arraste para criar um horário livre"
        >
          {cols.map((c, i) => (
            <div key={c.key} className={"ag-col" + (c.hoje ? " is-hoje" : "")} style={{ left: `calc(${i} * 100% / var(--n))` }} />
          ))}

          {eventos.filter((ev) => ev.dia in colIndex).map((ev) => (
            <button
              key={ev.id}
              type="button"
              className={"ag-ev ag-lock is-" + ev.tipo}
              style={{ ...blocoStyle(ev), left: `calc(${colIndex[ev.dia]} * 100% / var(--n) + 12px)` }}
              onPointerDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.stopPropagation(); setSel(null); setInfo(ev.id); }}
            >
              <b>{ev.titulo}</b>
              <small>{hhmm(ev.ini)} – {hhmm(ev.fim)}</small>
            </button>
          ))}

          {visiveis.map((s) => {
            const em = drag && !drag.fantasma && drag.id === s.id;
            return (
              <div
                key={s.id}
                className={"ag-ev ag-livre" + (sel === s.id ? " is-sel" : "") + (em ? " is-orig" : "")}
                style={{ ...blocoStyle(s), left: `calc(${colIndex[s.dia]} * 100% / var(--n) + 3px)` }}
                onPointerDown={(e) => onEvDown(e, s)}
              >
                <span className="ag-alca is-cima" onPointerDown={(e) => onEvDown(e, s, "cima")} />
                <b>livre{s.rec && <i className="ag-rec" aria-label="recorrente" title="horário recorrente">↻</i>}</b>
                <small>{hhmm(s.ini)} – {hhmm(s.fim)}</small>
                <span className="ag-alca is-baixo" onPointerDown={(e) => onEvDown(e, s, "baixo")} />
              </div>
            );
          })}

          {drag && drag.dia in colIndex && (
            <div className={"ag-ev ag-livre is-arrasto" + (drag.fantasma ? " is-fantasma" : "")} style={{ ...blocoStyle(drag), left: `calc(${colIndex[drag.dia]} * 100% / var(--n) + 3px)` }}>
              <b>{drag.fantasma ? "novo horário" : "livre"}</b>
              <small>{hhmm(drag.ini)} – {hhmm(drag.fim)}</small>
            </div>
          )}

          {colHoje >= 0 && agoraMin > INI && agoraMin < FIM && (
            <span className="ag-agora" style={{ top: (agoraMin - INI) * PX, left: `calc(${colHoje} * 100% / var(--n))` }} />
          )}

          {pp && (
            <div className={"ag-pop is-" + pp.lado} style={{ top: pp.top, "--i": pp.i }} role="dialog" aria-label="editar horário">
              <div className="ag-pop-top">
                <span className="ag-pop-cor" />
                <b>horário livre{selSlot.rec ? " · recorrente" : ""}</b>
                <button type="button" className="ag-pop-x" aria-label="fechar" onClick={() => setSel(null)}>×</button>
              </div>
              <p className="ag-pop-dia">{cols[pp.i].longo}</p>
              <div className="ag-pop-horas">
                <select aria-label="início" value={selSlot.ini} onChange={(e) => editar("ini", Number(e.target.value))}>
                  {OPCOES.slice(0, -1).map((m) => (
                    <option key={m} value={m}>{hhmm(m)}</option>
                  ))}
                </select>
                <span>–</span>
                <select aria-label="fim" value={selSlot.fim} onChange={(e) => editar("fim", Number(e.target.value))}>
                  {OPCOES.slice(1).map((m) => (
                    <option key={m} value={m}>{hhmm(m)}</option>
                  ))}
                </select>
              </div>
              <div className="ag-pop-acoes">
                {onRecorrencia && <button type="button" onClick={() => { const s = selSlot; setSel(null); onRecorrencia(s); }}>↻ registrar recorrência</button>}
                <button type="button" className="is-del" onClick={excluir}>excluir</button>
              </div>
            </div>
          )}

          {pi && (
            <div className={"ag-pop is-" + pi.lado} style={{ top: pi.top, "--i": pi.i }} role="dialog" aria-label="detalhes da reserva">
              <div className="ag-pop-top">
                <span className={"ag-pop-cor is-" + infoEv.tipo} />
                <b>{infoEv.tipo === "reservado" ? "reservado" : "aguardando sua aprovação"}</b>
                <button type="button" className="ag-pop-x" aria-label="fechar" onClick={() => setInfo(null)}>×</button>
              </div>
              <p className="ag-pop-dia">{cols[pi.i].longo} · {hhmm(infoEv.ini)} – {hhmm(infoEv.fim)}</p>
              <p className="ag-pop-ev"><b>{infoEv.titulo}</b> · {infoEv.quem}</p>
            </div>
          )}
        </div>
      </div>

      {legenda && (
        <div className="ag-legenda">
          <span><i className="is-livre" />livre</span>
          {eventos.some((x) => x.tipo === "reservado") && <span><i className="is-reservado" />reservado</span>}
          {eventos.some((x) => x.tipo === "pendente") && <span><i className="is-pendente" />aguardando aprovação</span>}
          <em>{estreito ? "toque num horário vazio para criar · arraste o bloco para mover" : "arraste no vazio para criar · arraste o bloco para mover · puxe a borda para ajustar"}</em>
        </div>
      )}
    </div>
  );
}

/* mini calendário do mês (barra lateral) */
export function MiniMes({ data, setData, marcados = [] }) {
  const [mes, setMes] = useState(() => new Date(data.getFullYear(), data.getMonth(), 1));
  useEffect(() => {
    setMes((m) => (m.getMonth() === data.getMonth() && m.getFullYear() === data.getFullYear() ? m : new Date(data.getFullYear(), data.getMonth(), 1)));
  }, [data]);
  const hoje = ymd(new Date());
  const semana = new Set(Array.from({ length: 7 }, (_, i) => ymd(addDias(inicioSemana(data), i))));
  const marc = new Set(marcados);
  const vazios = mes.getDay();
  const total = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const dias = Array.from({ length: total }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1));
  return (
    <div className="mini">
      <Tag as="div" className="mini-head" forma="b" k={4.1} r={4} fill="var(--color-terra)">
        <button type="button" aria-label="mês anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</button>
        <b>{MESES[mes.getMonth()]} {mes.getFullYear()}</b>
        <button type="button" aria-label="próximo mês" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</button>
      </Tag>
      <div className="mini-grid" role="grid" aria-label={`${MESES[mes.getMonth()]} ${mes.getFullYear()}`}>
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="mini-dow">{d}</span>
        ))}
        {Array.from({ length: vazios }, (_, i) => (
          <span key={"v" + i} />
        ))}
        {dias.map((d) => {
          const k = ymd(d);
          return (
            <button
              key={k}
              type="button"
              className={"mini-d" + (semana.has(k) ? " is-semana" : "") + (k === ymd(data) ? " is-sel" : "") + (k === hoje ? " is-hoje" : "") + (marc.has(k) ? " is-marc" : "")}
              onClick={() => setData(d)}
              aria-label={`${d.getDate()} de ${MESES[d.getMonth()]}${marc.has(k) ? ", tem horários livres" : ""}`}
            >
              {p2(d.getDate())}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { fmtHoras };
