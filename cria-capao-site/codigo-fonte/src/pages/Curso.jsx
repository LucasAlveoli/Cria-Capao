import { Btn, Modal, OficinaCard, Shape, Tag } from "../ui.jsx";
import { AREAS, OFICINAS } from "../data.js";
import mapaCurso from "../assets/map_curso.webp";
import mapaMinha from "../assets/map.webp";
import mentorFoto from "../assets/ph_detalhe.webp";
import { fotoDe } from "../pessoas.js";
import inscritoImg from "../assets/inscrito_foto.webp";

export function Cronograma({ o, cor, atual = -1, longo = false }) {
  const n = o.cronograma.length;
  return (
    <Shape as="section" className={"crono" + (atual >= 0 ? " has-prog" : "")} style={{ "--c": cor, "--prog": atual >= 0 ? (atual + 0.5) / n : 0 }} fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={[0, 12, 17, 0]} r={10} band={58} bandFill={cor}>
      <h2 className="crono-head">cronograma de aulas</h2>
      <ol className="crono-list">
        {o.cronograma.map(([t, d], i) => (
          <li key={i} className={i < atual ? "is-feita" : i === atual ? "is-atual" : ""}>
            <span className="crono-n">{i + 1}</span>
            <b>{t}</b>
            <small>{longo && d.length === 5 ? `${d}/2026` : d}</small>
          </li>
        ))}
      </ol>
    </Shape>
  );
}

export function Mentor({ o }) {
  return (
    <div className="mentor">
      <img src={fotoDe(o.mentor) || mentorFoto} alt={`Foto de ${o.mentor}`} />
      <div>
        <small>Mentor</small>
        <b>{o.mentor}</b>
        <small>{o.mentorBio}</small>
      </div>
    </div>
  );
}

export function InfoGrid({ o, user, go, pre = "o que você precisa - pré requisitos" }) {
  return (
    <dl className="infos">
      <div><dt>início</dt><dd>{o.inicio}</dd></div>
      <div><dt>duração</dt><dd>{o.duracao}</dd></div>
      <div><dt>frequência</dt><dd>{o.frequencia}</dd></div>
      <div><dt>vagas</dt><dd>{o.vagas > 0 ? `${o.vagas} restantes` : "turma cheia"}</dd></div>
      <div>
        <dt>local</dt>
        <dd>
          {user ? (
            <>
              <b>{o.local.nome}</b> | {o.local.endereco}
            </>
          ) : (
            <>
              <b>{o.local.nome}</b> | <button type="button" className="link" onClick={() => go("login", { trilha: "jovem", aviso: "entre para ver o endereço completo." })}>entre para ver o endereço</button>
            </>
          )}
        </dd>
      </div>
      <div>
        <dt>{pre}</dt>
        <dd>
          <ul className="bullets">
            {o.precisa.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </dd>
      </div>
    </dl>
  );
}

export function Mapa({ o, grande }) {
  return (
    <figure className="mapa">
      <img src={grande ? mapaMinha : mapaCurso} alt={`Mapa: ${o.local.endereco}`} />
    </figure>
  );
}

export default function Curso({ o, go, user, inscrito, inscrever }) {
  const area = AREAS[o.area];
  const encerrada = o.status !== "proxima";
  const fotoG = o.fotoGrande || o.foto;
  return (
    <div className="wrap curso" style={{ "--c": area.cor }}>
      <div className="curso-top">
        <img className="curso-foto reveal" src={fotoG} alt="" />
        <div className="curso-head reveal">
          <h1 className="curso-title">{o.tituloLongo || o.titulo}</h1>
          <div className="curso-tags">
            <Tag className="ctag is-fill" forma="b" k={2.9} fill="var(--c)">{o.aulas}</Tag>
            <Tag className="ctag" forma="a" k={2.9} fill="var(--color-background)" stroke="var(--c)" sw={1.4}>{o.area}</Tag>
            {!encerrada && o.vagas > 0 && <Tag className="ctag is-vagas" forma="b" k={2.9} fill="var(--color-sol)">restam {o.vagas} vagas</Tag>}
          </div>
          <p className="curso-desc">{o.descricao}</p>
          <Mentor o={o} />
          {encerrada ? (
            <Shape className="btn btn-xl btn-off" style={{ "--fg": "#fff" }} fill="var(--color-cinza)" ins={[0, 7, 7, 0]} r={7}>
              inscrições encerradas
            </Shape>
          ) : inscrito ? (
            <Btn size="xl" cor="var(--color-espaco)" onClick={() => go("minha", { id: o.id })}>inscrito!</Btn>
          ) : (
            <Btn size="xl" cor="var(--color-vaga)" onClick={inscrever}>inscrever-se</Btn>
          )}
        </div>
      </div>
      <div className="curso-bottom">
        <InfoGrid o={o} user={user} go={go} />
        <div className="curso-side">
          <Cronograma o={o} cor={area.cor} longo />
          <Mapa o={o} />
        </div>
      </div>
    </div>
  );
}

export function ModalInscrito({ onClose, go }) {
  return (
    <Modal onClose={onClose} className="m-inscrito" label="inscrição confirmada" ins={[0, 14, 14, 0]} r={10}>
      <h2 className="m-ins-titulo">inscrito!</h2>
      <img className="m-ins-foto" src={inscritoImg} alt="Dois jovens de mãos dadas erguidas sobre casinhas coloridas" />
      <Shape as="button" type="button" className="m-ins-perfil" fill="var(--color-vaga)" ins={[0, 4.8, 4.8, 0]} r={5} onClick={() => { onClose(); go("perfil"); }}>
        acesse mais informações<br />em <b><i>“meu perfil”</i></b>
      </Shape>
      <Shape as="button" type="button" className="m-ins-voltar" fill="var(--color-background)" stroke="var(--color-terra)" sw={1.5} ins={[2.3, 0, 0, 2.3]} r={3} onClick={onClose}>
        voltar
      </Shape>
    </Modal>
  );
}

export function ModalSemVagas({ o, onClose, go, naLista, entrarLista }) {
  const outras = OFICINAS.filter((x) => x.status === "proxima" && x.vagas > 0 && x.id !== o.id).slice(0, 2);
  return (
    <Modal onClose={onClose} className="m-semvagas" label="turma cheia">
      <h2 className="m-big m-big-amarelo">turma cheia!</h2>
      <p className="m-txt">
        As vagas de <b>{o.titulo}</b> acabaram. Entre na <b>lista de interesse</b>: se alguém desistir ou abrir turma nova, você é avisado primeiro.
      </p>
      {naLista ? (
        <p className="m-ok">✓ você está na lista de interesse</p>
      ) : (
        <Btn cor="var(--color-sol)" texto="var(--color-terra)" onClick={entrarLista}>entrar na lista de interesse</Btn>
      )}
      <p className="m-label">outras oficinas com vaga</p>
      <div className="m-outras">
        {outras.map((x, i) => (
          <OficinaCard key={x.id} o={x} i={i} onOpen={() => { onClose(); go("curso", { id: x.id }); }} />
        ))}
      </div>
    </Modal>
  );
}
