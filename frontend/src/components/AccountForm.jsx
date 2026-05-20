import { useEffect, useState } from "react";
import { DEFAULT_INSTITUTIONS, mergeInstitutions } from "../services/institutionOptions.js";
import { studentService } from "../services/studentService.js";
import { buscarCep } from "../services/viaCepService.js";

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

function AccountForm({ user, onSave, onToast }) {
  const [form, setForm] = useState({ ...emptyForm, ...user, senha: "" });
  const [institutions, setInstitutions] = useState(DEFAULT_INSTITUTIONS);
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [cep, setCep] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

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

  async function handleBuscarCep() {
    setBuscandoCep(true);
    try {
      const endereco = await buscarCep(cep);
      update("endereco", endereco);
    } catch (err) {
      onToast({ message: err.message, type: "error" });
    } finally {
      setBuscandoCep(false);
    }
  }

  return (
    <section className="account-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Minha conta</p>
          <h2>Informacoes pessoais</h2>
        </div>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        <div className="full-field">
          <div className="photo-upload-wrap">
            <div className="photo-upload-preview photo-upload-preview-teal">
              {form.photoUrl
                ? <img src={form.photoUrl} alt="Foto de perfil" />
                : (form.nome ? form.nome.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?")}
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.88rem" }}>Foto de perfil</p>
              <label className="photo-upload-btn" style={{ display: "inline-block" }}>
                {form.photoUrl ? "Trocar foto" : "Adicionar foto"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await readFileAsDataUrl(file);
                  update("photoUrl", url);
                }} />
              </label>
            </div>
          </div>
        </div>
        <label>
          Nome completo
          <input value={form.nome} onChange={(event) => update("nome", event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        </label>
        <label>
          CPF
          <input
            inputMode="numeric"
            maxLength="11"
            minLength="11"
            pattern="\d{11}"
            value={form.cpf}
            onChange={(event) => update("cpf", onlyDigits(event.target.value).slice(0, 11))}
            required
          />
        </label>
        <label>
          RG
          <input
            inputMode="numeric"
            maxLength="9"
            minLength="9"
            pattern="\d{9}"
            value={form.rg}
            onChange={(event) => update("rg", onlyDigits(event.target.value).slice(0, 9))}
            required
          />
        </label>
        <label>
          CEP
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              inputMode="numeric"
              maxLength="8"
              placeholder="00000000"
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="button button-secondary"
              onClick={handleBuscarCep}
              disabled={buscandoCep || cep.length !== 8}
            >
              {buscandoCep ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </label>
        <label>
          Endereco
          <input value={form.endereco} onChange={(event) => update("endereco", event.target.value)} required />
        </label>
        <label>
          Instituicao de ensino
          <select value={form.instituicao} onChange={(event) => update("instituicao", event.target.value)} required>
            <option value="">Selecione</option>
            {institutions.map((institution) => (
              <option key={institution} value={institution}>{institution}</option>
            ))}
          </select>
        </label>
        <label>
          Curso
          <select value={form.curso} onChange={(event) => update("curso", event.target.value)} required>
            <option value="">Selecione</option>
            {courses.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </label>
        <label>
          Nova senha
          <input
            type="password"
            pattern="(?=.*[A-Za-z])(?=.*\d).{6,}"
            placeholder="Senha deve conter letras e numeros."
            value={form.senha}
            onChange={(event) => update("senha", event.target.value)}
          />
        </label>
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar alteracoes"}
          </button>
        </div>
      </form>
    </section>
  );
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

export default AccountForm;
