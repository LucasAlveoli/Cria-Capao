/* carregamento das imagens: as da primeira dobra saem na frente, o resto baixa em segundo plano */
import lpHero from "./assets/lp_hero.webp";
import p1 from "./assets/lp_p1.webp";
import p2 from "./assets/lp_p2.webp";
import p3 from "./assets/lp_p3.webp";
import homeHero from "./assets/home_hero.webp";
import a0 from "./assets/bailarina_big.webp";
import a1 from "./assets/c1.webp";
import a2 from "./assets/c2.webp";
import a3 from "./assets/c3.webp";
import a4 from "./assets/encontro_houses.webp";
import a5 from "./assets/esp_anfiteatro.webp";
import a6 from "./assets/esp_quadra.webp";
import a7 from "./assets/esp_quadra2.webp";
import a8 from "./assets/esp_sala.webp";
import a9 from "./assets/esp_sala2.webp";
import a10 from "./assets/esp_sala3.webp";
import a11 from "./assets/esp_sala_detalhe.webp";
import a12 from "./assets/hero_artista.webp";
import a13 from "./assets/hero_parceiro.webp";
import a14 from "./assets/home_hero.webp";
import a15 from "./assets/inscrito_foto.webp";
import a16 from "./assets/kids_cut.webp";
import a17 from "./assets/login_boy.webp";
import a18 from "./assets/lp_como_title.webp";
import a19 from "./assets/lp_hero.webp";
import a20 from "./assets/lp_p1.webp";
import a21 from "./assets/lp_p2.webp";
import a22 from "./assets/lp_p3.webp";
import a23 from "./assets/lp_s1.webp";
import a24 from "./assets/lp_s2.webp";
import a25 from "./assets/lp_s3.webp";
import a26 from "./assets/map.webp";
import a27 from "./assets/map_curso.webp";
import a28 from "./assets/pf_andre.webp";
import a29 from "./assets/pf_carlos.webp";
import a30 from "./assets/pf_jorge.webp";
import a31 from "./assets/pf_keila.webp";
import a32 from "./assets/pf_leo.webp";
import a33 from "./assets/pf_marta.webp";
import a34 from "./assets/pf_natalia.webp";
import a35 from "./assets/pf_tania.webp";
import a36 from "./assets/ph_danca.webp";
import a37 from "./assets/ph_detalhe.webp";
import a38 from "./assets/ph_fanfarra.webp";
import a39 from "./assets/ph_foto.webp";
import a40 from "./assets/ph_grafite.webp";
import a41 from "./assets/ph_musica.webp";
import a42 from "./assets/ph_picsart.webp";
import a43 from "./assets/ph_tranca.webp";
import a44 from "./assets/predio_big.webp";
import a45 from "./assets/tag1.webp";
import a46 from "./assets/tag2.webp";
import a47 from "./assets/tag3.webp";
import a48 from "./assets/tag4.webp";
import a49 from "./assets/tag5.webp";

const TODAS = [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27, a28, a29, a30, a31, a32, a33, a34, a35, a36, a37, a38, a39, a40, a41, a42, a43, a44, a45, a46, a47, a48, a49];
const PRIMEIRAS = [lpHero, homeHero, p1, p2, p3];

const vistas = new Set();
const baixar = (u, alta) => {
  if (!u || vistas.has(u)) return;
  vistas.add(u);
  const i = new Image();
  i.decoding = "async";
  if (alta) i.fetchPriority = "high";
  i.src = u;
};

export function preCarregar() {
  PRIMEIRAS.forEach((u) => baixar(u, true));
  const resto = TODAS.filter((u) => !vistas.has(u));
  const ocioso = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  let k = 0;
  const lote = () => {
    resto.slice(k, k + 4).forEach((u) => baixar(u));
    k += 4;
    if (k < resto.length) ocioso(lote, { timeout: 900 });
  };
  ocioso(lote, { timeout: 600 });
}

/* aparição suave: a foto entra com fade quando termina de baixar; as que já estão em cache aparecem direto */
export function fadeImagens() {
  const ok = (img) => img.classList.add("img-ok");
  const varrer = () => {
    document.querySelectorAll(".cria img:not(.img-ok), .mnav img:not(.img-ok)").forEach((img) => {
      if (img.complete && img.naturalWidth) {
        img.classList.add("img-ja");
        ok(img);
      }
    });
  };
  const onLoad = (ev) => {
    const t = ev.target;
    if (t && t.tagName === "IMG") ok(t);
  };
  document.addEventListener("load", onLoad, true);
  document.addEventListener("error", onLoad, true);
  varrer();
  const mo = new MutationObserver(varrer);
  mo.observe(document.body, { childList: true, subtree: true });
  return () => {
    document.removeEventListener("load", onLoad, true);
    document.removeEventListener("error", onLoad, true);
    mo.disconnect();
  };
}
