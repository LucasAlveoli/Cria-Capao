/*
  CRIA Capão — plataforma web (TCC). Etapa 1: landing page + trilha do jovem.
  Assunto: oficinas culturais gratuitas no Capão Redondo, conectando jovens, artistas-educadores e espaços.
  Plano: cópia fiel do wireframe do Figma. Cores por trilha (jovem vermelho, artista laranja, espaço azul),
  amarelo/marrom/creme de base, Arimo (família Helvetica/Arial), formas tortas via clip-path,
  fotos P&B recortadas e skyline vetorial extraídos do próprio PDF do Figma, footer marrom em todas as páginas.
  Fluxo (userflow do jovem): LP → login/cadastro → home (catálogo + filtros) → curso → inscrição
  (vagas? modal inscrito! : turma cheia/lista de interesse) → perfil → minha oficina → certificado.
*/
import { useCallback, useEffect, useState } from "react";
import { preCarregar, fadeImagens } from "./imagens.js";

preCarregar();
import "./cria.css";
import { Footer, ModalInfo, Skyline, Topbar } from "./ui.jsx";
import { getOficina, INSCRICOES_INICIAIS, SUGESTOES_INICIAIS, USUARIA } from "./data.js";
import Landing from "./pages/Landing.jsx";
import { CadastroJovem, ConfiraEmail, Login } from "./pages/Auth.jsx";
import HomeJovem from "./pages/HomeJovem.jsx";
import Curso, { ModalInscrito, ModalSemVagas } from "./pages/Curso.jsx";
import { Certificado, CertificadoEducador, MinhaOficina, ModalSugestoes, Perfil } from "./pages/Perfil.jsx";
import { CadastroArtista, CadastroOficina, EnviadoAnalise, HomeArtista, OficinaArtista } from "./pages/Artista.jsx";
import { CadastroEspaco, CadastroParceiro, DetalheEspaco, Disponibilidade, HomeParceiro } from "./pages/Parceiro.jsx";
import { ARTISTA, ESPACOS_INICIAIS, PARCEIRO, TURMAS_INICIAIS } from "./data2.js";

const KEY = "cria-capao-v3";
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

function parseHash() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  const [page, id] = h.split("/");
  return { page: page || "lp", id: id ? decodeURIComponent(id) : undefined };
}

