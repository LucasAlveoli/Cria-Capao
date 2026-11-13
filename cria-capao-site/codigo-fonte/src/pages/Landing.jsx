import { Btn } from "../ui.jsx";
import lpHero from "../assets/lp_hero.webp";
import p1 from "../assets/lp_p1.webp";
import p2 from "../assets/lp_p2.webp";
import p3 from "../assets/lp_p3.webp";
import s1 from "../assets/lp_s1.webp";
import s2 from "../assets/lp_s2.webp";
import s3 from "../assets/lp_s3.webp";
import comoTitle from "../assets/lp_como_title.webp";
import t1 from "../assets/tag1.webp";
import t2 from "../assets/tag2.webp";
import t3 from "../assets/tag3.webp";
import t4 from "../assets/tag4.webp";
import t5 from "../assets/tag5.webp";
import c1 from "../assets/c1.webp";
import c2 from "../assets/c2.webp";
import c3 from "../assets/c3.webp";

function Pontas({ go, forma }) {
  return (
    <>
      <Btn className="btn-ponta" forma={forma[0]} cor="var(--color-jovem)" onClick={() => go("home")}>
        <strong>sou jovem</strong>
        <small>quero aprender e participar</small>
      </Btn>
      <Btn className="btn-ponta" forma={forma[1]} cor="var(--color-sol)" texto="var(--color-terra)" onClick={() => go("login", { trilha: "artista" })}>
        <strong>sou artista</strong>
        <small>quero ensinar e multiplicar</small>
      </Btn>
      <Btn className="btn-ponta" forma={forma[2]} cor="var(--color-espaco)" onClick={() => go("login", { trilha: "espaco" })}>
        <strong>sou um parceiro</strong>
        <small>quero colaborar com o cria</small>
      </Btn>
    </>
  );
}

const PASSOS = [
  [t1, "cadastro", "Artistas e espaços apresentam seus perfis."],
  [t2, "matching", "O CRIA cruza oficina, estrutura, disponibilidade e localização."],
  [t3, "conexão", "Artista e espaço confirmam a realização."],
  [t4, "oficina", "O jovem encontra, se inscreve e participa presencialmente."],
  [t5, "rede", "Novas experiências e conexões continuam acontecendo."],
];

