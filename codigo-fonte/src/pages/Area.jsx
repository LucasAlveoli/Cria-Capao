import { CardFoto, DateChip, Ico, Shape, SideBox, Tag } from "../ui.jsx";
import heroArtista from "../assets/hero_artista.webp";
import heroParceiro from "../assets/hero_parceiro.webp";

/* hero colorido das áreas logadas (artista laranja · parceiro azul) */
export function AreaHero({ trilha, ola, titulo, sub, stats }) {
  return (
    <div className={"area-hero reveal is-" + trilha}>
      <div className="area-hero-txt">
        <p className="home-ola">{ola}</p>
        <h1>{titulo}</h1>
        <p className="area-hero-sub">{sub}</p>
      </div>
      <img src={trilha === "artista" ? heroArtista : heroParceiro} alt="" className="area-hero-img" />
      <dl className="area-stats">
        {stats.map(([n, l]) => (
          <div key={l}>
            <dd>{n}</dd>
            <dt>{l}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Analise({ texto = "cadastro de oficina em análise", onClick }) {
  const extra = onClick ? { as: "button", type: "button", onClick, "aria-label": `${texto}: ver cadastro` } : {};
  return (
    <Shape className={"analise" + (onClick ? " is-link" : "")} fill="oklch(0.95 0.06 92)" stroke="var(--color-sol)" sw={2} ins={[0, 2, 0, 2]} r={4} {...extra}>
      <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" className="analise-ico">
        <circle cx="12" cy="13" r="10" fill="currentColor" />
        <path d="M5 3.2 2.6 5.6M19 3.2l2.4 2.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 7.5V13l3.4 2.2" fill="none" stroke="var(--color-background)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <p>
        <b>{texto}</b>
        <span>retorno em até 5 dias úteis.{onClick && <u> ver cadastro</u>}</span>
      </p>
    </Shape>
  );
}

export function NovaIdeia({ pergunta, destaque, botao, cor, onClick, classe = "" }) {
  return (
    <div className={"nova-ideia " + classe}>
      <p>
        {pergunta}
        {destaque && (
          <>
            <br />
            <b style={{ color: cor }}>{destaque}</b>
          </>
        )}
      </p>
      <Shape as="button" type="button" className="btn btn-md btn-nova" style={{ "--fg": "#fff" }} fill={cor} ins={[0, 5, 5, 0]} r={5} onClick={onClick}>
        {botao}
      </Shape>
    </div>
  );
}

export function AulasSemana({ aulas, cor, titulo = "suas aulas da semana", onOpen }) {
  return (
    <SideBox titulo={titulo} cor={cor} className="proximas">
      <ul className="aulas">
        {aulas.map((a, i) => (
          <li key={i}>
            <button type="button" onClick={onOpen}>
              <DateChip data={a.data} hora={a.hora} cor={cor} />
              <span>
                <b>{a.titulo}</b>
                <small>{a.local}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </SideBox>
  );
}

export function Reservas({ reservas }) {
  return (
    <SideBox titulo={<><span className="so-desk">próximas reservas nesse espaço</span><span className="so-mob">próximos eventos nos seus espaços</span></>} cor="var(--color-espaco)" className="proximas reservas-box">
      <ul className="reservas so-desk-b">
        {reservas.map((r, i) => (
          <li key={i}>
            <b>{r.nome}</b>
            <span>| {r.espaco}</span>
            <small>{r.data} | {r.hora}</small>
          </li>
        ))}
      </ul>
      <ul className="reservas-mob so-mob">
        {reservas.map((r, i) => (
          <li key={i}>
            <small><b>{r.data}</b> | {r.hora}</small>
            <span>{r.titulo}</span>
          </li>
        ))}
      </ul>
    </SideBox>
  );
}

/* boxes de informação com contorno torto (detalhe da oficina / espaço) */
export function InfoBox({ label, children, wide, tall, className = "" }) {
  return (
    <div className={"ibox" + (wide ? " is-wide" : "") + " " + className}>
      <p className="ibox-label">{label}</p>
      <Shape className={"ibox-box" + (tall ? " is-tall" : "")} fill="var(--color-background)" stroke="var(--color-terra)" sw={2} ins={wide ? [0, 4, 3, 0] : [3, 0, 0, 3]} r={7}>
        {children}
      </Shape>
    </div>
  );
}

export { Ico };

/* card de turma (área do artista) */
export function TurmaCard({ o, t, i = 0, onOpen, onCert, cor, area }) {
  const passada = t.status === "passada";
  const inv = i % 2 === 1;
  if (passada) {
    return (
      <Shape as="article" className="card card-mini is-final" style={{ "--c": cor, "--d": `${i * 50}ms` }} fill="var(--color-background)" stroke={cor} sw={1.4} ins={[0, 0, 0, 0]} r={10}>
        <button type="button" className="card-hit" onClick={onOpen} aria-label={`ver ${o.titulo}`} />
        <button type="button" className="card-cert" onClick={onCert}>baixar certificado</button>
        <div className="card-body">
          <Tag className="card-area" k={1.8} fill="var(--color-background)" stroke="var(--c)">{area}</Tag>
          <p className="card-tipo">{o.tipo}</p>
          <h3 className="card-title">{o.titulo}</h3>
          <ul className="card-meta card-meta-2 card-meta-fin">
            <li><Ico.cal />{t.periodo || t.data}</li>
            <li><Ico.user />{t.alunos}</li>
          </ul>
        </div>
      </Shape>
    );
  }
  return (
    <Shape as="article" className={"card card-mini" + (inv ? " inv" : "")} style={{ "--c": cor, "--d": `${i * 50}ms` }} fill="var(--color-background)" stroke={cor} sw={1.4} ins={inv ? [0, 14, 0, 0] : [16, 0, 0, 0]} r={10}>
      <button type="button" className="card-hit" onClick={onOpen} aria-label={`ver ${o.titulo}`} />
      <CardFoto inv={inv}>
        <img src={t.foto} alt="" loading="lazy" style={{ objectPosition: o.pos }} />
      </CardFoto>
      <div className="card-body">
        <Tag className="card-area" k={1.8} fill="var(--color-background)" stroke="var(--c)">{area}</Tag>
        <p className="card-tipo">{o.tipo}</p>
        <h3 className="card-title">{o.titulo}</h3>
        <ul className="card-meta card-meta-2">
          <li><Ico.cal />{t.data}</li>
          <li><Ico.user />{t.alunos}</li>
        </ul>
      </div>
    </Shape>
  );
}

export function EspacoCard({ e, i = 0, onOpen }) {
  const c = e.ativo ? "var(--color-espaco)" : "var(--color-cinza)";
  const inv = i % 2 === 1;
  const pend = e.pendentes.length;
  return (
    <Shape as="article" className={"card card-esp" + (e.ativo ? "" : " is-passada") + (inv ? " inv" : "")} style={{ "--c": c, "--d": `${i * 50}ms` }} fill="var(--color-background)" stroke={c} sw={1.4} ins={inv ? [0, 14, 0, 0] : [16, 0, 0, 0]} r={10}>
      <button type="button" className="card-hit" onClick={onOpen} aria-label={`ver ${e.nome}`} />
      <CardFoto inv={inv}>
        <img src={e.foto} alt="" loading="lazy" />
      </CardFoto>
      <div className="card-body">
        <Tag className={"card-area " + (e.ativo ? "is-ok" : "is-off")} k={1.8} fill="var(--color-background)" stroke="var(--c)">{e.ativo ? "disponível" : "desativado"}</Tag>
        <p className="card-tipo">{e.recursos.join(" - ")}</p>
        <h3 className="card-title">{e.nome}</h3>
        {e.ativo && (
          <ul className="card-meta card-meta-esp">
            <li><Ico.clock />{e.livres} horários livres | {e.preenchidos} preenchido</li>
            <li className="is-pend">
              <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m4.5 8.3 2.4 2.4 4.6-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              {pend} {pend === 1 ? "aprovação pendente" : "aprovações pendentes"}
            </li>
          </ul>
        )}
      </div>
    </Shape>
  );
}
