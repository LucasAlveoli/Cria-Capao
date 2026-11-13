/* ───────── combina o que o artista precisa com os espaços parceiros ─────────
   lê o texto livre ("sala para 15 pessoas com projetor e mesas", "sábados à tarde")
   e compara com capacidade, recursos e horários livres de cada espaço. */
import { fromYmd, juntar, ymd } from "./pages/Agenda.jsx";

const sem = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* recursos conhecidos: nome bonito + jeitos de escrever */
export const RECURSOS = [
  ["mesas", ["mesa"]],
  ["cadeiras", ["cadeira", "assento", "banco"]],
  ["projetor", ["projetor", "datashow", "data show", "telao"]],
  ["lousa", ["lousa", "quadro branco", "quadro negro", "quadro"]],
  ["computadores", ["computador", "notebook", "pc"]],
  ["internet", ["internet", "wifi", "wi-fi"]],
  ["caixas de som", ["caixa de som", "caixas de som", "som", "microfone"]],
  ["palco", ["palco"]],
  ["luzes", ["luz", "luzes", "iluminacao", "refletor"]],
  ["espaço aberto", ["espaco aberto", "area aberta", "area livre", "ao ar livre", "quadra", "area para movimento", "espaco amplo", "espaco livre"]],
  ["espelho", ["espelho"]],
  ["pia", ["pia", "agua", "torneira"]],
  ["tomadas", ["tomada"]],
  ["parede para pintura", ["parede", "muro", "tapume"]],
];
const recursoDe = (txt) => {
  const t = sem(txt);
  const r = RECURSOS.find(([, ws]) => ws.some((w) => new RegExp(`(^|[^a-z])${w}`).test(t)));
  return r ? r[0] : null;
};

/* o que o artista pediu */
export function lerPedido(f) {
  const txt = sem(`${f.materiais || ""}`);
  const precisa = RECURSOS.filter(([, ws]) => ws.some((w) => new RegExp(`(^|[^a-z])${w}`).test(txt))).map(([n]) => n);
  const pessoas = Number((`${f.materiais || ""} ${f.prereq || ""}`.match(/(\d{1,3})\s*(pessoas|alunos|jovens|participantes|vagas|lugares)/i) || [])[1]) || null;

  const h = sem(f.horarios || "");
  let dias = [];
  [[0, "dom"], [1, "seg"], [2, "ter"], [3, "qua"], [4, "qui"], [5, "sex"], [6, "sab"]].forEach(([d, w]) => h.includes(w) && dias.push(d));
  if (/fim de semana|fins de semana|finais de semana/.test(h)) dias.push(0, 6);
  if (/dias uteis|durante a semana|dia de semana|dias de semana/.test(h)) dias.push(1, 2, 3, 4, 5);
  if (/qualquer dia|todos os dias|nao importa/.test(h)) dias = [];
  dias = [...new Set(dias)];

  let periodo = null;
  const faixa = h.match(/(\d{1,2})\s*h?\s*(\d{2})?\s*(?:as|a|-|ate)\s*(\d{1,2})\s*h?/);
  if (faixa) periodo = [Number(faixa[1]) * 60 + Number(faixa[2] || 0), Number(faixa[3]) * 60];
  else if (h.includes("manha")) periodo = [7 * 60, 12 * 60];
  else if (h.includes("tarde")) periodo = [12 * 60, 18 * 60];
  else if (h.includes("noite")) periodo = [18 * 60, 22 * 60];

  return { precisa, pessoas, dias, periodo, vazio: !precisa.length && !pessoas && !dias.length && !periodo };
}

const WD = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, "sáb": 6 };
const minDe = (h) => {
  const [a, b] = h.replace("*", "").split("h");
  return Number(a) * 60 + Number(b || 0);
};

/* horários livres numa semana-tipo (tira o que já está reservado ou pedido) */
export function semanaLivre(e) {
  const hoje = ymd(new Date());
  const slots = e.slots || juntar(e.grade.flatMap((l, i) => l.filter((x) => !x.endsWith("*")).map((x) => ({ id: `${e.id}-${i}-${x}`, dia: String(i), ini: minDe(x), fim: minDe(x) + 120 }))));
  const out = Array.from({ length: 7 }, () => []);
  slots
    .filter((s) => s.dia.length === 1 || s.dia >= hoje)
    .forEach((s) => {
      const d = s.dia.length === 1 ? Number(s.dia) : fromYmd(s.dia).getDay();
      if (!out[d].some((f) => f.ini === s.ini && f.fim === s.fim)) out[d].push({ ini: s.ini, fim: s.fim });
    });
  [...e.reservados, ...e.pendentes].forEach((r) => {
    const d = WD[r.dia];
    if (d === undefined) return;
    const ini = minDe(r.hora);
    out[d] = out[d].filter((f) => f.ini !== ini);
  });
  out.forEach((l) => l.sort((a, b) => a.ini - b.ini));
  return out;
}

const capDe = (c) => Number((`${c || ""}`.match(/\d+/) || [])[0]) || null;

/* nota de 0 a 1 + o que tem, o que falta e os horários que servem */
export function avaliar(e, p) {
  const tem = e.recursos.map((r) => recursoDe(r) || r);
  const ok = p.precisa.filter((r) => tem.includes(r));
  const falta = p.precisa.filter((r) => !tem.includes(r));
  const cap = capDe(e.capacidade);
  const cabe = !p.pessoas || !cap ? null : cap >= p.pessoas;
  const livre = semanaLivre(e);
  const horarios = [];
  livre.forEach((l, d) => {
    if (p.dias.length && !p.dias.includes(d)) return;
    l.forEach((f) => {
      if (p.periodo && (f.fim <= p.periodo[0] || f.ini >= p.periodo[1])) return;
      horarios.push({ dia: d, ini: f.ini, fim: f.fim });
    });
  });
  const temHorario = livre.some((l) => l.length);
  const todos = livre.flatMap((l, d) => l.map((f) => ({ dia: d, ini: f.ini, fim: f.fim })));
  let pontos = 0;
  let total = 0;
  if (p.precisa.length) {
    total += 2;
    pontos += (2 * ok.length) / p.precisa.length;
  }
  if (cabe !== null) {
    total += 1;
    pontos += cabe ? 1 : 0;
  }
  if (p.dias.length || p.periodo) {
    total += 1;
    pontos += horarios.length ? 1 : 0;
  }
  const nota = total ? pontos / total : temHorario ? 1 : 0;
  return { e, ok, falta, cap, cabe, horarios, todos, nota, temHorario };
}

export function espacosPara(espacos, f) {
  const p = lerPedido(f);
  const lista = espacos
    .filter((e) => e.ativo && !e.analise)
    .map((e) => avaliar(e, p))
    .filter((r) => r.temHorario)
    .sort((a, b) => b.nota - a.nota || b.horarios.length - a.horarios.length);
  return { pedido: p, lista };
}
