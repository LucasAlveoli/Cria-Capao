import { Shape, Tag } from "../ui.jsx";
import { espacosPara } from "../match.js";

const DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_PL = ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"];
const h = (m) => (m % 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m / 60}h`);
export const horaTxt = (x) => `${DIA[x.dia]} · ${h(x.ini)}-${h(x.fim)}`;

function resumoPedido(p) {
  const out = [];
  if (p.pessoas) out.push(`${p.pessoas} pessoas`);
  p.precisa.forEach((r) => out.push(r));
  if (p.dias.length) out.push(p.dias.length === 7 ? "qualquer dia" : p.dias.map((d) => DIAS_PL[d]).join(", "));
  if (p.periodo) out.push(`${h(p.periodo[0])} às ${h(p.periodo[1])}`);
  return out;
}

/* painel dentro do cadastro de oficina: mostra os espaços que têm o que o artista pediu */
export function EspacosSugeridos({ espacos, f, escolha, setEscolha }) {
  const { pedido, lista } = espacosPara(espacos, f);
  const chips = resumoPedido(pedido);
  const filtrouHora = pedido.dias.length > 0 || pedido.periodo;

  return (
    <Shape as="section" className="mt" fill="var(--color-background)" stroke="var(--color-artista)" sw={1.6} ins={[0, 6, 4, 0]} r={9} aria-live="polite" aria-label="espaços parceiros sugeridos">
      <Tag as="h3" className="mt-tab" forma="b" k={3} r={4} fill="var(--color-artista)">espaços que combinam</Tag>
      {pedido.vazio ? (
        <p className="mt-vazio">
          Conte em <b>materiais ou estrutura</b> e em <b>dias e horários</b> o que você precisa (ex.: <em>sala para 15 pessoas com projetor e mesas</em>, <em>sábados à tarde</em>) que a gente mostra os espaços parceiros que têm isso.
        </p>
      ) : (
        <div className="mt-pedido">
          <span>você pediu:</span>
          {chips.map((c) => (
            <b key={c}>{c}</b>
          ))}
        </div>
      )}

      {!pedido.vazio && lista.length === 0 && <p className="mt-vazio">Nenhum espaço com horário livre agora. Envie mesmo assim: o CRIA procura um lugar pra você.</p>}

      <ul className="mt-lista">
        {(pedido.vazio ? [] : lista).map((r) => {
          const sel = escolha && escolha.espId === r.e.id;
          const pct = Math.round(r.nota * 100);
          return (
            <li key={r.e.id} className={"mt-card" + (sel ? " is-sel" : "") + (r.nota === 1 ? " is-top" : "")}>
              <img className="mt-foto" src={r.e.foto} alt={`Foto do espaço ${r.e.nome}`} />
              <div className="mt-corpo">
                <div className="mt-topo">
                  <div>
                    <b className="mt-nome">{r.e.nome}</b>
                    <small className="mt-local">{r.e.local.nome}</small>
                  </div>
                  <Tag className={"mt-nota" + (r.nota === 1 ? " is-ok" : r.nota >= 0.5 ? " is-meio" : " is-baixo")} k={2} r={3} fill={r.nota === 1 ? "var(--color-vaga)" : r.nota >= 0.5 ? "var(--color-sol)" : "var(--color-cinza)"}>
                    {r.nota === 1 ? "tem tudo" : `${pct}%`}
                  </Tag>
                </div>
                <ul className="mt-req">
                  {r.cabe !== null && <li className={r.cabe ? "is-ok" : "is-no"}>{r.cabe ? `cabe ${pedido.pessoas} (até ${r.cap})` : `cabe só ${r.cap}`}</li>}
                  {r.ok.map((x) => (
                    <li key={x} className="is-ok">{x}</li>
                  ))}
                  {r.falta.map((x) => (
                    <li key={x} className="is-no">sem {x}</li>
                  ))}
                </ul>
                <p className="mt-lbl">{!r.horarios.length ? "nada livre no que você pediu. outros horários livres:" : filtrouHora ? "livre no que você pediu:" : "horários livres:"}</p>
                {(r.horarios.length ? r.horarios : r.todos).length ? (
                  <div className="mt-horas" role="group" aria-label={`horários livres em ${r.e.nome}`}>
                    {(r.horarios.length ? r.horarios : r.todos).slice(0, 6).map((x) => {
                      const on = sel && escolha.dia === x.dia && escolha.ini === x.ini;
                      return (
                        <button
                          key={x.dia + "-" + x.ini}
                          type="button"
                          className={"mt-h" + (on ? " is-on" : "") + (r.horarios.length ? "" : " is-outro")}
                          aria-pressed={on}
                          onClick={() => setEscolha(on ? null : { espId: r.e.id, nome: r.e.nome, local: r.e.local.nome, ...x })}
                        >
                          {horaTxt(x)}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-sem">nada livre nesse dia ou período.</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {escolha && (
        <p className="mt-escolha" role="status">
          <b>✓ {escolha.nome}</b> · {horaTxt(escolha)}
          <small>quando você enviar, o espaço recebe o pedido de reserva para aprovar.</small>
        </p>
      )}
    </Shape>
  );
}
