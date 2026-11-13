import { useState } from "react";
import { Btn, Field, FieldBox, Logo, Modal, Shape, Tag } from "../ui.jsx";
import { DIAS, PARCEIRO, RESERVAS } from "../data2.js";
import { Agenda, MiniMes, addDias, fmtHoras, fromYmd, inicioSemana, juntar, totalHoras, ymd } from "./Agenda.jsx";
import { ModalRecorrencia, diasPlural, faixaTxt, gerarRecorrencia, textoRecorrencia } from "./Recorrencia.jsx";
import { CampoFotos, Carrossel } from "./Fotos.jsx";
import { AuthShell, PhotoPage } from "./Auth.jsx";
import { Analise, AreaHero, EspacoCard, NovaIdeia, Reservas } from "./Area.jsx";

const AZUL = "var(--color-espaco)";

/* ───────── cadastro do organizador + espaço ───────── */
export function CadastroParceiro({ go }) {
  const [f, setF] = useState({});
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const campo = (k, label, ph, forma = "a", extra = {}) => <Field label={label} id={"pc-" + k} forma={forma} placeholder={ph} value={f[k] || ""} onChange={set(k)} {...extra} />;
  const submit = () => {
    setErro("");
    go("analise", { trilha: "espaco" });
  };
  return (
    <AuthShell trilha="espaco" foto="espaco-cad">
      <div className="row2">{campo("espaco", "nome do espaço", "ex.: assoc. ponto de luz")}{campo("cnpj", "CNPJ", "XX.XXX.XXX/XXXX-XX", "b")}</div>
      <div className="row2">{campo("nome", "nome", "seu nome")}{campo("sobrenome", "sobrenome", "sobrenome", "b")}</div>
      <div className="row2">{campo("cargo", "qual seu cargo neste local?", "ex.: coordenador")}{campo("tel", "telefone", "(11) 9 0000-0000", "b")}</div>
      {campo("endereco", "endereço", "Rua, N123 - Bairro")}
      <div className="row2">{campo("email", "e-mail", "email@email.com", "a", { type: "email" })}{campo("site", "site", "www.site.com.br", "b")}</div>
      <div className="row2">{campo("senha", "criar senha", "mínimo 8 caracteres", "a", { type: "password" })}{campo("confirmar", "confirmar senha", "repetir a senha", "b", { type: "password" })}</div>
      {erro && <p className="auth-erro" role="alert">{erro}</p>}
      <Btn className="auth-btn" cor={AZUL} onClick={submit}>cadastrar</Btn>
      <p className="auth-alt">
        já tem uma conta?
        <br />
        <button type="button" onClick={() => go("login", { trilha: "espaco" })}>entre</button>
      </p>
    </AuthShell>
  );
}

/* ───────── área do parceiro ───────── */
export function HomeParceiro({ go, espacos, novos }) {
  const ativos = espacos.filter((e) => e.ativo && !e.analise);
  const inativos = espacos.filter((e) => !e.ativo && !e.analise);
  const livres = ativos.reduce((s, e) => s + e.livres, 0);
  const ocup = ativos.reduce((s, e) => s + e.preenchidos, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="wrap home area">
      <section className="home-top area-top">
        <AreaHero
          trilha="espaco"
          ola={<>Olá, <b>{PARCEIRO.nome}</b>!</>}
          titulo={<><span className="so-desk">Boas-vindas à área do parceiro</span><span className="so-mob">bem vindo à área do espaço-parceiro</span></>}
          sub="Veja aqui as informações sobre seus espaços"
          stats={[[pad(ativos.length), "ESPAÇOS"], [pad(livres), "HORÁRIOS LIVRES"], [pad(ocup), <><span className="so-desk">HORÁRIOS RESERVADOS</span><span className="so-mob">HORÁRIOS OCUPADOS</span></>]]}
        />
        <Reservas reservas={RESERVAS} />
      </section>

      <section className="area-sec area-sec-first" id="sec-proximas">
        <div className="area-sec-l">
          <h2 className="h-sec t-espaco">Seus espaços ativos</h2>
          <p className="h-sub">crie, gerencie e faça parte.</p>
          <div className="grid2">
            {ativos.map((e, i) => (
              <EspacoCard key={e.id} e={e} i={i} onOpen={() => go("espaco", { id: e.id })} />
            ))}
          </div>
        </div>
        <div className="area-sec-r">
          {novos.length > 0 ? (
            novos.map((n) => (espacos.some((x) => x.id === n.id) ? <Analise key={n.id} texto={`"${n.nome}" em análise`} onClick={() => go("espaco", { id: n.id })} /> : <Analise key={n.id} texto={`"${n.nome}" em análise`} />))
          ) : (
            <Analise texto="cadastro de espaço em análise" />
          )}
          <NovaIdeia classe="so-desk-flex" pergunta="tem um espaço livre?" botao="cadastrar espaço" cor={AZUL} onClick={() => go("espaco-novo")} />
        </div>
      </section>

      <section className="area-sec" id="sec-agora">
        <h2 className="h-sec t-espaco">Espaços inativos</h2>
        <p className="h-sub">espaços que você criou e foram desativados.</p>
        <div className="grid3">
          {inativos.map((e, i) => (
            <EspacoCard key={e.id} e={e} i={i} onOpen={() => go("espaco", { id: e.id })} />
          ))}
        </div>
      </section>

      <section className="area-sec area-cta-mob">
        <NovaIdeia pergunta="tem um espaço livre?" destaque="cadastre-o!" botao="cadastrar espaço" cor={AZUL} onClick={() => go("espaco-novo")} />
      </section>
    </div>
  );
}

