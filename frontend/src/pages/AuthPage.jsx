import { useEffect, useState } from "react";
import DevLogin from "../components/DevLogin.jsx";
import PenguinCanvas from "../components/PenguinCanvas.jsx";
import { DEFAULT_INSTITUTIONS, mergeInstitutions } from "../services/institutionOptions.js";
import { studentService } from "../services/studentService.js";
import { buscarCep } from "../services/viaCepService.js";

const emptyRegisterForm = {
  nome: "", email: "", cpf: "", rg: "", endereco: "", instituicao: "", curso: "", senha: "",
};
const emptyLoginForm = { email: "", senha: "" };
const emptyCompanyForm = { nomeFantasia: "", cnpj: "", email: "", senha: "" };
const emptyInstitutionForm = { nome: "", email: "", senha: "senha123", telefone: "", endereco: "", identificadorInstitucional: "" };

function AuthPage({ onLogin, onRegister, onCompanyRegister, onInstitutionRegister }) {
  const [mode, setMode] = useState("choice");
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [institutionForm, setInstitutionForm] = useState(emptyInstitutionForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [institutions, setInstitutions] = useState(DEFAULT_INSTITUTIONS);
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [cepAluno, setCepAluno] = useState("");
  const [buscandoCepAluno, setBuscandoCepAluno] = useState(false);
  const [cepInstituicao, setCepInstituicao] = useState("");
  const [buscandoCepInstituicao, setBuscandoCepInstituicao] = useState(false);

  useEffect(() => {
    studentService.institutions().then((data) => setInstitutions(mergeInstitutions(data))).catch(() => setInstitutions(DEFAULT_INSTITUTIONS));
    studentService.courses().then(setCourses).catch(() => setCourses([]));
  }, []);

  function goTo(next) { setMode(next); setShowPass(false); }

  async function handleRegister(event) {
    event.preventDefault();
    setSubmitting(true);
    try { await onRegister(registerForm); } finally { setSubmitting(false); }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    try { await onLogin(loginForm); } finally { setSubmitting(false); }
  }

  async function handleCompanyRegister(event) {
    event.preventDefault();
    setSubmitting(true);
    try { await onCompanyRegister(companyForm); } finally { setSubmitting(false); }
  }

  async function handleInstitutionRegister(event) {
    event.preventDefault();
    setSubmitting(true);
    try { await onInstitutionRegister(institutionForm); } finally { setSubmitting(false); }
  }

  function updateRegister(name, value) { setRegisterForm((c) => ({ ...c, [name]: value })); }
  function updateCompany(name, value) { setCompanyForm((c) => ({ ...c, [name]: value })); }
  function updateInstitution(name, value) { setInstitutionForm((c) => ({ ...c, [name]: value })); }

  async function handleBuscarCepAluno() {
    setBuscandoCepAluno(true);
    try {
      const endereco = await buscarCep(cepAluno);
      updateRegister("endereco", endereco);
    } catch (err) {
      alert(err.message);
    } finally {
      setBuscandoCepAluno(false);
    }
  }

  async function handleBuscarCepInstituicao() {
    setBuscandoCepInstituicao(true);
    try {
      const endereco = await buscarCep(cepInstituicao);
      updateInstitution("endereco", endereco);
    } catch (err) {
      alert(err.message);
    } finally {
      setBuscandoCepInstituicao(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <PenguinCanvas />
      </section>

      <section className="auth-card">
        {mode === "choice" ? (
          <div className="auth-form-page">
            <div className="auth-form-header">
              <p className="auth-form-logo" aria-label="HappyCoin">
                <span className="brand-happy">Happy</span><span className="brand-coin">Coin</span>
              </p>
              <p className="auth-form-subtitle">moedas que recompensam seu esforço acadêmico</p>
            </div>
            <div className="auth-choice-actions">
              <button className="auth-choice-primary" type="button" onClick={() => goTo("login")}>
                Entrar
              </button>
              <div className="auth-choice-divider"><span>ou</span></div>
              <p className="auth-choice-prompt">Novo por aqui?</p>
              <button className="auth-choice-secondary" type="button" onClick={() => goTo("register")}>
                Criar conta de aluno
              </button>
              <button className="auth-choice-secondary" type="button" onClick={() => goTo("company")}>
                Cadastrar empresa parceira
              </button>
              <button className="auth-choice-secondary" type="button" onClick={() => goTo("institution")}>
                Cadastrar instituição
              </button>
            </div>
          </div>

        ) : mode === "login" ? (
          <div className="auth-form-page">
            <div className="auth-form-header">
              <p className="auth-form-logo" aria-label="HappyCoin">
                <span className="brand-happy">Happy</span><span className="brand-coin">Coin</span>
              </p>
              <h1 className="auth-form-title">Entrar</h1>
              <p className="auth-form-subtitle">bem-vindo de volta à sua conta</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="auth-form-card">
                <label className="auth-field">
                  <span>Email</span>
                  <input type="email" placeholder="seu@email.com" value={loginForm.email} onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))} required />
                </label>
                <label className="auth-field">
                  <span>Senha</span>
                  <div className="auth-pass-wrap">
                    <input type={showPass ? "text" : "password"} placeholder="••••••••" value={loginForm.senha} onChange={(e) => setLoginForm((c) => ({ ...c, senha: e.target.value }))} required />
                    <button type="button" className="auth-pass-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                      {showPass ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>
                <button className="auth-choice-primary" type="submit" disabled={submitting}>
                  {submitting ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
            <p className="auth-form-footer">
              Não tem uma conta?{" "}
              <button type="button" onClick={() => goTo("choice")}>Criar conta</button>
            </p>
          </div>

        ) : mode === "register" ? (
          <div className="auth-form-page">
            <div className="auth-form-header">
              <p className="auth-form-logo" aria-label="HappyCoin">
                <span className="brand-happy">Happy</span><span className="brand-coin">Coin</span>
              </p>
              <h1 className="auth-form-title">Criar conta</h1>
              <p className="auth-form-subtitle">cadastro de aluno</p>
            </div>
            <form onSubmit={handleRegister}>
              <div className="auth-form-card">
                <label className="auth-field">
                  <span>Nome completo</span>
                  <input value={registerForm.nome} onChange={(e) => updateRegister("nome", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>Email</span>
                  <input type="email" value={registerForm.email} onChange={(e) => updateRegister("email", e.target.value)} required />
                </label>
                <div className="auth-field-row">
                  <label className="auth-field">
                    <span>CPF</span>
                    <input inputMode="numeric" maxLength="11" minLength="11" pattern="\d{11}" placeholder="00000000000" value={registerForm.cpf} onChange={(e) => updateRegister("cpf", onlyDigits(e.target.value).slice(0, 11))} required />
                  </label>
                  <label className="auth-field">
                    <span>RG</span>
                    <input inputMode="numeric" maxLength="9" minLength="9" pattern="\d{9}" placeholder="000000000" value={registerForm.rg} onChange={(e) => updateRegister("rg", onlyDigits(e.target.value).slice(0, 9))} required />
                  </label>
                </div>
                <label className="auth-field">
                  <span>CEP</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      inputMode="numeric"
                      maxLength="8"
                      placeholder="00000000"
                      value={cepAluno}
                      onChange={(e) => setCepAluno(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="auth-choice-secondary"
                      style={{ padding: "0 12px", whiteSpace: "nowrap" }}
                      onClick={handleBuscarCepAluno}
                      disabled={buscandoCepAluno || cepAluno.length !== 8}
                    >
                      {buscandoCepAluno ? "..." : "Buscar"}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>Endereço</span>
                  <input value={registerForm.endereco} onChange={(e) => updateRegister("endereco", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>Instituição de ensino</span>
                  <select value={registerForm.instituicao} onChange={(e) => updateRegister("instituicao", e.target.value)} required>
                    <option value="">Selecione</option>
                    {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </label>
                <label className="auth-field">
                  <span>Curso</span>
                  <select value={registerForm.curso} onChange={(e) => updateRegister("curso", e.target.value)} required>
                    <option value="">Selecione</option>
                    {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="auth-field">
                  <span>Senha</span>
                  <div className="auth-pass-wrap">
                    <input type={showPass ? "text" : "password"} pattern="(?=.*[A-Za-z])(?=.*\d).{6,}" placeholder="Letras e números" value={registerForm.senha} onChange={(e) => updateRegister("senha", e.target.value)} required />
                    <button type="button" className="auth-pass-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                      {showPass ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>
                <button className="auth-choice-primary" type="submit" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar e entrar"}
                </button>
              </div>
            </form>
            <p className="auth-form-footer">
              Já tem uma conta?{" "}
              <button type="button" onClick={() => goTo("login")}>Entrar</button>
            </p>
          </div>

        ) : mode === "company" ? (
          <div className="auth-form-page">
            <div className="auth-form-header">
              <p className="auth-form-logo" aria-label="HappyCoin">
                <span className="brand-happy">Happy</span><span className="brand-coin">Coin</span>
              </p>
              <h1 className="auth-form-title">Cadastrar empresa</h1>
              <p className="auth-form-subtitle">cadastro de empresa parceira</p>
            </div>
            <form onSubmit={handleCompanyRegister}>
              <div className="auth-form-card">
                <label className="auth-field">
                  <span>Nome fantasia</span>
                  <input value={companyForm.nomeFantasia} onChange={(e) => updateCompany("nomeFantasia", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>CNPJ</span>
                  <input inputMode="numeric" maxLength="14" minLength="14" pattern="\d{14}" placeholder="00000000000000" value={companyForm.cnpj} onChange={(e) => updateCompany("cnpj", onlyDigits(e.target.value).slice(0, 14))} required />
                </label>
                <label className="auth-field">
                  <span>Email</span>
                  <input type="email" value={companyForm.email} onChange={(e) => updateCompany("email", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>Senha</span>
                  <div className="auth-pass-wrap">
                    <input type={showPass ? "text" : "password"} pattern="(?=.*[A-Za-z])(?=.*\d).{6,}" placeholder="Letras e números" value={companyForm.senha} onChange={(e) => updateCompany("senha", e.target.value)} required />
                    <button type="button" className="auth-pass-eye" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
                      {showPass ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </label>
                <button className="auth-choice-primary" type="submit" disabled={submitting}>
                  {submitting ? "Cadastrando..." : "Cadastrar empresa"}
                </button>
              </div>
            </form>
            <p className="auth-form-footer">
              Já tem uma conta?{" "}
              <button type="button" onClick={() => goTo("login")}>Entrar</button>
            </p>
          </div>

        ) : mode === "institution" ? (
          <div className="auth-form-page">
            <div className="auth-form-header">
              <p className="auth-form-logo" aria-label="HappyCoin">
                <span className="brand-happy">Happy</span><span className="brand-coin">Coin</span>
              </p>
              <h1 className="auth-form-title">Cadastrar instituição</h1>
              <p className="auth-form-subtitle">cadastro institucional</p>
            </div>
            <form onSubmit={handleInstitutionRegister}>
              <div className="auth-form-card">
                <label className="auth-field">
                  <span>Nome da instituição</span>
                  <input value={institutionForm.nome} onChange={(e) => updateInstitution("nome", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>Email</span>
                  <input type="email" value={institutionForm.email} onChange={(e) => updateInstitution("email", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>Telefone</span>
                  <input value={institutionForm.telefone} onChange={(e) => updateInstitution("telefone", onlyDigits(e.target.value).slice(0, 11))} required />
                </label>
                <label className="auth-field">
                  <span>CEP</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      inputMode="numeric"
                      maxLength="8"
                      placeholder="00000000"
                      value={cepInstituicao}
                      onChange={(e) => setCepInstituicao(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="auth-choice-secondary"
                      style={{ padding: "0 12px", whiteSpace: "nowrap" }}
                      onClick={handleBuscarCepInstituicao}
                      disabled={buscandoCepInstituicao || cepInstituicao.length !== 8}
                    >
                      {buscandoCepInstituicao ? "..." : "Buscar"}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>Endereço</span>
                  <input value={institutionForm.endereco} onChange={(e) => updateInstitution("endereco", e.target.value)} required />
                </label>
                <label className="auth-field">
                  <span>Identificador institucional (CNPJ)</span>
                  <input inputMode="numeric" maxLength="14" minLength="14" pattern="\d{14}" placeholder="00000000000000" value={institutionForm.identificadorInstitucional} onChange={(e) => updateInstitution("identificadorInstitucional", onlyDigits(e.target.value).slice(0, 14))} required />
                </label>
                <label className="auth-field">
                  <span>Senha</span>
                  <input type="password" value={institutionForm.senha} onChange={(e) => updateInstitution("senha", e.target.value)} required />
                </label>
                <button className="auth-choice-primary" type="submit" disabled={submitting}>
                  {submitting ? "Criando..." : "Criar instituição"}
                </button>
              </div>
            </form>
            <p className="auth-form-footer">
              Já tem uma conta?{" "}
              <button type="button" onClick={() => goTo("login")}>Entrar</button>
            </p>
          </div>

        ) : null}
        <DevLogin onLogin={onLogin} />
      </section>
    </main>
  );
}

function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

export default AuthPage;