export default function Landing({ go }) {
  const ir = {
    jovem: () => go("home"),
    artista: () => go("login", { trilha: "artista" }),
    espaco: () => go("login", { trilha: "espaco" }),
  };
  return (
    <div className="lp">
      {/* hero */}
      <section className="wrap lp-hero">
        <div className="lp-hero-card reveal">
          <div className="lp-hero-txt">
            <h1>Cultura acontece quando a gente se <em className="lp-em t-jovem">encontra.</em></h1>
            <p>O CRIA conecta jovens, artistas e espaços para fazer oficinas e experiências culturais presenciais acontecerem.</p>
          </div>
          <img className="lp-hero-img" src={lpHero} alt="Dois jovens de mãos dadas erguidas, sobre casinhas laranjas" />
        </div>
        <div className="lp-hero-btns">
          <Pontas go={go} forma={["a", "b", "a"]} />
        </div>
      </section>

      {/* três pontas */}
      <section className="wrap lp-pontas" id="sobre">
        <div className="lp-pontas-txt reveal">
          <h2>
            Três pontas.
            <br />
            <span className="t-artista lp-em">Uma rede.</span>
          </h2>
          <p>O CRIA aproxima quem quer aprender, quem quer compartilhar conhecimento e quem tem um espaço para fazer acontecer.</p>
        </div>
        <div className="lp-pontas-cards">
          {[
            [p1, "Jovens Periféricos", "Encontre oficinas presenciais de arte e cultura próximas de você.", "t-jovem", "Menino sorrindo erguendo uma lata de spray"],
            [p2, <><span className="so-desk">Artista Professor</span><span className="so-mob">Artista Educador</span></>, "Transforme seus conhecimentos e ideias em oficinas para jovens.", "t-artista", "Artista-educadora de cachecol"],
            [p3, "Espaços Parceiros", "Disponibilize salas, equipamentos e estruturas para receber novas experiências.", "t-espaco", "Prédio histórico"],
          ].map(([src, t, d, cls, alt], i) => (
            <article key={cls} className="lp-ponta lp-clica reveal" style={{ "--d": `${i * 90}ms` }}>
              <button type="button" className="lp-hit" onClick={ir[["jovem", "artista", "espaco"][i]]} aria-label={["ver oficinas", "quero ser artista-educador", "quero ser um espaço parceiro"][i]} />
              <img src={src} alt={alt} />
              <h3 className={cls}>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* jovem */}
      <section className="wrap lp-sec">
        <button type="button" className="lp-sec-img lp-img-btn reveal" onClick={ir.jovem} aria-label="encontrar uma oficina"><img src={s1} alt="Dois jovens de mãos dadas sobre casinhas vermelhas" /></button>
        <div className="lp-sec-txt reveal">
          <h2>
            Tem alguma coisa que você sempre quis <em className="t-jovem">experimentar?</em>
          </h2>
          <p>Encontre oficinas de música, teatro, dança, artes visuais e outras linguagens culturais.</p>
          <p>Você escolhe pelo que gosta, pelo dia que tem disponível e pelo lugar onde quer participar.</p>
          <Btn size="sm" cor="var(--color-jovem)" onClick={() => go("home")}>encontrar uma oficina</Btn>
        </div>
      </section>

      {/* artista */}
      <section className="wrap lp-sec is-rev">
        <div className="lp-sec-txt reveal">
          <h2>
            Você sabe fazer. o CRIA ajuda a fazer <em className="t-artista">acontecer.</em>
          </h2>
          <p>Você tem uma habilidade, uma ideia de oficina ou experiência para compartilhar?</p>
          <p>Cadastre seu perfil, conte o que gostaria de ensinar e indique quando pode atuar. O CRIA ajuda a encontrar espaços e oportunidades compatíveis.</p>
          <Btn size="sm" forma="b" cor="var(--color-artista)" onClick={() => go("login", { trilha: "artista" })}>quero ser artista-educador</Btn>
        </div>
        <button type="button" className="lp-sec-img lp-img-btn reveal" onClick={ir.artista} aria-label="quero ser artista-educador"><img src={s2} alt="Bailarina de braços abertos sobre casinhas laranjas" /></button>
      </section>

      {/* espaço */}
      <section className="wrap lp-sec is-espaco">
        <button type="button" className="lp-sec-img lp-img-btn reveal" onClick={ir.espaco} aria-label="quero ser um espaço parceiro"><img src={s3} alt="Prédio histórico sobre casinhas azuis" /></button>
        <div className="lp-sec-txt reveal">
          <h2>
            Tem espaço para uma experiência <em className="t-espaco">acontecer?</em>
          </h2>
          <p>Escolas, associações, centros culturais, instituições e outros espaços podem fazer parte da rede.</p>
          <p>Informe sua estrutura e disponibilidade. O CRIA conecta o espaço a oficinas que façam sentido para suas condições.</p>
          <Btn size="sm" cor="var(--color-espaco)" onClick={() => go("login", { trilha: "espaco" })}>quero ser um espaço parceiro</Btn>
        </div>
      </section>

      {/* como funciona */}
      <section className="lp-como" id="como">
        <div className="wrap">
          <h2 className="lp-como-title">
            <img className="so-desk-b" src={comoTitle} alt="Como o cria faz acontecer?" />
            <span className="lp-como-mob">Como o cria faz<br />acontecer?</span>
          </h2>
          <ol className="lp-passos">
            {PASSOS.map(([src, nome, d], i) => (
              <li key={nome} className="reveal" style={{ "--d": `${i * 110}ms` }}>
                <img src={src} alt={nome} />
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* qual é a sua ponta */}
      <section className="wrap lp-final">
        <p className="lp-final-kicker">o próximo encontro pode começar aqui.</p>
        <h2>
          Qual é a sua ponta nessa <em className="t-artista lp-em">rede</em><span className="lp-q">?</span>
        </h2>
        <div className="lp-final-grid">
          {[
            [c1, "Menino com lata de spray"],
            [c2, "Bailarina de braços abertos"],
            [c3, "Prédio histórico"],
          ].map(([src, alt], i) => (
            <button key={alt} type="button" className="lp-final-foto lp-img-btn reveal" onClick={ir[["jovem", "artista", "espaco"][i]]} aria-label={["sou jovem", "sou artista", "sou um parceiro"][i]}>
              <img src={src} alt={alt} />
            </button>
          ))}
          <Pontas go={go} forma={["b", "a", "b"]} />
        </div>
      </section>
    </div>
  );
}
