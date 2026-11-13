import { useRef, useState } from "react";
import { Btn, Field, FieldBox, Ico, Logo, Modal, Shape, Tag } from "../ui.jsx";
import { AREAS, getOficina } from "../data.js";
import { AREAS_ARTISTICAS, ARTISTA, AULAS_SEMANA } from "../data2.js";
import { AuthShell, PhotoPage } from "./Auth.jsx";
import { Cronograma, InfoGrid, Mentor } from "./Curso.jsx";
import { MATERIAIS } from "./Perfil.jsx";
import { Analise, AreaHero, AulasSemana, InfoBox, NovaIdeia, TurmaCard } from "./Area.jsx";
import { EspacosSugeridos } from "./Match.jsx";

const LARANJA = "var(--color-artista)";

/* ───────── cadastro do artista (2 passos) ───────── */
export function CadastroArtista({ go }) {
  const [passo, setPasso] = useState(1);
  const [f, setF] = useState({ nome: "", sobrenome: "", celular: "", email: "", nascimento: "", senha: "", area: "", portfolio: "", sobre: "" });
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const proximo = () => {
    setErro("");
    setPasso(2);
  };
  const cadastrar = () => {
    go("analise", { trilha: "artista" });
  };
  return (
    <AuthShell trilha="artista" foto={passo === 1 ? "artista-cad" : "artista"}>
      {passo === 1 ? (
        <>
          <button type="button" className="auth-foto-perfil" aria-label="adicionar foto de perfil">
            <Ico.camera />
          </button>
          <div className="row2">
            <Field label="nome" id="a-nome" placeholder="seu nome" value={f.nome} onChange={set("nome")} />
            <Field label="sobrenome" id="a-sob" forma="b" placeholder="sobrenome" value={f.sobrenome} onChange={set("sobrenome")} />
          </div>
          <Field label="celular" id="a-cel" placeholder="(11) 9 0000-0000" inputMode="tel" value={f.celular} onChange={set("celular")} />
          <Field label="e-mail" id="a-email" forma="b" type="email" placeholder="nome@email.com" value={f.email} onChange={set("email")} />
          <div className="row2">
            <Field label="nascimento" id="a-nasc" placeholder="__/__/____" value={f.nascimento} onChange={set("nascimento")} />
            <Field label="senha" id="a-senha" forma="b" type="password" placeholder="mínimo 8 caracteres" value={f.senha} onChange={set("senha")} />
          </div>
          {erro && <p className="auth-erro" role="alert">{erro}</p>}
          <Btn className="auth-btn" cor={LARANJA} onClick={proximo}>próximo</Btn>
        </>
      ) : (
        <>
          <div className="row2">
            <Field label="área artística" id="a-area">
              <select id="a-area" value={f.area} onChange={set("area")}>
                <option value="">Selecione</option>
                {AREAS_ARTISTICAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>
            <label className="field" htmlFor="a-port">
              <span className="field-label">portfólio</span>
              <span className="anexo">
                <Ico.clip />
                <input id="a-port" type="text" placeholder="anexar" value={f.portfolio} onChange={set("portfolio")} />
              </span>
            </label>
          </div>
          <Field label="nos conte mais sobre você" id="a-sobre" as="textarea" className="field-sobre" placeholder="escreva aqui..." value={f.sobre} onChange={set("sobre")} />
          {erro && <p className="auth-erro" role="alert">{erro}</p>}
          <Btn className="auth-btn" cor={LARANJA} onClick={cadastrar}>cadastrar</Btn>
        </>
      )}
      <p className="auth-alt">
        já tem uma conta?
        <br />
        <button type="button" onClick={() => go("login", { trilha: "artista" })}>entre</button>
      </p>
    </AuthShell>
  );
}

/* ───────── enviado para análise (artista · espaço) ───────── */
export function EnviadoAnalise({ go, trilha = "artista", proposta }) {
  const cor = trilha === "artista" ? LARANJA : "var(--color-espaco)";
  return (
    <PhotoPage trilha={trilha} foto={trilha + "-env"} lado={trilha === "artista" ? "dir" : "esq"} className="enviado">
      <div className="enviado-txt reveal">
        <Logo color={cor} className="enviado-logo" />
        <h1>enviado para análise!</h1>
        <p className="enviado-bold">{trilha === "artista" ? "Valeu por querer criar com a gente!" : "Valeu por abrir espaço pra cultura!"}</p>
        <p>{proposta ? "Recebemos sua proposta! Agora é só aguardar nosso retorno." : "Recebemos seu cadastro! Agora é só aguardar nosso retorno."}</p>
        <Btn size="sm" cor={cor} className="enviado-btn" onClick={() => go(proposta ? (trilha === "artista" ? "artista" : "parceiro") : "lp")}>
          {proposta ? "voltar para minha área" : "voltar para o início"}
        </Btn>
      </div>
    </PhotoPage>
  );
}

/* ───────── área do artista ───────── */
export function HomeArtista({ go, turmas, propostas }) {
  const ativas = turmas.filter((t) => t.status === "ativa");
  const breve = turmas.filter((t) => t.status === "breve");
  const passadas = turmas.filter((t) => t.status === "passada");
  const card = (t, i) => {
    const o = getOficina(t.id);
    return <TurmaCard key={t.key || t.id + i} o={o} t={t} i={i} cor={AREAS[o.area].cor} area={o.area} onOpen={() => go("oficina-artista", { id: t.id })} onCert={() => go("certificado-educador", { id: t.id })} />;
  };
  return (
    <div className="wrap home area">
      <section className="home-top area-top">
        <AreaHero
          trilha="artista"
          ola={<>olá, <b>{ARTISTA.nome.toLowerCase()}</b>!</>}
          titulo={<><span className="so-desk">bem vindo</span><span className="so-mob">boas vindas</span> à área do <em className="lp-em">artista-educador</em></>}
          sub="veja aqui as informações sobre suas aulas e oficinas"
          stats={[["01", "TURMAS"], ["10", "ALUNOS"], ["02", "REALIZADAS"]]}
        />
        <AulasSemana aulas={AULAS_SEMANA} cor={LARANJA} onOpen={() => go("oficina-artista", { id: "fotografia-com-celular-agora" })} />
      </section>

      <section className="area-sec area-sec-first" id="sec-proximas">
        <div className="area-sec-l">
          <h2 className="h-sec t-artista">suas turmas ativas</h2>
          <p className="h-sub">crie, gerencie, multiplique.</p>
          <div className="grid2">{ativas.map(card)}</div>
        </div>
        <div className="area-sec-r">
          {propostas.length > 0 ? (
            propostas.map((p) => <Analise key={p.id} texto={`"${p.titulo}" em análise`} />)
          ) : (
            <Analise texto="cadastro de oficina em análise" />
          )}
          <NovaIdeia classe="so-desk-flex" pergunta="tem uma nova ideia?" botao="cadastrar oficina" cor={LARANJA} onClick={() => go("oficina-nova")} />
        </div>
      </section>

      <section className="area-sec" id="sec-agora">
        <h2 className="h-sec t-artista">turmas que começam em breve</h2>
        <p className="h-sub">acompanhe as inscrições para suas próximas oficinas</p>
        <div className="grid3">{breve.map(card)}</div>
      </section>

      <section className="area-sec">
        <h2 className="h-sec">turmas passadas</h2>
        <p className="h-sub">oficinas que já foram finalizadas</p>
        <div className="grid3">{passadas.map(card)}</div>
      </section>

      <section className="area-sec area-cta-mob">
        <NovaIdeia pergunta="tem uma nova ideia?" destaque="cadastre-a!" botao="cadastrar oficina" cor={LARANJA} onClick={() => go("oficina-nova")} />
      </section>
    </div>
  );
}

/* ───────── cadastro de oficina (proposta) ───────── */
const PERGUNTAS = [
  ["titulo", "qual atividade você gostaria de propor?", "ex.: fotografia com celular"],
  ["objetivo", "qual o objetivo dessa oficina?", "o que os jovens vão experimentar e aprender?"],
  ["prereq", "existem pré-requisitos para participação? quais?", "ex.: idade mínima de 16 anos"],
  ["encontros", "quantos encontros serão necessários?", "número de encontros"],
  ["cronograma", "qual o cronograma de aulas?", "ex.: aula 1 - composição, aula 2 - luz e sombra..."],
  ["materiais", "materiais ou estrutura necessários", "ex.: sala para 15 pessoas com mesas e projetor"],
  ["horarios", "dias e horários disponíveis", "ex.: sábados à tarde, ou quintas das 14h às 17h"],
];

export function CadastroOficina({ go, enviar, inicial, espacos = [] }) {
  const [f, setF] = useState(() => inicial || {});
  const [erro, setErro] = useState("");
  const [escolha, setEscolha] = useState(null);
  const submit = () => {
    setErro("");
    enviar({ ...f, titulo: (f.titulo || "").trim() || "nova oficina", espaco: escolha, id: Date.now() });
  };
  return (
    <PhotoPage trilha="artista" foto="artista-form" className="form-page of-2col">
      <div className="auth-form">
        <Logo color={LARANJA} className="auth-logo" />
        {inicial && <Tag as="p" className="auth-aviso" k={4} fill="var(--color-sol)">editando: {inicial.titulo}</Tag>}
        {/* desktop: duas colunas como no Figma; celular: uma coluna só */}
        <div className="of-cols">
          {[PERGUNTAS.slice(0, 4), PERGUNTAS.slice(4)].map((grupo, c) => (
            <div className="of-col" key={c}>
              {grupo.map(([k, l, ph], i) => (
                <Field key={k} label={l} id={"of-" + k} forma={(i + c) % 2 ? "b" : "a"} placeholder={ph} value={f[k] || ""} onChange={(e) => setF((v) => ({ ...v, [k]: e.target.value }))} />
              ))}
              {c === 0 ? (
                <Shape className="aviso-amarelo" fill="oklch(0.95 0.06 92)" stroke="var(--color-sol)" sw={2} ins={[0, 2, 0, 2]} r={4}>
                  <p>
                    <b>Cada sugestão passa por uma seleção cuidadosa.</b> O CRIA analisa trajetória, proposta e aderência às necessidades dos jovens.
                  </p>
                </Shape>
              ) : (
                <EspacosSugeridos espacos={espacos} f={f} escolha={escolha} setEscolha={setEscolha} />
              )}
            </div>
          ))}
        </div>
        {erro && <p className="auth-erro" role="alert">{erro}</p>}
        <Btn className="auth-btn btn-enviar" cor={LARANJA} onClick={submit}>enviar</Btn>
      </div>
    </PhotoPage>
  );
}

/* ───────── detalhe da oficina (visão do artista) ───────── */
const ALUNOS = ["Alice dos Santos Oliveira", "Bernardo Lopes Castro", "Camila Menezes Lima", "Esthefany Vilela de Aquino", "Gabriela dos Santos Muniz", "Lucas Alves de Oliveira", "Natália Miranda", "Paulo Pimenta dos Anjos"];

function ListaPresenca({ o }) {
  const encontros = o.cronograma.map(([, d]) => (d.length === 5 ? `${d}/2026` : d));
  const [enc, setEnc] = useState(0);
  const [pres, setPres] = useState({ 0: { 0: "p", 1: "f" } });
  const marca = (aluno, v) => setPres((m) => ({ ...m, [enc]: { ...(m[enc] || {}), [aluno]: (m[enc] || {})[aluno] === v ? undefined : v } }));
  const atual = pres[enc] || {};
  return (
    <Shape as="section" className="ofa-lista" fill="var(--color-background)" stroke="var(--color-terra)" sw={1.5} ins={[0, 0, 0, 0]} r={10} band={81} bandFill="var(--color-vaga)">
      <h2 className="ofa-h">lista de presença</h2>
      <Tag as="div" className="ofa-enc" forma="b" k={4.1} r={4} fill="var(--color-terra)">
        <button type="button" aria-label="encontro anterior" disabled={enc === 0} onClick={() => setEnc((e) => e - 1)}>‹</button>
        <b>encontro {enc + 1}</b>
        <button type="button" aria-label="próximo encontro" disabled={enc === encontros.length - 1} onClick={() => setEnc((e) => e + 1)}>›</button>
      </Tag>
      <p className="ofa-enc-data">{encontros[enc]}</p>
      <ul className="ofa-alunos">
        {ALUNOS.map((nome, i) => (
          <li key={nome}>
            <button type="button" className="ofa-p" aria-pressed={atual[i] === "p"} aria-label={`${nome} presente`} onClick={() => marca(i, "p")}><Ico.okc on={atual[i] === "p"} /></button>
            <button type="button" className="ofa-f" aria-pressed={atual[i] === "f"} aria-label={`${nome} faltou`} onClick={() => marca(i, "f")}><Ico.xc on={atual[i] === "f"} /></button>
            <span>{nome}</span>
          </li>
        ))}
      </ul>
    </Shape>
  );
}

function MuralAvisos({ o }) {
  const [avisos, setAvisos] = useState([{ t: "Tudo pronto pro encontro?", m: "Traga seu celular carregado e com espaço para novas fotos. Vamos experimentar a luz e olhar o bairro de outro jeito.", d: "15/10" }]);
  const [t, setT] = useState("");
  const [m, setM] = useState("");
  const enviar = (e) => {
    e.preventDefault();
    if (!m.trim()) return;
    setAvisos((l) => [{ t: t.trim() || "aviso", m: m.trim(), d: "hoje" }, ...l]);
    setT("");
    setM("");
  };
  return (
    <section className="ofa-mural">
      <h2 className="ofa-h">mural de avisos</h2>
      <div className="ofa-posts">
        {avisos.map((a, i) => (
          <article key={i} className={i === 0 && a.d === "hoje" ? "is-new" : ""}>
            <small>{o.mentor} · {a.d}</small>
            <b>{a.t}</b>
            <p>{a.m}</p>
          </article>
        ))}
      </div>
      <Shape as="form" className="ofa-coment" fill="var(--color-background)" stroke="var(--color-terra)" sw={1.2} ins={[0, 0, 0, 0]} r={8} onSubmit={enviar}>
        <input aria-label="assunto" placeholder="assunto" value={t} onChange={(e) => setT(e.target.value)} />
        <textarea aria-label="adicionar comentário" placeholder="adicionar comentário" rows={2} value={m} onChange={(e) => setM(e.target.value)} />
        <Tag as="button" type="submit" className="ofa-enviar" forma="b" k={1.8} r={2} fill="var(--color-terra)">enviar</Tag>
      </Shape>
    </section>
  );
}

function MateriaisArtista() {
  const [lista, setLista] = useState(MATERIAIS);
  const [arrastando, setArrastando] = useState(false);
  const ref = useRef(null);
  const add = (files) => {
    const novos = [...files].map((f) => [f.name.replace(/\.[^.]+$/, ""), `${Math.max(1, Math.round(f.size / 1e6))}MB`]);
    if (novos.length) setLista((l) => [...novos, ...l]);
  };
  return (
    <Shape as="section" className="materiais ofa-mat" fill="var(--color-background)" stroke="var(--color-terra)" sw={1.5} ins={[0, 0, 0, 0]} r={10}>
      <h2 className="ofa-h">materiais</h2>
      <button
        type="button"
        className={"ofa-up" + (arrastando ? " is-drag" : "")}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => { e.preventDefault(); setArrastando(false); add(e.dataTransfer.files); }}
        onPaste={(e) => add(e.clipboardData.files)}
      >
        <Ico.upload />
        <span>Clique ou cole um arquivo aqui</span>
      </button>
      <input ref={ref} type="file" multiple hidden onChange={(e) => add(e.target.files)} />
      <ul>
        {lista.map(([t, s]) => (
          <li key={t}>
            <button type="button">
              <Ico.download />
              <span>
                <b>{t}</b>
                <small>{s}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Shape>
  );
}

export function OficinaArtista({ o, go }) {
  const area = AREAS[o.area];
  return (
    <div className="wrap ofa" style={{ "--c": area.cor }}>
      <div className="ofa-top">
        <div className="ofa-foto reveal">
          <img className="curso-foto" src={o.fotoGrande || o.foto} alt="" style={{ objectPosition: o.pos }} />
          <button type="button" className="btn-tracejado" onClick={() => go("oficina-nova", { editar: o.id })}>editar oficina</button>
        </div>
        <div className="curso-head reveal">
          <h1 className="curso-title">{o.tituloLongo || o.titulo}</h1>
          <div className="curso-tags">
            <Tag className="ctag is-fill" forma="b" k={2.9} fill="var(--c)">{o.aulas}</Tag>
            <Tag className="ctag" forma="a" k={2.9} fill="var(--color-background)" stroke="var(--c)" sw={1.4}>{o.area}</Tag>
          </div>
          <p className="curso-desc">{o.descricao}</p>
          <Mentor o={o} />
        </div>
        <Cronograma o={o} cor={area.cor} atual={Math.min(3, o.cronograma.length - 1)} />
      </div>
      <div className="ofa-bot">
        <div className="ofa-main">
          <InfoGrid o={o} user go={go} pre="o que você precisa - pré requisitos" />
          <div className="ofa-duo">
            <MuralAvisos o={o} />
            <ListaPresenca o={o} />
          </div>
        </div>
        <div className="ofa-side">
          <MateriaisArtista />
          <Tag as="p" className="cert-lock ofa-cert" forma="b" k={4.9} r={4} fill="var(--color-cinza)"><Ico.lock /> certificado de educador bloqueado</Tag>
        </div>
      </div>
    </div>
  );
}