/* ───────── cadastro de espaço (logado) ───────── */
export function CadastroEspaco({ go, rascunho, setRascunho }) {
  const [f, setF] = useState(rascunho || {});
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const continuar = () => {
    setErro("");
    setRascunho(f);
    go("espaco-disponibilidade");
  };
  return (
    <PhotoPage trilha="espaco" foto="espaco-form" lado="esq" className="form-page form-esq">
      <div className="esp-form reveal">
        <h1 className="h-form">
          apresente seu espaço
          <br />
          <em className="t-espaco">e o que ele oferece.</em>
        </h1>
        <p className="form-lead">O cadastro passa por validação. Conte sobre a estrutura, os recursos e os horários disponíveis para receber atividades.</p>
        <CampoFotos fotos={f.fotos || []} setFotos={(fotos) => setF((v) => ({ ...v, fotos }))} />
        <Field label="nome do espaço" id="e-nome" placeholder="ex.: quadra poliesportiva, sala de aula" value={f.nome || ""} onChange={set("nome")} />
        <Field label="endereço" id="e-end" forma="b" placeholder="rua, nº" value={f.endereco || ""} onChange={set("endereco")} />
        <Field label="capacidade aproximada" id="e-cap" placeholder="ex.: 15 pessoas" value={f.capacidade || ""} onChange={set("capacidade")} />
        <Field label="recursos disponíveis" id="e-rec" forma="b" placeholder="ex.: espaço aberto, computadores, projetor, cadeiras..." value={f.recursos || ""} onChange={set("recursos")} />
        <Field label="dias e horários disponíveis" id="e-hor" placeholder="ex.: segunda das 09h às 15h, terça às 16h" value={f.horarios || ""} onChange={set("horarios")} />
        {erro && <p className="auth-erro" role="alert">{erro}</p>}
        <Btn className="auth-btn" cor={AZUL} onClick={continuar}>continuar</Btn>
      </div>
    </PhotoPage>
  );
}

/* ───────── disponibilidade (agenda estilo Google Agenda + recorrência) ───────── */
const regraInicial = () => {
  const sab = addDias(new Date(), (6 - new Date().getDay() + 7) % 7);
  return { id: "r-inicial", cada: 1, dias: [6], faixas: [{ ini: 7 * 60, fim: 11 * 60 }, { ini: 12 * 60, fim: 15 * 60 }], inicio: ymd(sab), fim: { tipo: "vezes", vezes: 4 } };
};

