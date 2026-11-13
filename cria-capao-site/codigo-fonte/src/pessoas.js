/* fotos de perfil (todas geradas por IA) */
import natalia from "./assets/pf_natalia.webp";
import jorge from "./assets/pf_jorge.webp";
import andre from "./assets/pf_andre.webp";
import keila from "./assets/pf_keila.webp";
import marta from "./assets/pf_marta.webp";
import leo from "./assets/pf_leo.webp";
import tania from "./assets/pf_tania.webp";
import carlos from "./assets/pf_carlos.webp";

export const FOTO_PESSOA = {
  "natália miranda": natalia,
  "jorge abelin": jorge,
  "andré": andre,
  "keila santos": keila,
  "marta oliveira": marta,
  "léo breaks": leo,
  "tânia mendes": tania,
  "carlos almeida": carlos,
};
export const fotoDe = (nome) => FOTO_PESSOA[(nome || "").toLowerCase().trim()] || null;
export const FOTO_PAPEL = { jovem: natalia, artista: jorge, espaco: andre };
