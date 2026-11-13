import { useState } from "react";
import { Btn, Field, Ico, Logo, Tag } from "../ui.jsx";
import { BAIRROS } from "../data.js";
import boy from "../assets/login_boy.webp";
import bailarina from "../assets/bailarina_big.webp";
import predio from "../assets/predio_big.webp";
import kids from "../assets/kids_cut.webp";

const COR = { jovem: "var(--color-jovem)", artista: "var(--color-artista)", espaco: "var(--color-espaco)" };
const SRC = {
  jovem: [boy, "Menino sorrindo com uma lata de spray erguida"],
  artista: [bailarina, "Bailarina de braços abertos"],
  espaco: [predio, "Prédio histórico com bandeira no topo"],
};
/* posição da foto em coordenadas do Figma (página de 1440px, y a partir da topbar) */
export const FOTOS = {
  jovem: { x: 60, y: 70, w: 660 },
  artista: { x: -50, y: 89, w: 785 },
  "artista-cad": { x: -8, y: 90, w: 701 },
  "artista-env": { x: 115, y: 91, w: 530 },
  "artista-form": { x: -62, y: 42, w: 604 },
  espaco: { x: 179, y: 68, w: 436 },
  "espaco-cad": { x: 117, y: 67, w: 560 },
  "espaco-env": { x: 858, y: 69, w: 377 },
  "espaco-form": { x: 719, y: 66, w: 603 },
  "espaco-disp": { x: 670, y: 125, w: 700 },
};

export function PhotoPage({ trilha = "jovem", foto, lado = "dir", className = "", children }) {
  const [src, alt] = SRC[trilha];
  const f = FOTOS[foto || trilha];
  return (
    <div className={"pp is-" + lado + " " + className} data-trilha={trilha} style={{ "--t": COR[trilha] }}>
      <div className="pp-foto" style={{ "--fx": f.x + "px", "--fy": f.y + "px", "--fw": f.w + "px" }}>
        <img src={src} alt={alt} className={trilha === "jovem" ? "pp-desk" : ""} />
        {trilha === "jovem" && <img src={kids} alt="Dois jovens de mãos dadas erguidas" className="pp-mob" />}
      </div>
      <div className="wrap pp-in">
        <div className="pp-col">
          {className.includes("form-esq") && <Logo color={COR[trilha]} className="form-logo-mob" />}
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthShell({ trilha = "jovem", foto, children }) {
  return (
    <PhotoPage trilha={trilha} foto={foto} className="auth">
      <div className="auth-form">
        <Logo color={COR[trilha]} className="auth-logo" />
        {children}
      </div>
    </PhotoPage>
  );
}

export function Login({ go, trilha = "jovem", entrar, aviso }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  /* protótipo: entra mesmo com os campos vazios */
  const submit = () => entrar(trilha);
  const onKey = (e) => e.key === "Enter" && submit();
  return (
    <AuthShell trilha={trilha}>
      {aviso && <Tag as="p" className="auth-aviso" k={4} fill="var(--color-sol)">{aviso}</Tag>}
      <Field label="e-mail" id="login-email" type="email" placeholder="nome@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} autoComplete="off" />
      <Field label="senha" id="login-senha" forma="b" type="password" placeholder="sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={onKey} autoComplete="off" />
      <Btn cor={COR[trilha]} className="auth-btn" onClick={submit}>entrar</Btn>
      <p className="auth-alt">
        não tem uma conta?
        <br />
        <button type="button" onClick={() => go(trilha === "jovem" ? "cadastro" : trilha === "artista" ? "artista-cadastro" : "parceiro-cadastro")}>cadastre-se</button>
      </p>
    </AuthShell>
  );
}

export function CadastroJovem({ go }) {
  const [f, setF] = useState({ nome: "", sobrenome: "", celular: "", email: "", nascimento: "", bairro: "", senha: "", confirmar: "" });
  const [erro, setErro] = useState("");
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const submit = () => {
    /* protótipo: segue mesmo sem preencher */
    setErro("");
    go("confira", { email: f.email });
  };
  return (
    <AuthShell trilha="jovem">
      <button type="button" className="auth-foto-perfil" aria-label="adicionar foto de perfil">
        <Ico.camera />
      </button>
      <div className="row2">
        <Field label="nome" id="c-nome" placeholder="seu nome" value={f.nome} onChange={set("nome")} />
        <Field label="sobrenome" id="c-sobrenome" forma="b" placeholder="sobrenome" value={f.sobrenome} onChange={set("sobrenome")} />
      </div>
      <Field label="celular" id="c-cel" placeholder="(11) 9 0000-0000" inputMode="tel" value={f.celular} onChange={set("celular")} />
      <Field label="e-mail" id="c-email" forma="b" type="email" placeholder="nome@email.com" value={f.email} onChange={set("email")} />
      <div className="row2">
        <Field label="nascimento" id="c-nasc" placeholder="__/__/____" value={f.nascimento} onChange={set("nascimento")} />
        <Field label="bairro" id="c-bairro" forma="b">
          <select id="c-bairro" value={f.bairro} onChange={set("bairro")}>
            <option value="">Selecione</option>
            {BAIRROS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="row2">
        <Field label="criar senha" id="c-senha" type="password" placeholder="mínimo 8 caracteres" value={f.senha} onChange={set("senha")} />
        <Field label="confirmar senha" id="c-conf" forma="b" type="password" placeholder="repetir a senha" value={f.confirmar} onChange={set("confirmar")} />
      </div>
      {erro && <p className="auth-erro" role="alert">{erro}</p>}
      <Btn className="auth-btn" onClick={submit}>cadastre-se</Btn>
      <p className="auth-alt">
        já tem uma conta?
        <br />
        <button type="button" onClick={() => go("login", { trilha: "jovem" })}>entre</button>
      </p>
    </AuthShell>
  );
}

export function ConfiraEmail({ go, email, entrar }) {
  return (
    <AuthShell trilha="jovem">
      <div className="confira">
        <h1 className="t-jovem">confira o seu e-mail!</h1>
        <p><strong>Só falta confirmar seu e-mail!</strong></p>
        <p>
          Enviamos um link de confirmação para {email ? <b>{email}</b> : "seu e-mail"}. É só acessar e validar sua conta para continuar.
        </p>
        <Btn className="auth-btn" onClick={() => go("lp")}>voltar para o início</Btn>
        <p className="auth-alt">
          já confirmou?
          <br />
          <button type="button" onClick={() => entrar("jovem")}>entrar na minha conta</button>
        </p>
      </div>
    </AuthShell>
  );
}