/* "segunda das 09h às 15h, terça às 16h" vira recorrências semanais na agenda */
const DIAS_TXT = [[0, "dom"], [1, "seg"], [2, "ter"], [3, "qua"], [4, "qui"], [5, "sex"], [6, "sab"]];
function regrasDoTexto(txt) {
  if (!txt) return [];
  const sem = txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hoje = new Date();
  return sem
    .split(/[,;\n]| e (?=[a-z]{3})/)
    .map((parte, k) => {
      const dias = DIAS_TXT.filter(([, w]) => parte.includes(w)).map(([d]) => d);
      if (/fim de semana|fins de semana/.test(parte)) dias.push(0, 6);
      if (/dias uteis|durante a semana/.test(parte)) dias.push(1, 2, 3, 4, 5);
      const hs = [...parte.matchAll(/(\d{1,2})\s*h\s*(\d{2})?/g)].map((m) => Number(m[1]) * 60 + Number(m[2] || 0));
      if (!dias.length || !hs.length) return null;
      const ini = Math.max(7 * 60, Math.min(hs[0], 21 * 60));
      const fim = hs[1] && hs[1] > ini ? Math.min(hs[1], 22 * 60) : ini + 60;
      return { id: "r-txt" + k, cada: 1, dias: [...new Set(dias)], faixas: [{ ini, fim }], inicio: ymd(hoje), fim: { tipo: "data", data: ymd(addDias(hoje, 7 * 8)) } };
    })
    .filter(Boolean);
}

export function Disponibilidade({ rascunho, enviar }) {
  const [data, setData] = useState(() => new Date());
  const [recs, setRecs] = useState(() => (rascunho && rascunho.recorrencias) || (regrasDoTexto(rascunho && rascunho.horarios).length ? regrasDoTexto(rascunho.horarios) : [regraInicial()]));
  const [slots, setSlots] = useState(() => (rascunho && rascunho.slots) || juntar(recs.flatMap(gerarRecorrencia)));
  const [base, setBase] = useState(null);
  const dias = [...new Set(slots.map((s) => s.dia))].sort();
  const horas = totalHoras(slots);

  /* base da recorrência: um bloco da agenda, ou a semana que está na tela */
  const abrirSemana = () => {
    const ini = inicioSemana(data);
    const chaves = Array.from({ length: 7 }, (_, k) => ymd(addDias(ini, k)));
    const daSemana = slots.filter((x) => chaves.includes(x.dia)).sort((a, b) => (a.dia + a.ini > b.dia + b.ini ? 1 : -1));
    const faixas = [];
    daSemana.forEach((x) => !faixas.some((f) => f.ini === x.ini && f.fim === x.fim) && faixas.push({ ini: x.ini, fim: x.fim }));
    setBase({ dias: [...new Set(daSemana.map((x) => fromYmd(x.dia).getDay()))], faixas, inicio: daSemana[0]?.dia || ymd(data) });
  };
  const abrirBloco = (x) => setBase({ dias: [fromYmd(x.dia).getDay()], faixas: [{ ini: x.ini, fim: x.fim }], inicio: x.dia });
  const salvarRec = (regra, novos) => {
    setRecs((l) => [...l, regra]);
    setSlots((l) => juntar([...l, ...novos]));
    setBase(null);
    setData(fromYmd(regra.inicio));
  };
  const removerRec = (id) => {
    setRecs((l) => l.filter((r) => r.id !== id));
    setSlots((l) => l.filter((x) => x.rec !== id));
  };

  return (
    <div className="wrap disp2">
      <aside className="disp2-side reveal">
        <h1 className="h-form">
          fale mais sobre
          <br />
          <em className="t-espaco">a disponibilidade.</em>
        </h1>
        <p className="form-lead">Arraste na agenda para marcar os horários em que o espaço fica livre. Se eles se repetem, registre a recorrência.</p>
        <MiniMes data={data} setData={setData} marcados={dias} />
        <p className="disp2-resumo" aria-live="polite">
          {slots.length === 0 ? (
            "nenhum horário marcado ainda."
          ) : (
            <>
              <b>{slots.length} {slots.length === 1 ? "horário" : "horários"}</b> em {dias.length} {dias.length === 1 ? "dia" : "dias"} · {fmtHoras(horas)} livres
            </>
          )}
        </p>
        <button type="button" className="rec-btn" onClick={abrirSemana}>
          <span aria-hidden="true">↻</span> registrar recorrência
        </button>
        {recs.length > 0 && (
          <ul className="rec-lista" aria-label="recorrências registradas">
            {recs.map((r) => {
              const t = textoRecorrencia(r);
              return (
                <li key={r.id}>
                  <span className="rec-lista-ico" aria-hidden="true">↻</span>
                  <p>
                    <b>{t.cada}, {t.dias}</b>
                    <small>das {t.horas} · {t.fim}</small>
                  </p>
                  <button type="button" aria-label="remover recorrência" onClick={() => removerRec(r.id)}>×</button>
                </li>
              );
            })}
          </ul>
        )}
        <Shape className="aviso-amarelo" fill="oklch(0.95 0.06 92)" stroke="var(--color-sol)" sw={2} ins={[0, 2, 0, 2]} r={4}>
          <p>
            <b>Cada cadastro passa por uma seleção cuidadosa.</b> O CRIA analisa espaço, local e aderência às necessidades dos jovens.
          </p>
        </Shape>
        <Btn className="auth-btn" cor={AZUL} onClick={() => enviar({ ...(rascunho || {}), slots, dias, recorrencias: recs, id: "novo-" + Date.now() })}>continuar</Btn>
      </aside>
      <div className="disp2-agenda reveal">
        <Agenda modo="datas" slots={slots} onChange={setSlots} data={data} setData={setData} onRecorrencia={abrirBloco} />
      </div>
      {base && <ModalRecorrencia base={base} onClose={() => setBase(null)} onSalvar={salvarRec} />}
    </div>
  );
}

