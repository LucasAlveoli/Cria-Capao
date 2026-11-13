import phCamera from "./assets/ph_foto.webp";
import phPicsart from "./assets/ph_picsart.webp";
import phSala from "./assets/esp_sala.webp";
import phQuadra from "./assets/esp_quadra.webp";
import phAnfi from "./assets/esp_anfiteatro.webp";
import phSalaDet from "./assets/esp_sala_detalhe.webp";
import phSala2 from "./assets/esp_sala2.webp";
import phSala3 from "./assets/esp_sala3.webp";
import phQuadra2 from "./assets/esp_quadra2.webp";

/* ───────── artista-educador (Jorge Abelin) ───────── */
export const ARTISTA = {
  nome: "Jorge",
  sobrenome: "Abelin",
  bio: "Fotógrafo há 12 anos",
};

export const AULAS_SEMANA = [
  { data: "04/11", hora: "16h00", titulo: "fotografia com o celular", local: "instituição ponto de luz" },
  { data: "06/11", hora: "15h00", titulo: "fotografia com o celular", local: "fábrica de cultura capão redondo" },
  { data: "07/11", hora: "10h00", titulo: "fotografia com o celular", local: "instituição ponto de luz" },
];

/* turmas do artista: apontam para oficinas do catálogo (data.js) */
export const TURMAS_INICIAIS = [
  { id: "fotografia-com-celular-agora", status: "ativa", data: "07/09", alunos: "10/12", foto: phCamera },
  { id: "fotografia-com-celular", status: "ativa", data: "07/09", alunos: "10/12", foto: phCamera },
  { id: "edicao-de-fotos-com-picsart", status: "breve", data: "07/11", alunos: "02/10", foto: phPicsart },
  { id: "fotografia-com-celular-julho", status: "passada", data: "15/07", periodo: "07/09/26 - 07/10/26", alunos: "15/15", foto: phCamera },
  { id: "edicao-de-fotos-com-picsart", key: "picsart-agosto", status: "passada", data: "08/10", periodo: "08/10/2026", alunos: "10/10", foto: phPicsart },
];

export const AREAS_ARTISTICAS = ["artes visuais", "música", "dança", "teatro", "digital", "beleza", "artesanato"];

/* ───────── espaço parceiro (André · Assoc. Ponto de Luz) ───────── */
export const PARCEIRO = { nome: "André", instituicao: "Assoc. Ponto de Luz" };

export const RESERVAS = [
  { nome: "gabriela oliveira", espaco: "quadra poliesportiva", data: "03/10", hora: "10h00", titulo: "dança afro-contemporânea" },
  { nome: "jorge abelin", espaco: "sala de aula", data: "03/10", hora: "10h00", titulo: "fotografia com o celular" },
  { nome: "sandra novaes", espaco: "quadra poliesportiva", data: "03/10", hora: "10h00", titulo: "fanfarra com tambores de balde" },
  { nome: "jorge abelin", espaco: "sala de aula", data: "03/10", hora: "10h00", titulo: "fotografia com o celular" },
];

export const ESPACOS_INICIAIS = [
  {
    id: "sala-de-aula",
    nome: "sala de aula",
    recursos: ["cadeiras", "mesas", "projetor", "lousa"],
    foto: phSala,
    fotos: [phSalaDet, phSala2, phSala3],
    recorrencia: "toda semana, sem data de término",
    ativo: true,
    livres: 3,
    preenchidos: 1,
    capacidade: "15 pessoas",
    dias: "segunda à sábado",
    horario: "08h-18h, sáb 08h-10h",
    local: { nome: "Assoc. Ponto de Luz", endereco: "R. Aglaê Reis, 337 - Capão Redondo" },
    eventos: [
      ["fotografia com celular", "jorge abelin"],
      ["artesanato para o natal", "jorge abelin"],
      ["fotografia com celular", "jorge abelin"],
      ["fotografia com celular", "jorge abelin"],
      ["fotografia com celular", "jorge abelin"],
      ["fotografia com celular", "jorge abelin"],
    ],
    /* grade semanal: D S T Q Q S S */
    grade: [[], ["16h00"], [], [], ["10h00", "15h00"], [], ["10h00*"]],
    reservados: [{ dia: "sáb", hora: "10h00", titulo: "fotografia com o celular", quem: "jorge abelin" }],
    pendentes: [
      {
        id: "p1",
        dia: "qui",
        hora: "15h00",
        titulo: "artesanato com cerâmica fria",
        quem: "cassia nunes",
        texto: "uma oficina para até 12 pessoas, precisamos somente de um lugar com mesas e cadeiras. preciso de 1h e tenho disponibilidade das 14h às 17h para dar as aulas, não importa o dia.",
      },
    ],
  },
  {
    id: "quadra-poliesportiva",
    nome: "quadra poliesportiva",
    recursos: ["espaço aberto", "área para movimentos"],
    foto: phQuadra,
    fotos: [phQuadra, phQuadra2],
    recorrencia: "toda semana, sem data de término",
    ativo: true,
    livres: 3,
    preenchidos: 1,
    capacidade: "40 pessoas",
    dias: "segunda à sexta",
    horario: "08h-20h",
    local: { nome: "Assoc. Ponto de Luz", endereco: "R. Aglaê Reis, 337 - Capão Redondo" },
    eventos: [
      ["dança afro-contemporânea", "keila santos"],
      ["street é vida", "keila santos"],
      ["grafite e arte urbana", "léo breaks"],
    ],
    grade: [[], ["10h00"], ["15h00"], [], ["10h00"], ["14h00*"], []],
    reservados: [{ dia: "sex", hora: "14h00", titulo: "street é vida", quem: "keila santos" }],
    pendentes: [
      {
        id: "p3",
        dia: "ter",
        hora: "15h00",
        titulo: "grafite e arte urbana",
        quem: "léo breaks",
        texto: "preciso de uma parede ou tapume pra pintar e espaço aberto. 4h, de preferência no fim de semana.",
      },
    ],
  },
  {
    id: "anfiteatro",
    nome: "anfiteatro",
    recursos: ["palco", "cadeiras", "luzes", "projetor", "caixas de som"],
    foto: phAnfi,
    fotos: [phAnfi],
    ativo: false,
    livres: 0,
    preenchidos: 0,
    capacidade: "80 pessoas",
    dias: "-",
    horario: "-",
    local: { nome: "Assoc. Ponto de Luz", endereco: "R. Aglaê Reis, 337 - Capão Redondo" },
    eventos: [],
    grade: [[], [], [], [], [], [], []],
    reservados: [],
    pendentes: [],
  },
];

export const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
export const HORAS = ["07 AM", "08 AM", "09 AM", "10 AM", "11 AM", "12 PM", "13 PM", "14 PM", "15 PM"];
