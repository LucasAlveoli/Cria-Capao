import { useState } from "react";
import { createPortal } from "react-dom";
import { Btn, Modal, Shape } from "../ui.jsx";
import { FIM, INI, PASSO, addDias, fromYmd, hhmm, inicioSemana, novoId, ymd } from "./Agenda.jsx";

/* ───────── recorrência (estilo "repetir" do Google Agenda) ─────────
   regra = { id, cada, dias:[0..6], faixas:[{ini,fim}], inicio:"aaaa-mm-dd", fim:{ tipo:"nunca"|"data"|"vezes", data, vezes } } */

const SIGLA = ["D", "S", "T", "Q", "Q", "S", "S"];
const CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const PLURAL = ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"];
const SEMANAS_NUNCA = 26; // "nunca termina": a agenda é preenchida por 6 meses

export const listaPt = (l) => (l.length <= 1 ? l.join("") : `${l.slice(0, -1).join(", ")} e ${l[l.length - 1]}`);
const ordenarDias = (dias) => [...dias].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // segunda primeiro
export const diasPlural = (dias) => listaPt(ordenarDias(dias).map((d) => PLURAL[d]));
const hCurta = (m) => (m % 60 ? hhmm(m).replace(":", "h") : `${String(m / 60).padStart(2, "0")}h`);
export const faixaTxt = (f) => `${hCurta(f.ini)} às ${hCurta(f.fim)}`;
const dataCurta = (s) => {
  const d = fromYmd(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function textoRecorrencia(r) {
  const cada = r.cada === 1 ? "toda semana" : `a cada ${r.cada} semanas`;
  const dias = listaPt(ordenarDias(r.dias).map((d) => CURTO[d]));
  const fim = r.fim.tipo === "data" ? `até ${dataCurta(r.fim.data)}` : r.fim.tipo === "vezes" ? `${r.fim.vezes} ${r.fim.vezes === 1 ? "vez" : "vezes"}` : "sem data de término";
  return { cada, dias, horas: listaPt(r.faixas.map(faixaTxt)), fim, inicio: dataCurta(r.inicio) };
}

export function gerarRecorrencia(r) {
  const out = [];
  const ini = fromYmd(r.inicio);
  const base = inicioSemana(ini);
  const limite = r.fim.tipo === "data" ? fromYmd(r.fim.data) : addDias(ini, 7 * SEMANAS_NUNCA);
  let vezes = 0;
  for (let d = new Date(ini); d <= limite; d = addDias(d, 1)) {
    const semana = Math.floor(Math.round((inicioSemana(d) - base) / 864e5) / 7);
    if (semana % r.cada !== 0 || !r.dias.includes(d.getDay())) continue;
    if (r.fim.tipo === "vezes" && vezes >= r.fim.vezes) break;
    vezes++;
    r.faixas.forEach((f) => out.push({ id: novoId(), dia: ymd(d), ini: f.ini, fim: f.fim, rec: r.id }));
  }
  return out;
}

const OPC = [];
for (let m = INI; m <= FIM; m += PASSO) OPC.push(m);

export function ModalRecorrencia({ base, onClose, onSalvar }) {
  const [cada, setCada] = useState(1);
  const [dias, setDias] = useState(base.dias.length ? base.dias : [fromYmd(base.inicio).getDay()]);
  const [faixas, setFaixas] = useState(base.faixas.length ? base.faixas : [{ ini: 10 * 60, fim: 12 * 60 }]);
  const [inicio, setInicio] = useState(base.inicio);
  const [fimTipo, setFimTipo] = useState("data");
  const [fimData, setFimData] = useState(() => ymd(addDias(fromYmd(base.inicio), 7 * 8)));
  const [vezes, setVezes] = useState(8);
  const [erro, setErro] = useState("");

  const regra = { id: "r" + novoId(), cada, dias, faixas, inicio, fim: { tipo: fimTipo, data: fimData, vezes: Number(vezes) || 1 } };
  const previa = dias.length && faixas.length && inicio ? gerarRecorrencia(regra) : [];
  const t = textoRecorrencia(regra);
  const nDias = new Set(previa.map((s) => s.dia)).size;

  const toggleDia = (d) => setDias((l) => (l.includes(d) ? l.filter((x) => x !== d) : [...l, d]));
  const mudaFaixa = (k, campo, v) =>
    setFaixas((l) =>
      l.map((f, j) => {
        if (j !== k) return f;
        const g = { ...f, [campo]: v };
        if (g.fim <= g.ini && campo === "ini") g.fim = Math.min(g.ini + 60, FIM);
        if (g.fim <= g.ini && campo === "fim") g.ini = Math.max(g.fim - 60, INI);
        return g;
      })
    );
  const salvar = () => {
    if (!dias.length) return setErro("escolha pelo menos um dia da semana.");
    if (!faixas.length) return setErro("adicione pelo menos um horário.");
    if (fimTipo === "data" && fimData < inicio) return setErro("a data de término vem antes do início.");
    onSalvar({ ...regra, faixas: [...faixas].sort((a, b) => a.ini - b.ini) }, previa);
  };

  const alvo = (typeof document !== "undefined" && document.querySelector(".cria")) || document.body;
  return createPortal(
    <Modal onClose={onClose} className="m-rec" label="registrar recorrência" ins={[0, 8, 6, 2]}>
      <h2 className="rec-titulo t-espaco">registrar recorrência</h2>
      <p className="rec-lead">Escolha como esses horários se repetem. A agenda é preenchida sozinha e você ainda pode ajustar cada dia depois.</p>
      <div className="rec-grid">
        <div className="rec-col">
          <div className="rec-linha">
            <span>repetir a cada</span>
            <select className="rec-sel" value={cada} onChange={(e) => setCada(Number(e.target.value))} aria-label="intervalo em semanas">
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>{cada === 1 ? "semana" : "semanas"}</span>
          </div>

          <p className="rec-label">nos dias</p>
          <div className="rec-dias" role="group" aria-label="dias da semana">
            {SIGLA.map((s, d) => (
              <button key={d} type="button" aria-pressed={dias.includes(d)} aria-label={LONGO[d]} className={dias.includes(d) ? "is-on" : ""} onClick={() => toggleDia(d)}>
                {s}
              </button>
            ))}
          </div>

          <p className="rec-label">horários</p>
          <ul className="rec-faixas">
            {faixas.map((f, k) => (
              <li key={k}>
                <select className="rec-sel" aria-label="início" value={f.ini} onChange={(e) => mudaFaixa(k, "ini", Number(e.target.value))}>
                  {OPC.slice(0, -1).map((m) => (
                    <option key={m} value={m}>{hhmm(m)}</option>
                  ))}
                </select>
                <span>até</span>
                <select className="rec-sel" aria-label="fim" value={f.fim} onChange={(e) => mudaFaixa(k, "fim", Number(e.target.value))}>
                  {OPC.slice(1).map((m) => (
                    <option key={m} value={m}>{hhmm(m)}</option>
                  ))}
                </select>
                {faixas.length > 1 && (
                  <button type="button" className="rec-x" aria-label="remover horário" onClick={() => setFaixas((l) => l.filter((_, j) => j !== k))}>×</button>
                )}
              </li>
            ))}
          </ul>
          <button type="button" className="rec-add" onClick={() => setFaixas((l) => [...l, { ini: Math.min((l[l.length - 1]?.fim ?? 600) + 60, FIM - 60), fim: Math.min((l[l.length - 1]?.fim ?? 600) + 120, FIM) }])}>
            + adicionar horário
          </button>
        </div>

        <div className="rec-col">
          <label className="rec-label" htmlFor="rec-ini">começa em</label>
          <input id="rec-ini" type="date" className="rec-data" value={inicio} onChange={(e) => e.target.value && setInicio(e.target.value)} />

          <p className="rec-label">termina</p>
          <div className="rec-fim" role="radiogroup" aria-label="quando termina">
            <label>
              <input type="radio" name="rec-fim" checked={fimTipo === "nunca"} onChange={() => setFimTipo("nunca")} />
              <i />nunca
            </label>
            <label>
              <input type="radio" name="rec-fim" checked={fimTipo === "data"} onChange={() => setFimTipo("data")} />
              <i />em
              <input type="date" className="rec-data is-mini" value={fimData} onChange={(e) => { setFimTipo("data"); e.target.value && setFimData(e.target.value); }} aria-label="data de término" />
            </label>
            <label>
              <input type="radio" name="rec-fim" checked={fimTipo === "vezes"} onChange={() => setFimTipo("vezes")} />
              <i />após
              <input type="number" min="1" max="52" className="rec-num" value={vezes} onChange={(e) => { setFimTipo("vezes"); setVezes(e.target.value); }} aria-label="número de ocorrências" />
              ocorrências
            </label>
          </div>

          <Shape className="rec-resumo" fill="oklch(0.502 0.151 273.9 / 0.1)" stroke="var(--color-espaco)" sw={1.6} ins={[0, 3, 2, 0]} r={6} aria-live="polite">
            <p>
              <b>↻ {t.cada}</b>
              {dias.length > 0 && <>, {t.dias}</>}
              {faixas.length > 0 && <>, das {t.horas}</>} · {t.fim}
            </p>
            <small>
              {previa.length ? `vai criar ${previa.length} ${previa.length === 1 ? "horário" : "horários"} em ${nDias} ${nDias === 1 ? "dia" : "dias"}, a partir de ${t.inicio}.` : "nenhum horário com essas escolhas."}
            </small>
          </Shape>
        </div>
      </div>
      {erro && <p className="auth-erro" role="alert">{erro}</p>}
      <div className="rec-btns">
        <button type="button" className="rec-cancelar" onClick={onClose}>cancelar</button>
        <Btn cor="var(--color-espaco)" size="sm" onClick={salvar}>registrar recorrência</Btn>
      </div>
    </Modal>,
    alvo
  );
}
