import { useEffect, useState } from "react";
import { DEFAULT_INSTITUTIONS, mergeInstitutions } from "../services/institutionOptions.js";
import { studentService } from "../services/studentService.js";

const emptyForm = {
  nome: "",
  email: "",
  cpf: "",
  rg: "",
  endereco: "",
  instituicao: "",
  curso: "",
  senha: "",
  photoUrl: "",
};

const COIN_ICON_SM = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
  </svg>
);

function AccountForm({ user, onSave, onToast }) {
  const [form, setForm] = useState({ ...emptyForm, ...user, senha: "" });
  const [institutions, setInstitutions] = useState(DEFAULT_INSTITUTIONS);
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [twoFa, setTwoFa] = useState(false);

  useEffect(() => {
    setForm({ ...emptyForm, ...user, senha: "" });
  }, [user]);

  useEffect(() => {
    studentService.institutions().then((data) => setInstitutions(mergeInstitutions(data))).catch(() => setInstitutions(DEFAULT_INSTITUTIONS));
    studentService.courses().then(setCourses).catch(() => setCourses([]));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const updated = await studentService.updateMe(form);
      onSave(updated);
      onToast({ message: "Dados atualizados com sucesso.", type: "success" });
      setForm((current) => ({ ...current, senha: "" }));
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="settings-page-header">
        <h2>Configurações de Perfil do Aluno</h2>
        <p>Gerencie sua identidade acadêmica e preferências de segurança.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-left">
          <div className="settings-profile-card">
            <div className="settings-profile-photo-wrap">
              <div className="settings-profile-photo">
                {form.photoUrl ? <img src={form.photoUrl} alt="Foto" /> : initials(form.nome)}
              </div>
              <label className="settings-photo-badge">
                <CameraIcon />
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  update("photoUrl", await readFileAsDataUrl(file));
                }} />
              </label>
            </div>
            <h3 className="settings-profile-name">{user.nome}</h3>
            <p className="settings-profile-role">ALUNO</p>
            <label className="button settings-update-photo-btn">
              Atualizar Foto
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                update("photoUrl", await readFileAsDataUrl(file));
              }} />
            </label>
            <button className="button settings-remove-photo-btn" type="button" onClick={() => update("photoUrl", "")}>
              Remover
            </button>
          </div>

          <div className="settings-creds-card">
            <div className="settings-creds-title">
              <ShieldIcon />
              Credenciais
            </div>
            <div className="settings-creds-row">
              <span className="settings-creds-label">Status</span>
              <span className="settings-status-chip">Ativo</span>
            </div>
            <div className="settings-creds-row">
              <span className="settings-creds-label">Saldo de Moedas</span>
              <span className="settings-creds-balance">{COIN_ICON_SM} {(user.saldoMoedas || 0).toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>

        <div className="settings-right">
          <div className="settings-section-card">
            <div className="settings-section-header">
              <h2>Informações Pessoais</h2>
              <span className="settings-section-meta">Dados acadêmicos atuais</span>
            </div>
            <div className="settings-divider" />
            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="settings-form-row">
                <div className="settings-form-field">
                  <label className="settings-label">Nome Completo</label>
                  <input className="settings-input" value={form.nome} onChange={(event) => update("nome", event.target.value)} required />
                </div>
                <div className="settings-form-field">
                  <label className="settings-label">Endereço de Email</label>
                  <input className="settings-input" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
                </div>
              </div>
              <div className="settings-form-row">
                <div className="settings-form-field">
                  <label className="settings-label">CPF</label>
                  <input
                    className="settings-input"
                    inputMode="numeric"
                    maxLength="11"
                    minLength="11"
                    pattern="\d{11}"
                    value={form.cpf}
                    onChange={(event) => update("cpf", onlyDigits(event.target.value).slice(0, 11))}
                    required
                  />
                </div>
                <div className="settings-form-field">
                  <label className="settings-label">RG</label>
                  <input
                    className="settings-input"
                    inputMode="numeric"
                    maxLength="9"
                    minLength="9"
                    pattern="\d{9}"
                    value={form.rg}
                    onChange={(event) => update("rg", onlyDigits(event.target.value).slice(0, 9))}
                    required
                  />
                </div>
              </div>
              <div className="settings-form-row">
                <div className="settings-form-field">
                  <label className="settings-label">Instituição</label>
                  <select className="settings-input" value={form.instituicao} onChange={(event) => update("instituicao", event.target.value)} required>
                    <option value="">Selecione</option>
                    {institutions.map((institution) => (
                      <option key={institution} value={institution}>{institution}</option>
                    ))}
                  </select>
                </div>
                <div className="settings-form-field">
                  <label className="settings-label">Curso</label>
                  <select className="settings-input" value={form.curso} onChange={(event) => update("curso", event.target.value)} required>
                    <option value="">Selecione</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="settings-form-field">
                <label className="settings-label">Endereço</label>
                <input className="settings-input" value={form.endereco} onChange={(event) => update("endereco", event.target.value)} required />
              </div>
              <div className="settings-divider" />
              <div className="settings-form-actions">
                <button className="button button-secondary" type="button" onClick={() => setForm({ ...emptyForm, ...user, senha: "" })}>Descartar</button>
                <button className="button settings-save-btn" type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>

          <div className="settings-section-card">
            <h2>Segurança e Senha</h2>
            <p className="settings-security-desc">
              Atualize sua senha para manter seus resgates HappyCoin seguros.
            </p>
            <button className="button button-secondary settings-pwd-btn" type="button" onClick={() => setShowPwdChange((value) => !value)}>
              Alterar Senha
            </button>
            {showPwdChange && (
              <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
                <div className="settings-form-field">
                  <label className="settings-label">Nova Senha</label>
                  <input
                    className="settings-input"
                    type="password"
                    pattern="(?=.*[A-Za-z])(?=.*\d).{6,}"
                    value={form.senha}
                    placeholder="Senha deve conter letras e números."
                    onChange={(event) => update("senha", event.target.value)}
                  />
                </div>
                <div className="settings-form-actions" style={{ marginTop: 12 }}>
                  <button className="button settings-save-btn" type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : "Confirmar Nova Senha"}
                  </button>
                </div>
              </form>
            )}
            <div className="settings-divider" style={{ margin: "20px 0" }} />
            <div className="settings-2fa-row">
              <div className="settings-2fa-info">
                <div className="settings-2fa-title-row">
                  <ShieldIcon />
                  <strong>Autenticação de Dois Fatores</strong>
                </div>
                <p>Adicione uma camada extra de segurança à sua conta.</p>
              </div>
              <button className={`settings-toggle${twoFa ? " is-on" : ""}`} type="button" onClick={() => setTwoFa((value) => !value)} aria-label="Ativar autenticação de dois fatores" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
}

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CameraIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}

function ShieldIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}

export default AccountForm;
