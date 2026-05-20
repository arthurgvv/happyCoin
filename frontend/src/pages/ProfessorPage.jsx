import { useEffect, useMemo, useState } from "react";
import BalanceBanner from "../components/BalanceBanner.jsx";
import Navbar from "../components/Navbar.jsx";
import { professorService } from "../services/professorService.js";

const COURSES = [
  "Administracao", "Arquitetura e Urbanismo", "Ciencia da Computacao",
  "Direito", "Engenharia Civil", "Engenharia de Software",
  "Medicina", "Psicologia", "Publicidade e Propaganda", "Sistemas de Informacao",
];

const emptyProfile = { nome: "", email: "", senha: "", cursos: [], photoUrl: null };

function ProfessorPage({ user, onLogout, onUpdateUser, onToast }) {
  const [activePage, setActivePage] = useState("courses");
  const [courses, setCourses] = useState(user.cursos || []);
  const [students, setStudents] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [form, setForm] = useState({ studentId: "", quantidade: "", motivo: "" });
  const [submitting, setSubmitting] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    professorService.courses().then(setCourses).catch(() => setCourses(user.cursos || []));
  }, [user.cursos]);

  useEffect(() => {
    if (user.ultimoAviso) {
      onToast({ message: user.ultimoAviso, type: "success" });
    }
  }, [user.ultimoAviso, onToast]);

  useEffect(() => {
    if (activePage === "transfers") {
      setLoadingTransfers(true);
      professorService.transfers()
        .then(setTransfers)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingTransfers(false));
    }
    if (activePage === "profile") {
      setProfileForm(emptyProfile);
      professorService.me()
        .then((prof) => {
          if (prof.cursos && prof.cursos.length > 0) {
            setProfileForm((prev) => ({ ...prev, cursos: prof.cursos }));
          }
        })
        .catch(() => {
          if (user.cursos && user.cursos.length > 0) {
            setProfileForm((prev) => ({ ...prev, cursos: user.cursos }));
          }
        });
    }
  }, [activePage]);

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.id) === String(form.studentId)),
    [students, form.studentId],
  );

  async function openCourse(course) {
    try {
      const next = await professorService.studentsByCourse(course);
      setStudents(next);
      setActiveCourse(course);
      setForm({ studentId: "", quantidade: "", motivo: "" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    }
  }

  async function handleTransfer(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const professor = await professorService.transfer({
        studentId: form.studentId,
        quantidade: Number(form.quantidade),
        motivo: form.motivo,
      });
      onUpdateUser(professor);
      setForm({ studentId: "", quantidade: "", motivo: "" });
      if (activeCourse) {
        const next = await professorService.studentsByCourse(activeCourse);
        setStudents(next);
      }
      onToast({ message: "Moedas enviadas com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (profileForm.nome) payload.nome = profileForm.nome;
      if (profileForm.email) payload.email = profileForm.email;
      if (profileForm.senha) payload.senha = profileForm.senha;
      if (profileForm.cursos.length > 0) payload.cursos = profileForm.cursos;

      const updated = await professorService.update(payload);
      onUpdateUser(updated);
      setCourses(updated.cursos || courses);
      setProfileForm(emptyProfile);
      onToast({ message: "Perfil atualizado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  function toggleCurso(curso) {
    setProfileForm((prev) => ({
      ...prev,
      cursos: prev.cursos.includes(curso)
        ? prev.cursos.filter((c) => c !== curso)
        : [...prev.cursos, curso],
    }));
  }

  const totalEnviado = transfers.reduce((sum, t) => sum + t.quantidade, 0);

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="PROFESSOR"
        user={user}
        tabs={[
          { key: "courses", label: "Cursos" },
          { key: "transfers", label: "Extrato" },
          { key: "profile", label: "Perfil" },
        ]}
      />

      <main className="student-home">
        <BalanceBanner saldo={user.saldoMoedas} title="Saldo disponivel" subtitle="moedas para distribuir" />

        {activePage === "courses" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Professor</p>
                <h2>Cursos atribuidos</h2>
              </div>
            </div>

            <div className="course-card-grid">
              {courses.length === 0 && (
                <p style={{ color: "var(--text-muted)", padding: "16px" }}>Nenhum curso atribuido. Solicite ao administrador da instituicao.</p>
              )}
              {courses.map((course) => (
                <button key={course} className="course-card" type="button" onClick={() => openCourse(course)}>
                  <span>Curso</span>
                  <strong>{course}</strong>
                </button>
              ))}
            </div>
          </section>
        )}

        {activePage === "transfers" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Historico de distribuicao</p>
                <h2>{transfers.length} transferencia(s) - {totalEnviado} moedas enviadas</h2>
              </div>
            </div>

            {loadingTransfers && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Carregando...</p>
            )}

            {!loadingTransfers && transfers.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Nenhuma transferencia realizada ainda.</p>
            )}

            {!loadingTransfers && transfers.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Moedas</th>
                      <th>Motivo</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => {
                      return (
                        <tr key={t.id}>
                          <td>{t.studentName}</td>
                          <td>+{t.quantidade}</td>
                          <td>{t.motivo}</td>
                          <td>{t.criadoEm ? new Date(t.criadoEm).toLocaleString("pt-BR") : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activePage === "profile" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Seus dados</p>
                <h2>Editar perfil</h2>
              </div>
            </div>

            <div className="info-card">
              <p><strong>Nome</strong>{user.nome}</p>
              <p><strong>Email</strong>{user.email}</p>
              <p><strong>Instituição</strong>{user.institutionName || "—"}</p>
              <p><strong>Cursos</strong>{(user.cursos || []).join(", ") || "—"}</p>
              <p><strong>Saldo</strong>{user.saldoMoedas} moedas</p>
            </div>

            <form className="entity-form professor-form" onSubmit={handleSaveProfile}>
              <div className="full-field">
                <div className="photo-upload-wrap">
                  <div className="photo-upload-preview">
                    {profileForm.photoUrl
                      ? <img src={profileForm.photoUrl} alt="Foto" />
                      : (user.photoUrl
                          ? <img src={user.photoUrl} alt="Foto" />
                          : user.nome.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase())}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.88rem" }}>Foto de perfil</p>
                    <label className="photo-upload-btn" style={{ display: "inline-block" }}>
                      {(profileForm.photoUrl || user.photoUrl) ? "Trocar foto" : "Adicionar foto"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setProfileForm(p => ({ ...p, photoUrl: reader.result }));
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              <label>
                Novo nome (opcional)
                <input value={profileForm.nome} onChange={(e) => setProfileForm((p) => ({ ...p, nome: e.target.value }))} />
              </label>
              <label>
                Novo email (opcional)
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
              </label>
              <label>
                Nova senha (opcional)
                <input type="password" value={profileForm.senha} onChange={(e) => setProfileForm((p) => ({ ...p, senha: e.target.value }))} />
              </label>
              <div className="full-field">
                <p style={{ marginBottom: "12px", fontWeight: 500 }}>Alterar cursos (opcional — deixe vazio para manter os atuais)</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {COURSES.map((curso) => (
                    <label key={curso} style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "normal", cursor: "pointer", margin: 0 }}>
                      <input type="checkbox" checked={profileForm.cursos.includes(curso)} onChange={() => toggleCurso(curso)} style={{ minWidth: "20px", width: "20px", height: "20px" }} />
                      <span>{curso}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          </section>
        )}

        {activeCourse && (
          <div className="modal-backdrop" role="presentation" onClick={() => setActiveCourse(null)}>
            <section className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Curso selecionado</p>
                  <h2>{activeCourse}</h2>
                </div>
                <button className="button button-secondary" type="button" onClick={() => setActiveCourse(null)}>Fechar</button>
              </div>

              <form className="entity-form professor-form" onSubmit={handleTransfer}>
                <label>
                  Aluno
                  <select value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))} required>
                    <option value="">Selecione um aluno</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.nome} — {s.email}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantidade
                  <input type="number" min="1" max={user.saldoMoedas} value={form.quantidade} onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))} required />
                </label>
                <label className="full-field">
                  Motivo do reconhecimento
                  <textarea value={form.motivo} onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))} required />
                </label>
                <div className="full-field selected-student-card">
                  {selectedStudent
                    ? `${selectedStudent.nome} recebera ${form.quantidade || 0} moedas.`
                    : "Selecione um aluno para distribuir moedas."}
                </div>
                <div className="form-actions">
                  <button className="button button-primary" type="submit" disabled={submitting}>
                    {submitting ? "Enviando..." : "Enviar moedas"}
                  </button>
                </div>
              </form>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Aluno</th><th>Email</th><th>Instituicao</th><th>Saldo</th></tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>{s.nome}</td>
                        <td>{s.email}</td>
                        <td>{s.instituicao}</td>
                        <td>{s.saldoMoedas} moedas</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfessorPage;