export default function App() {
  const saved = load();
  const [route, setRoute] = useState(() => ({ ...parseHash() }));
  const [papel, setPapel] = useState(saved.papel ?? (saved.logado ? "jovem" : null));
  const logado = papel === "jovem";
  const [turmas, setTurmas] = useState(saved.turmas ?? TURMAS_INICIAIS.map(({ foto, ...t }) => t));
  const [propostas, setPropostas] = useState(saved.propostas ?? []);
  const [espacosEstado, setEspacosEstado] = useState(saved.espacos ?? null);
  const [novosEspacos, setNovosEspacos] = useState(saved.novosEspacos ?? []);
  const [rascunho, setRascunho] = useState(null);
  const [inscricoes, setInscricoes] = useState(saved.inscricoes ?? INSCRICOES_INICIAIS);
  const [lista, setLista] = useState(saved.lista ?? []);
  /* migra o que ficou salvo antes das sugestões da Natália existirem */
  const [sugestoes, setSugestoes] = useState(() => {
    const s = saved.sugestoes;
    if (!s || !s.some((x) => x.id === 101)) return [...(s || []).filter((x) => x.minha && x.id > 1000), ...SUGESTOES_INICIAIS];
    return s;
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [pendente, setPendente] = useState(null); // inscrição que aguardava login

  const user = logado ? USUARIA : null;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ papel, inscricoes, lista, sugestoes, turmas, propostas, espacos: espacosEstado, novosEspacos }));
    } catch {
      /* sem storage: segue em memória */
    }
  }, [papel, inscricoes, lista, sugestoes, turmas, propostas, espacosEstado, novosEspacos]);

  /* fotos não vão pro storage: reidrata a partir dos dados de exemplo */
  const turmasView = turmas.map((t) => ({ ...t, foto: (TURMAS_INICIAIS.find((x) => x.id === t.id) || TURMAS_INICIAIS[0]).foto }));
  /* fotos de exemplo são reidratadas; as enviadas pelo parceiro ficam salvas (já reduzidas) */
  const espacos = (espacosEstado || ESPACOS_INICIAIS.map(({ foto, fotos, ...e }) => e)).map((e) => {
    const ini = ESPACOS_INICIAIS.find((x) => x.id === e.id);
    if (ini) return { ...e, foto: ini.foto, fotos: ini.fotos };
    return { ...e, foto: (e.fotos && e.fotos[0]) || ESPACOS_INICIAIS[0].foto };
  });
  const setEspacos = (fn) => setEspacosEstado(fn(espacos.map(({ foto, fotos, ...e }) => (ESPACOS_INICIAIS.some((x) => x.id === e.id) ? e : { ...e, fotos }))));

  useEffect(() => fadeImagens(), []);

  /* trilha do jovem (home/curso) com outro papel logado: vira jovem, pra menu, cor e foto baterem */
  useEffect(() => {
    if (papel && papel !== "jovem" && ["home", "curso"].includes(route.page)) setPapel("jovem");
  }, [route.page, papel]);

  useEffect(() => {
    const onHash = () => {
      setModal(null);
      setRoute((r) => ({ ...r, ...parseHash(), secao: undefined }));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((page, extra = {}) => {
    if (page === null) {
      document.getElementById(extra.secao)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setModal(null);
    setRoute({ page, ...extra });
    const sub = extra.id || ((page === "login" || page === "analise") && extra.trilha) || "";
    const hash = "#/" + page + (sub ? "/" + encodeURIComponent(sub) : "");
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    if (extra.secao) {
      setTimeout(() => {
        const el = document.getElementById(extra.secao) || document.getElementById("sec-" + extra.secao);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

  const flash = (t) => {
    setToast(t);
    setTimeout(() => setToast(""), 2600);
  };

  const entrar = (trilha) => {
    setPapel(trilha);
    if (trilha !== "jovem") {
      go(trilha === "artista" ? "artista" : "parceiro");
      return;
    }
    if (pendente) {
      const id = pendente;
      setPendente(null);
      go("curso", { id });
      setTimeout(() => tentarInscrever(id, true), 80);
    } else {
      go("home");
    }
  };

  const sair = () => {
    setPapel(null);
    go("lp");
  };

  const enviarProposta = (p) => {
    const { espaco, ...prop } = p;
    if (espaco) {
      const DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
      const hh = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}h${String(m % 60).padStart(2, "0")}`;
      const pedido = {
        id: "p" + p.id,
        dia: DIA[espaco.dia],
        hora: hh(espaco.ini),
        titulo: p.titulo.trim(),
        quem: `${ARTISTA.nome} ${ARTISTA.sobrenome}`.toLowerCase(),
        texto: [p.materiais, p.horarios].filter(Boolean).join(" · ") || p.objetivo || "",
      };
      setEspacos((l) => l.map((e) => (e.id === espaco.espId ? { ...e, pendentes: [...e.pendentes, pedido] } : e)));
    }
    setPropostas((l) => [...l.filter((x) => x.titulo !== prop.titulo), { ...prop, espacoNome: espaco ? espaco.nome : undefined }]);
    go("analise", { trilha: "artista", proposta: true });
  };
  const excluirOficina = (id) => {
    setTurmas((l) => l.filter((t) => t.id !== id));
    go("artista");
    flash("oficina excluída. os inscritos serão avisados.");
  };
  const enviarEspaco = (e) => {
    const recursos = (e.recursos || "").split(/[,;\n]/).map((x) => x.trim().replace(/\.+$/, "")).filter(Boolean);
    const novo = {
      id: e.id,
      nome: e.nome || "novo espaço",
      recursos,
      fotos: e.fotos || [],
      ativo: false,
      analise: true,
      livres: (e.slots || []).length,
      preenchidos: 0,
      capacidade: e.capacidade || "",
      dias: "-",
      horario: "-",
      local: { nome: PARCEIRO.instituicao, endereco: e.endereco || "endereço a confirmar" },
      eventos: [],
      grade: [[], [], [], [], [], [], []],
      slots: e.slots || [],
      recorrencias: e.recorrencias || [],
      reservados: [],
      pendentes: [],
    };
    setEspacos((l) => [...l, novo]);
    setNovosEspacos((l) => [...l, { id: e.id, nome: e.nome || "novo espaço" }]);
    setRascunho(null);
    go("analise", { trilha: "espaco", proposta: true });
  };
  const excluirEspaco = (id) => {
    const nome = espacos.find((x) => x.id === id)?.nome || "espaço";
    setEspacos((l) => l.filter((x) => x.id !== id));
    setNovosEspacos((l) => l.filter((x) => x.id !== id));
    go("parceiro");
    flash(`"${nome}" foi excluído.`);
  };
  const decidir = (espId, p, escolha, coment) => {
    setEspacos((l) =>
      l.map((e) => {
        if (e.id !== espId) return e;
        const pendentes = e.pendentes.filter((x) => x.id !== p.id);
        if (escolha !== "aprovar") return { ...e, pendentes };
        return { ...e, pendentes, reservados: [...e.reservados, { dia: p.dia, hora: p.hora, titulo: p.titulo, quem: p.quem }], preenchidos: e.preenchidos + 1, livres: Math.max(0, e.livres - 1) };
      })
    );
    flash(escolha === "aprovar" ? `aprovado! ${p.quem} vai receber a confirmação.` : `reprovado.${coment ? " comentário enviado." : ""} ${p.quem} vai ser avisada.`);
  };

  const tentarInscrever = (id, jaLogado) => {
    const o = getOficina(id);
    if (!logado && !jaLogado) {
      setPendente(id);
      go("login", { trilha: "jovem", aviso: "entre ou cadastre-se para confirmar sua inscrição." });
      return;
    }
    if (o.vagas === 0) {
      setModal({ tipo: "semvagas", id });
      return;
    }
    setInscricoes((l) => (l.includes(id) ? l : [...l, id]));
    setModal({ tipo: "inscrito", id });
  };

  /* ---------- páginas ---------- */
  const { page } = route;
  const PAG_ARTISTA = ["artista", "oficina-nova", "oficina-artista", "certificado-educador"];
  const PAG_PARCEIRO = ["parceiro", "espaco-novo", "espaco-disponibilidade", "espaco"];
  let exigeLogin = null;
  if (["perfil", "minha", "certificado"].includes(page) && !logado) exigeLogin = "jovem";
  if (PAG_ARTISTA.includes(page) && papel !== "artista") exigeLogin = "artista";
  if (PAG_PARCEIRO.includes(page) && papel !== "espaco") exigeLogin = "espaco";
  const pg = exigeLogin ? "login" : page;
  let trilha = "jovem";
  if (pg === "lp") trilha = "lp";
  if (pg === "login") trilha = exigeLogin || route.trilha || (page === "login" && route.id) || "jovem";
  if (pg === "analise") trilha = route.trilha || route.id || "artista";
  if (PAG_ARTISTA.includes(pg) || pg === "artista-cadastro") trilha = "artista";
  if (PAG_PARCEIRO.includes(pg) || pg === "parceiro-cadastro") trilha = "espaco";
  const multi = pg === "lp";

  let body;
  const oficina = route.id ? getOficina(route.id) : null;
  switch (pg) {
    case "lp":
      body = <Landing go={go} />;
      break;
    case "login":
      body = <Login key={trilha} go={go} trilha={trilha} entrar={entrar} aviso={exigeLogin ? "entre para acessar sua área." : route.aviso} />;
      break;
    case "artista-cadastro":
      body = <CadastroArtista go={go} />;
      break;
    case "parceiro-cadastro":
      body = <CadastroParceiro go={go} />;
      break;
    case "analise":
      body = <EnviadoAnalise go={go} trilha={trilha} entrar={entrar} proposta={!!route.proposta} />;
      break;
    case "artista":
      body = <HomeArtista go={go} turmas={turmasView} propostas={propostas} />;
      break;
    case "oficina-nova": {
      const base = route.editar ? getOficina(route.editar) : null;
      body = (
        <CadastroOficina
          key={route.editar || "nova"}
          go={go}
          enviar={enviarProposta}
          espacos={espacos}
          inicial={base ? { titulo: base.titulo, objetivo: base.descricao, prereq: base.precisa.join(", "), encontros: String(base.cronograma.length), cronograma: base.cronograma.map((c, i) => `aula ${i + 1} - ${c[0]}`).join(", "), materiais: "mesas, cadeiras", horarios: base.frequencia } : null}
        />
      );
      break;
    }
    case "certificado-educador":
      body = oficina ? <CertificadoEducador o={oficina} t={turmas.find((x) => x.id === oficina.id && x.status === "passada")} artista={ARTISTA} go={go} /> : null;
      break;
    case "oficina-artista":
      body = oficina ? <OficinaArtista key={oficina.id} o={oficina} go={go} /> : null;
      break;
    case "parceiro":
      body = <HomeParceiro go={go} espacos={espacos} novos={novosEspacos} />;
      break;
    case "espaco-novo":
      body = <CadastroEspaco go={go} rascunho={rascunho} setRascunho={setRascunho} />;
      break;
    case "espaco-disponibilidade":
      body = <Disponibilidade go={go} rascunho={rascunho} enviar={enviarEspaco} />;
      break;
    case "espaco": {
      const e = espacos.find((x) => x.id === route.id);
      body = e ? <DetalheEspaco key={e.id} e={e} decidir={decidir} excluir={excluirEspaco} /> : <HomeParceiro go={go} espacos={espacos} novos={novosEspacos} />;
      break;
    }
    case "cadastro":
      body = <CadastroJovem go={go} />;
      break;
    case "confira":
      body = <ConfiraEmail go={go} email={route.email} entrar={entrar} />;
      break;
    case "curso":
      body = oficina ? (
        <Curso key={oficina.id} o={oficina} go={go} user={user} inscrito={inscricoes.includes(oficina.id)} inscrever={() => tentarInscrever(oficina.id)} />
      ) : (
        <HomeJovem go={go} user={user} inscricoes={inscricoes} onSugerir={() => setModal({ tipo: "sug" })} />
      );
      break;
    case "perfil":
      body = <Perfil go={go} user={user} inscricoes={inscricoes} sugestoes={sugestoes} onSugerir={() => setModal({ tipo: "sug" })} onVerTodas={() => setModal({ tipo: "sug", aba: "minhas" })} onSair={sair} />;
      break;
    case "minha":
      body = oficina ? <MinhaOficina key={oficina.id} o={oficina} go={go} user={user} /> : null;
      break;
    case "certificado":
      body = oficina ? <Certificado o={oficina} user={user} go={go} /> : null;
      break;
    default:
      body = <HomeJovem go={go} user={user} inscricoes={inscricoes} onSugerir={() => setModal({ tipo: "sug" })} />;
  }

  const modalOficina = modal?.id ? getOficina(modal.id) : null;

  return (
    <div className="cria" data-trilha={trilha}>
      <a href="#conteudo" className="skip">pular para o conteúdo</a>
      <div className={modal ? "page is-blur" : "page"}>
        <Topbar logado={!!papel} papel={papel} go={go} trilha={trilha} page={pg} onIdeias={() => setModal({ tipo: "sug" })} onSair={sair} />
        {pg !== "lp" && !pg.startsWith("certificado") && (
          <div className="wrap voltar-row" data-pg={pg}>
            <button type="button" className="voltar-seta" aria-label="voltar" onClick={() => (window.history.length > 1 ? window.history.back() : go(papel === "artista" ? "artista" : papel === "espaco" ? "parceiro" : papel ? "home" : "lp"))}>
              <svg viewBox="0 0 12 20" width="12" height="20" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
        <main id="conteudo" className={"main main-" + pg} key={pg + (route.id || "") + (route.trilha || "")}>
          {body}
        </main>
        <div className="no-print">
          <Skyline multi={multi} className={"sky-" + trilha + (["login", "cadastro", "confira", "artista-cadastro", "parceiro-cadastro", "analise", "oficina-nova", "espaco-novo", "espaco-disponibilidade"].includes(pg) ? " sky-tight" : "") + (multi ? " sky-lp" : "")} />
          <Footer go={go} onInfo={(qual) => setModal({ tipo: "info", qual })} />
        </div>
      </div>

      {modal?.tipo === "sug" && (
        <ModalSugestoes key={modal.aba || "todas"} abaInicial={modal.aba || "todas"} onClose={() => setModal(null)} sugestoes={sugestoes} setSugestoes={setSugestoes} user={user} go={go} />
      )}
      {modal?.tipo === "inscrito" && <ModalInscrito onClose={() => setModal(null)} go={go} />}
      {modal?.tipo === "info" && <ModalInfo qual={modal.qual} onClose={() => setModal(null)} />}
      {modal?.tipo === "semvagas" && modalOficina && (
        <ModalSemVagas
          o={modalOficina}
          onClose={() => setModal(null)}
          go={go}
          naLista={lista.includes(modalOficina.id)}
          entrarLista={() => setLista((l) => [...l, modalOficina.id])}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
