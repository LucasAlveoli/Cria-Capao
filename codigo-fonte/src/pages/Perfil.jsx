import { useState } from "react";
import { Btn, FieldBox, Ico, Logo, Modal, OficinaCard, Shape, SideBox, Tag } from "../ui.jsx";
import { AREAS, FINALIZADOS, getOficina } from "../data.js";
import { ProximasAulas } from "./HomeJovem.jsx";
import { Cronograma, InfoGrid, Mapa, Mentor } from "./Curso.jsx";
import avatar from "../assets/pf_natalia.webp";
import houses from "../assets/encontro_houses.webp";

/* ───────── modal de sugestões ───────── */
export function ModalSugestoes({ onClose, sugestoes, setSugestoes, user, go, abaInicial = "todas" }) {
  const [aba, setAba] = useState(abaInicial);
  const [o, setO] = useState("");
  const [p, setP] = useState("");
  const [ok, setOk] = useState(false);
  const curtir = (id) =>
    setSugestoes((l) => l.map((s) => (s.id === id ? { ...s, curtido: !s.curtido, likes: s.likes + (s.curtido ? -1 : 1) } : s)));
  const enviar = () => {
    if (!o.trim()) return;
    if (!user) {
      onClose();
      go("login", { trilha: "jovem", aviso: "entre para sugerir uma oficina." });
      return;
    }
    setSugestoes((l) => [
      { id: Date.now(), nome: `${user.nome} ${user.sobrenome}`.toLowerCase(), titulo: o.trim(), texto: p.trim() || "…", likes: 1, curtido: true, minha: true },
      ...l,
    ]);
    setO("");
    setP("");
    setOk(true);
    setTimeout(() => setOk(false), 1800);
  };
  return (
    <Modal onClose={onClose} className={"m-sug" + (ok ? " is-ok" : "")} label="sugestões" fill={ok ? "var(--color-vaga)" : "var(--color-background)"} ins={[0, 9, 9, 0]}>
      {ok && <p className="sug-enviado" role="status">enviado!</p>}
      <h2 className="m-big m-big-terra">sugestões</h2>
      {user && (
        <div className="sug-abas" role="tablist" aria-label="filtrar sugestões">
          <button type="button" role="tab" aria-selected={aba === "todas"} onClick={() => setAba("todas")}>todas</button>
          <button type="button" role="tab" aria-selected={aba === "minhas"} onClick={() => setAba("minhas")}>minhas ({sugestoes.filter((x) => x.minha).length})</button>
        </div>
      )}
      <div className="m-sug-grid">
        <ul className="sug-list">
          {aba === "minhas" && !sugestoes.some((x) => x.minha) && <li className="sug-vazio">você ainda não sugeriu nada. que tal a primeira?</li>}
          {sugestoes.filter((x) => aba === "todas" || x.minha).map((s) => (
            <Shape as="li" key={s.id} className={s.id > 1e6 ? "is-new" : ""} fill="var(--color-terra)" ins={[0, 5, 5, 0]} r={5}>
              <div>
                <span className="sug-nome">{s.nome}{s.minha && <i className="sug-sua">sua</i>}</span>
                <b>{s.titulo}</b>
                <em>{s.texto}</em>
              </div>
              <button type="button" className="sug-like" aria-pressed={s.curtido} aria-label={(s.curtido ? "descurtir " : "curtir ") + s.titulo} onClick={() => curtir(s.id)}>
                <Ico.heart filled={s.curtido} />
                <small>{s.likes}</small>
              </button>
            </Shape>
          ))}
        </ul>
        <div className="sug-form">
          <label>
            <span>o que você quer aprender?</span>
            <FieldBox forma="a">
              <input placeholder="ex.: grafite" value={o} onChange={(e) => setO(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} />
            </FieldBox>
          </label>
          <label>
            <span>por que isso importa?</span>
            <FieldBox forma="b" area>
              <textarea placeholder="ex.: acho importante pois..." value={p} onChange={(e) => setP(e.target.value)} />
            </FieldBox>
          </label>
          <div className="sug-send">
            <Btn size="xs" cor="var(--color-vaga)" onClick={enviar}>enviar!</Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ───────── perfil do jovem ───────── */
export function Perfil({ go, user, inscricoes, sugestoes, onSugerir, onVerTodas, onSair }) {
  const ativos = inscricoes.map(getOficina).filter((o) => o && o.status === "agora");
  const futuros = inscricoes.map(getOficina).filter((o) => o && (o.status === "proxima" || o.status === "oculta"));
  const minhas = sugestoes.filter((x) => x.minha).slice(0, 3);
  return (
    <div className="wrap perfil">
      <div className="perfil-top">
        <div className="perfil-main">
          <div className="perfil-id reveal">
            <img src={avatar} alt="Foto de perfil de Natália" className="perfil-avatar" />
            <div>
              <h1>
                <span className="t-jovem">{user.nome} {user.sobrenome}</span> <span className="perfil-idade"><span className="so-desk">| </span>{user.idade} anos</span>
              </h1>
              <dl className="perfil-dados">
                <div><dt>E-mail:</dt><dd>{user.email}</dd></div>
                <div><dt>Bairro:</dt><dd>{user.bairro}</dd></div>
                <div><dt>Celular:</dt><dd>{user.celular}</dd></div>
                <div><dt>Nascimento:</dt><dd>{user.nascimento}</dd></div>
              </dl>
              <div className="perfil-acoes">
                <button type="button" className="btn-tracejado">editar perfil</button>
                <button type="button" className="link perfil-sair" onClick={onSair}>sair da conta</button>
              </div>
            </div>
          </div>

          <section className="perfil-sec">
            <h2 className="h-sec">cursos que você <span className="t-jovem">está participando</span></h2>
            <p className="h-sub">você está com matrícula ativa em <b className="t-jovem">{String(ativos.length).padStart(2, "0")}</b> cursos/oficinas</p>
            <div className="grid2">
              {ativos.map((o, i) => (
                <OficinaCard key={o.id} o={{ ...o, status: "ativo" }} i={i} onOpen={() => go("minha", { id: o.id })} />
              ))}
            </div>
          </section>

          <section className="perfil-sec">
            <h2 className="h-sec">cursos que você <span className="t-jovem">participará em breve</span></h2>
            <p className="h-sub">você fez matrícula em <b className="t-jovem">{String(futuros.length).padStart(2, "0")}</b> cursos/oficinas futuros</p>
            <div className="grid2">
              {futuros.map((o, i) => (
                <OficinaCard key={o.id} o={{ ...o, status: "ativo" }} i={i} onOpen={() => go("curso", { id: o.id })} />
              ))}
            </div>
          </section>
        </div>

        <aside className="perfil-side">
          <ProximasAulas user={user} go={go} inscricoes={inscricoes} />
          <SideBox titulo="suas sugestões de oficinas" cor="transparent" className="sug-box">
            <ul className="sug-mini">
              {minhas.map((s, i) => (
                <Tag as="li" key={s.id} forma={i % 2 ? "b" : "a"} k={3.9} r={4} fill="var(--color-terra)" style={{ opacity: 1 - i * 0.18 }}>
                  <span>{s.titulo}</span>
                  <small>{s.likes}</small>
                  <Ico.heart filled />
                </Tag>
              ))}
            </ul>
            <Tag as="button" type="button" className="ver-todas" forma="b" k={2.5} fill="var(--color-sol)" onClick={onVerTodas || onSugerir}>ver todas</Tag>
          </SideBox>
        </aside>
      </div>

      <section className="perfil-sec">
        <h2 className="h-sec">cursos que você <span className="t-jovem">já finalizou</span></h2>
        <p className="h-sub">
          você já participou e finalizou <b className="t-jovem">{String(FINALIZADOS.length).padStart(2, "0")}</b> cursos/oficinas.
          <br />o <b>download dos certificados</b> estão disponíveis abaixo.
        </p>
        <div className="grid3 grid-final">
          {FINALIZADOS.map((o, i) => (
            <OficinaCard key={o.id} o={o} i={i} onOpen={() => go("certificado", { id: o.id })} onCert={() => go("certificado", { id: o.id })} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────── minha oficina (detalhes da inscrição) ───────── */
export const MATERIAIS = [
  ["Apostila 01 - Luz, contraste e cores", "27MB"],
  ["Apostila 03 - Grid e resoluções", "13MB"],
  ["Apostila 02 - Composição de imagem", "35MB"],
];

export function MinhaOficina({ o, go, user }) {
  const area = AREAS[o.area];
  const prox = o.cronograma[Math.min(3, o.cronograma.length - 1)];
  const [baixado, setBaixado] = useState(null);
  return (
    <div className="wrap minha" style={{ "--c": area.cor }}>
      <div className="minha-top">
        <div className="reveal">
          <p className="minha-kicker">minha oficina</p>
          <h1 className="curso-title">{o.tituloLongo || o.titulo}</h1>
          <Mentor o={o} />
        </div>
        <Shape className="encontro reveal" fill="var(--color-sol)" ins={[0, 0, 0, 0]} r={8}>
          <p>nosso próximo encontro</p>
          <h2>{prox[0]}</h2>
          <span className="encontro-data"><Ico.cal /> <b>{prox[1]}/2026</b> | das 10h às 12h</span>
          <img src={houses} alt="" />
        </Shape>
      </div>

      <div className="minha-mid">
        <InfoGrid o={{ ...o, inicio: `${o.cronograma[0][1]}/2026` }} user={user} go={go} pre="o que você precisa - pré requisitos" />
        <Shape as="section" className="materiais" fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={[0, 4, 0, 6]} r={16}>
          <h2>materiais</h2>
          <ul>
            {MATERIAIS.map(([t, s]) => (
              <li key={t}>
                <button type="button" onClick={() => setBaixado(t)}>
                  <Ico.download />
                  <span>
                    <b>{t}</b>
                    <small>{baixado === t ? "baixado ✓" : s}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Shape>
      </div>

      <div className="minha-bottom">
        <div>
          <Cronograma o={o} cor={area.cor} atual={3} longo />
          <Tag as="p" className="cert-lock" forma="b" k={3.5} r={4} fill="var(--color-cinza)"><Ico.lock /> certificado bloqueado</Tag>
        </div>
        <section className="avisos">
          <h2>avisos</h2>
          <article>
            <small>{o.mentor} · 15/10</small>
            <b>Tudo pronto pro encontro?</b>
            <p>Traga seu celular carregado e com espaço para novas fotos. Vamos experimentar a luz e olhar o bairro de outro jeito.</p>
          </article>
          <p className="avisos-foot">Os recados da sua turma aparecem aqui.</p>
        </section>
        <Mapa o={o} grande />
      </div>
    </div>
  );
}

/* ───────── certificado ───────── */
const tituloCaso = (t) => t.replace(/(^|\s)(\S)/g, (m, e, c) => e + c.toUpperCase());
const dataLonga = (p) => p.replace(/(\d{2}\/\d{2})\/(\d{2})(?!\d)/g, "$1/20$2");

export function CertDoc({ cor, nomeCor, kicker, nome, texto, dados, assinatura, voltar, onVoltar }) {
  return (
    <div className="wrap certpage">
      <div className="cert-actions no-print">
        <Tag as="button" type="button" className="cert-voltar" forma="b" k={2.4} fill="var(--color-background)" stroke="var(--color-terra)" sw={1.2} onClick={onVoltar}>{voltar}</Tag>
        <Btn cor="var(--color-vaga)" className="cert-baixar" onClick={() => window.print()}>baixar / imprimir pdf</Btn>
      </div>
      <article className="cert reveal" style={{ "--c": cor, "--n": nomeCor || cor }}>
        <div className="cert-faixa" />
        <Logo color={cor} className="cert-logo" />
        <p className="cert-kicker">{kicker}</p>
        <h1>{nome}</h1>
        <p className="cert-txt">{texto}</p>
        <dl className="cert-dados">
          {dados.map(([dt, dd]) => (
            <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>
          ))}
        </dl>
        {assinatura && (
          <div className="cert-assina">
            <span className="cert-sig">{assinatura}</span>
            <small>{assinatura} · artista-educador(a)</small>
          </div>
        )}
        <p className="cert-rodape"><b>CRIA</b> · Cultura, Relações, Inclusão e Arte.</p>
      </article>
    </div>
  );
}

export function Certificado({ o, user, go }) {
  const area = AREAS[o.area];
  return (
    <CertDoc
      cor={area.cor}
      nomeCor="var(--color-jovem)"
      kicker="certificado de participação"
      nome={`${user.nome} ${user.sobrenome}`}
      texto={<>participou e concluiu {o.tipo.startsWith("curso") ? "o curso" : "a oficina"} <b style={{ color: area.cor }}>{tituloCaso(o.titulo)}</b>, realizado presencialmente pela rede CRIA no Capão Redondo, São Paulo.</>}
      dados={[["carga horária", `${o.horas}h`], ["período", dataLonga(o.periodo)], ["frequência", o.frequencia]]}
      assinatura={o.mentor}
      voltar="voltar ao perfil"
      onVoltar={() => go("perfil")}
    />
  );
}

export function CertificadoEducador({ o, t, artista, go }) {
  const nomeOf = tituloCaso(o.tituloLongo || o.titulo).replace(/ (Com|O|A|De|Da|Do|E) /g, (m) => m.toLowerCase());
  return (
    <CertDoc
      cor="var(--color-artista)"
      kicker="certificado de atuação como educador(a)"
      nome={`${artista.nome} ${artista.sobrenome}`}
      texto={<>Atuou como artista-educador na oficina <b>{nomeOf}</b>, realizada presencialmente pela rede CRIA, no Capão Redondo, São Paulo, contribuindo para a formação cultural e artística dos jovens participantes.</>}
      dados={[["carga horária", `${o.horas}h`], ["período", dataLonga(t?.periodo || o.inicio)], ["oficina ministrada", nomeOf]]}
      voltar="voltar"
      onVoltar={() => go("artista")}
    />
  );
}