/* ───────── detalhe do espaço ───────── */
const WD = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, "sáb": 6 };
const minDe = (h) => {
  const [a, b] = h.replace("*", "").split("h");
  return Number(a) * 60 + Number(b || 0);
};
const hTxt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}h${String(m % 60).padStart(2, "0")}`;
const ddmm = (s) => {
  const d = fromYmd(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const slotsDaGrade = (e) =>
  juntar(e.grade.flatMap((l, i) => l.filter((h) => !h.endsWith("*")).map((h) => ({ id: `${e.id}-${i}-${h}`, dia: String(i), ini: minDe(h), fim: Math.min(minDe(h) + 120, 22 * 60) }))));

/* junta tudo que o formulário gera numa semana-tipo (D..S) + datas futuras */
function resumoEspaco(e) {
  const hoje = ymd(new Date());
  const slots = (e.slots || slotsDaGrade(e)).filter((s) => s.dia.length === 1 || s.dia >= hoje);
  const sem = Array.from({ length: 7 }, () => []);
  slots.forEach((s) => {
    const d = s.dia.length === 1 ? Number(s.dia) : fromYmd(s.dia).getDay();
    if (!sem[d].some((f) => f.ini === s.ini && f.fim === s.fim)) sem[d].push({ ini: s.ini, fim: s.fim });
  });
  e.reservados.forEach((r) => {
    const d = WD[r.dia];
    const ini = minDe(r.hora);
    sem[d] = sem[d].filter((f) => f.ini !== ini);
    sem[d].push({ ini, fim: ini + 120, res: true, titulo: r.titulo, quem: r.quem });
  });
  sem.forEach((l) => l.sort((a, b) => a.ini - b.ini));
  const livres = sem.flatMap((l) => l.filter((f) => !f.res));
  const diasLivres = sem.map((l, d) => (l.some((f) => !f.res) ? d : -1)).filter((d) => d >= 0);
  const datadas = [...new Set(slots.filter((s) => s.dia.length > 1).map((s) => s.dia))].sort();
  /* horas por semana: na semana-tipo soma tudo; nas datas, média das semanas com horário */
  let porSemana = livres.reduce((t, f) => t + f.fim - f.ini, 0) / 60;
  if (datadas.length) {
    const semanas = new Set(datadas.map((d) => ymd(inicioSemana(fromYmd(d)))));
    porSemana = Math.round((totalHoras(slots.filter((s) => s.dia.length > 1)) / semanas.size) * 2) / 2;
  }
  return {
    sem,
    dias: diasLivres.length ? diasPlural(diasLivres) : e.dias,
    faixa: livres.length ? `das ${hTxt(Math.min(...livres.map((f) => f.ini)))} às ${hTxt(Math.max(...livres.map((f) => f.fim)))}` : e.horario,
    porSemana: livres.length ? fmtHoras(porSemana) : "-",
    proximas: datadas.slice(0, 5).map(ddmm),
    maisDatas: Math.max(0, datadas.length - 5),
  };
}

function InfoLinha({ label, children, wide }) {
  return (
    <div className={"ei" + (wide ? " is-wide" : "")}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function DetalheEspaco({ e, decidir, excluir }) {
  const [coment, setComent] = useState({});
  const [excluindo, setExcluindo] = useState(false);
  const [escolha, setEscolha] = useState({});
  const fotos = e.fotos && e.fotos.length ? e.fotos : e.analise ? [] : [e.foto];
  const r = resumoEspaco(e);
  const recs = e.recorrencias || [];
  const status = e.analise ? ["em análise", "var(--color-sol)", " is-analise"] : e.ativo ? ["disponível", "var(--color-espaco)", ""] : ["desativado", "var(--color-cinza)", " is-off"];
  return (
    <div className="wrap curso esp-det" style={{ "--c": AZUL }}>
      <div className="curso-top">
        {fotos.length ? (
          <Carrossel fotos={fotos} alt={`fotos do espaço ${e.nome}`} className="curso-foto esp-carr reveal" />
        ) : (
          <div className="curso-foto esp-carr esp-semfoto reveal">
            <span>nenhuma foto enviada ainda</span>
          </div>
        )}
        <div className="curso-head reveal">
          <div className="esp-head">
            <h1 className="curso-title">{e.nome}</h1>
            <div className="esp-acoes">
              <button type="button" className="btn-tracejado is-dash">editar espaço</button>
              <button type="button" className="btn-excluir" onClick={() => setExcluindo(true)}>excluir espaço</button>
            </div>
          </div>
          <Tag className={"esp-status" + status[2]} k={2.9} fill={status[1]}>{status[0]}</Tag>
          <Shape as="section" className="sidebox eventos-box" style={{ "--head": "54px" }} fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={[0, 9, 10, 0]} r={9} band={54} bandFill={AZUL}>
            <h2 className="sidebox-head" style={{ color: "#fff" }}>próximos eventos nesse espaço</h2>
            <ul className="eventos">
              {e.eventos.length === 0 && <li className="vazio-li">{e.analise ? "os eventos aparecem aqui depois da aprovação." : "nenhum evento por aqui."}</li>}
              {e.eventos.map(([t, q], i) => (
                <li key={i}>
                  <b>{t}</b>
                  <span>| {q}</span>
                  <small>
                    <b>03/10</b> | 10h00
                  </small>
                </li>
              ))}
            </ul>
          </Shape>
        </div>
      </div>

      <div className="curso-bottom esp-bottom">
        <dl className="esp-info reveal">
          <InfoLinha label="local" wide>
            <b>{e.local.nome}</b> | {e.local.endereco}
          </InfoLinha>
          <InfoLinha label="capacidade máxima">{e.capacidade || "-"}</InfoLinha>
          <InfoLinha label="recursos disponíveis">
            {e.recursos.length ? (
              <ul className="bullets">
                {e.recursos.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ) : (
              "-"
            )}
          </InfoLinha>
          <InfoLinha label="dias disponíveis">{r.dias}</InfoLinha>
          <InfoLinha label="horário">{r.faixa}</InfoLinha>
          <InfoLinha label="recorrência">
            {recs.length ? (
              <ul className="ei-rec">
                {recs.map((x) => {
                  const t = textoRecorrencia(x);
                  return (
                    <li key={x.id}>
                      <span aria-hidden="true">↻</span> {t.cada}, {t.dias} · {t.fim}
                    </li>
                  );
                })}
              </ul>
            ) : (
              e.recorrencia || "datas avulsas"
            )}
          </InfoLinha>
          <InfoLinha label="horas livres por semana">{r.porSemana}</InfoLinha>
          {r.proximas.length > 0 && (
            <InfoLinha label="próximas datas livres" wide>
              {r.proximas.join(" · ")}
              {r.maisDatas > 0 && <small className="ei-mais"> e mais {r.maisDatas} {r.maisDatas === 1 ? "data" : "datas"}</small>}
            </InfoLinha>
          )}
        </dl>

        <div className="semana-wrap">
          <div className="semana">
            <Tag as="h2" className="semana-tab" forma="b" k={5.2} r={5} fill="var(--color-espaco)">horários deste espaço</Tag>
            <div className="semana-grid">
              {DIAS.map((d, i) => (
                <div key={i} className="semana-col">
                  <b>{d}</b>
                  {r.sem[i].map((f) => (
                    <span key={f.ini + "-" + f.fim} className={"hchip-g" + (f.res ? " is-res" : "")} title={f.res ? `reservado: ${f.titulo} (${f.quem})` : `livre ${faixaTxt(f)}`}>
                      <b>{hTxt(f.ini)}</b>
                      <small>às {hTxt(f.fim)}</small>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <Shape as="section" className="slot-box" fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={[0, 2, 0, 2]} r={6}>
            <h3 className="t-espaco">horários reservados:</h3>
            {e.reservados.length === 0 && <p className="slot-vazio">nenhum horário reservado.</p>}
            {e.reservados.map((x, i) => (
              <div key={i} className="slot">
                <span className="datechip" style={{ "--c": AZUL }}>
                  <b>{x.dia}</b>
                  <span>{x.hora}</span>
                </span>
                <div>
                  <b>{x.titulo}</b>
                  <small>{x.quem}</small>
                </div>
              </div>
            ))}
          </Shape>

          <Shape as="section" className="slot-box" fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={[2, 0, 2, 0]} r={6}>
            <h3 className="t-artista">aprovações pendentes:</h3>
            {e.pendentes.length === 0 && <p className="slot-vazio">nada pendente por enquanto. ✓</p>}
            {e.pendentes.map((p) => (
              <div key={p.id} className="slot slot-pend">
                <span className="datechip" style={{ "--c": "var(--color-artista)" }}>
                  <b>{p.dia}</b>
                  <span>{p.hora}</span>
                </span>
                <div>
                  <b>{p.titulo}</b>
                  <small>{p.quem}</small>
                  <em>{p.texto}</em>
                  <div className="radios" role="radiogroup" aria-label={`decisão sobre ${p.titulo}`}>
                    <label className="r-ok">
                      <input type="radio" name={"d-" + p.id} checked={escolha[p.id] === "aprovar"} onChange={() => setEscolha((s) => ({ ...s, [p.id]: "aprovar" }))} />
                      <i />aprovar
                    </label>
                    <label className="r-no">
                      <input type="radio" name={"d-" + p.id} checked={escolha[p.id] === "reprovar"} onChange={() => setEscolha((s) => ({ ...s, [p.id]: "reprovar" }))} />
                      <i />reprovar
                    </label>
                  </div>
                  <div className="comentario">
                    <input
                      placeholder="adicionar comentário"
                      value={coment[p.id] || ""}
                      onChange={(ev) => setComent((c) => ({ ...c, [p.id]: ev.target.value }))}
                      onKeyDown={(ev) => ev.key === "Enter" && escolha[p.id] && decidir(e.id, p, escolha[p.id], coment[p.id])}
                    />
                    <button type="button" aria-label="enviar decisão" disabled={!escolha[p.id]} onClick={() => decidir(e.id, p, escolha[p.id], coment[p.id])}>
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 4.5 21 12 3 19.5l3-7.5-3-7.5Z" fill="currentColor" /><path d="M6 12h9" stroke="var(--color-background)" strokeWidth="1.6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Shape>
        </div>
      </div>
      {excluindo && (
        <Modal onClose={() => setExcluindo(false)} className="m-excluir" label="excluir espaço" ins={[0, 6, 4, 2]}>
          <h2 className="m-info-t t-jovem">excluir espaço?</h2>
          <p>
            <b>{e.nome}</b> sai da plataforma e os horários livres somem da agenda. {e.reservados.length > 0 ? `As ${e.reservados.length} reservas já feitas serão avisadas.` : ""}
          </p>
          <div className="rec-btns">
            <button type="button" className="rec-cancelar" onClick={() => setExcluindo(false)}>cancelar</button>
            <Btn size="sm" cor="var(--color-jovem)" onClick={() => excluir?.(e.id)}>excluir espaço</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export { Logo, FieldBox };
