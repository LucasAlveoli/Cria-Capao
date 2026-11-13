import { useMemo, useState } from "react";
import { Btn, DateChip, FORMAS, Ico, OficinaCard, Shape, SideBox } from "../ui.jsx";
import { OFICINAS, PILLS, PROXIMAS_AULAS } from "../data.js";
import hero from "../assets/home_hero.webp";

function toNum(ddmm) {
  const [d, m] = ddmm.split("/").map(Number);
  return m * 100 + d;
}
function parseData(v) {
  const m = v.match(/^(\d{1,2})\/(\d{1,2})/);
  return m ? Number(m[2]) * 100 + Number(m[1]) : null;
}

export function ProximasAulas({ user, go, inscricoes }) {
  const aulas = user ? PROXIMAS_AULAS.filter((a) => inscricoes.includes(a.id)) : [];
  return (
    <SideBox titulo="suas próximas aulas" className="proximas">
      {!user ? (
        <p className="sidebox-vazio">
          você não tem aulas marcadas.
          <br />
          <button type="button" className="link" onClick={() => go("login", { trilha: "jovem" })}>entre</button> para ver sua agenda.
        </p>
      ) : aulas.length === 0 ? (
        <p className="sidebox-vazio">você não tem aulas marcadas.</p>
      ) : (
        <ul className="aulas">
          {aulas.map((a, i) => (
            <li key={i}>
              <button type="button" onClick={() => go("minha", { id: a.id })}>
                <DateChip data={a.data} hora={a.hora} cor={a.cor} />
                <span>
                  <b>{a.titulo}</b>
                  <small>{a.local}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </SideBox>
  );
}

export default function HomeJovem({ go, user, inscricoes, onSugerir }) {
  const [area, setArea] = useState("todas");
  const [q, setQ] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const filtra = (lista) =>
    lista.filter((o) => {
      if (area !== "todas" && o.area !== area) return false;
      if (q) {
        const t = (o.titulo + " " + o.resumo + " " + o.mentor + " " + o.area).toLowerCase();
        if (!t.includes(q.toLowerCase())) return false;
      }
      const n = toNum(o.data);
      const a = parseData(de);
      const b = parseData(ate);
      if (a && n < a) return false;
      if (b && n > b) return false;
      return true;
    });

  const grupos = useMemo(
    () => ({
      proxima: filtra(OFICINAS.filter((o) => o.status === "proxima")),
      agora: filtra(OFICINAS.filter((o) => o.status === "agora")),
      passada: filtra(OFICINAS.filter((o) => o.status === "passada")),
    }),
    [area, q, de, ate]
  );

  const total = grupos.proxima.length + grupos.agora.length + grupos.passada.length;

  const renderSecao = ({ id, titulo, destaque, sub, lista }) =>
    lista.length > 0 && (
      <section className="home-sec" id={"sec-" + id}>
        <h2 className="h-sec">
          {titulo} <span className="t-jovem">{destaque}</span>
        </h2>
        <p className="h-sub">{sub}</p>
        <div className="grid3">
          {lista.map((o, i) => (
            <OficinaCard key={o.id} o={o} i={i} inscrito={inscricoes.includes(o.id)} onOpen={() => go("curso", { id: o.id })} />
          ))}
        </div>
      </section>
    );

  return (
    <div className="wrap home">
      <section className="home-top">
        <div className="home-hero reveal">
          <div className="home-hero-txt">
            <p className="home-ola">
              Olá, <b>{user ? user.nome : "usuário"}</b>!
            </p>
            <h1><span className="so-desk">O</span><span className="so-mob">o</span> que você quer <em className="lp-em">aprender hoje?</em></h1>
            <p className="t-jovem home-hero-sub">cursos e oficinas gratuitas pela região</p>
          </div>
          <img src={hero} alt="Dois jovens de mãos dadas erguidas" className="home-hero-img" />
        </div>
        <ProximasAulas user={user} go={go} inscricoes={inscricoes} />
      </section>

      <section className="filtros" aria-label="filtros">
        <div className="filtros-l">
          <p className="filtros-label">área</p>
          <div className="pills" role="group" aria-label="área">
            {PILLS.map((p, i) => (
              <Shape
                as="button"
                key={p.id}
                type="button"
                className={"pill" + (area === p.id ? " is-on" : "")}
                style={{ "--c": p.cor }}
                fill={area === p.id ? p.cor : "var(--color-background)"}
                stroke={p.cor}
                sw={1.2}
                ins={FORMAS[i % 2 ? "b" : "a"](2)}
                r={3}
                aria-pressed={area === p.id}
                onClick={() => setArea(p.id)}
              >
                {p.id === "artes visuais" ? <><span className="so-desk">artes visuais</span><span className="so-mob">visual</span></> : p.id}
              </Shape>
            ))}
          </div>
          <div className="busca-row">
            <label className="busca">
              <Ico.search />
              <input type="search" placeholder="buscar" value={q} onChange={(e) => setQ(e.target.value)} aria-label="buscar oficinas" />
            </label>
            <div className="periodo">
              <Ico.cal />
              <span>período:</span>
              <input aria-label="data inicial" placeholder="  /  " value={de} onChange={(e) => setDe(e.target.value)} maxLength={5} />
              <span>-</span>
              <input aria-label="data final" placeholder="  /  " value={ate} onChange={(e) => setAte(e.target.value)} maxLength={5} />
            </div>
          </div>
        </div>
        <div className="filtros-r">
          <p>
            não achou a oficina
            <br />
            que queria?
          </p>
          <Btn className="btn-sugerir" onClick={onSugerir}>sugerir oficina</Btn>
        </div>
      </section>

      {total === 0 && (
        <div className="vazio">
          <p>nenhuma oficina com esses filtros.</p>
          <button type="button" className="link" onClick={() => { setArea("todas"); setQ(""); setDe(""); setAte(""); }}>limpar filtros</button>
        </div>
      )}

      {renderSecao({id: "proximas", titulo: "Oficinas", destaque: "próximas", sub: "se inscreva e participe das oficinas abaixo!", lista: grupos.proxima,})}
      {renderSecao({id: "agora", titulo: "Acontecendo", destaque: "agora", sub: "o pessoal já tá a todo vapor nessas aqui!", lista: grupos.agora,})}
      {renderSecao({id: "passadas", titulo: "Oficinas", destaque: "passadas", sub: "veja o que já aconteceu por aqui...", lista: grupos.passada,})}

      <section className="home-sugerir">
        <p>não achou a oficina<br />que queria?</p>
        <Btn className="btn-sugerir" onClick={onSugerir}>sugerir oficina</Btn>
      </section>
    </div>
  );
}
