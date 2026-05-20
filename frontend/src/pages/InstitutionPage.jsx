import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { institutionService } from "../services/institutionService.js";

const COURSES = [
  "Administracao",
  "Arquitetura e Urbanismo",
  "Ciencia da Computacao",
  "Direito",
  "Engenharia Civil",
  "Engenharia de Software",
  "Medicina",
  "Psicologia",
  "Publicidade e Propaganda",
  "Sistemas de Informacao",
];

const emptyProfessor = { nome: "", email: "", cpf: "", senha: "", cursos: [] };
const emptyProfile = { nome: "", email: "", senha: "", telefone: "", endereco: "", photoUrl: null };

function InstitutionPage({ user, onLogout, onUpdateUser, onToast }) {
  const [activePage, setActivePage] = useState("overview");
  const [dirTab, setDirTab] = useState("professors");
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [startingSemester, setStartingSemester] = useState(false);
  const [profForm, setProfForm] = useState(emptyProfessor);
  const [addingProf, setAddingProf] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    institutionService.professors().then(setProfessors).catch(() => {});
    institutionService.companies().then(setCompanies).catch(() => {});
  }, []);

  useEffect(() => {
    if (activePage === "students" || activePage === "overview") {
      institutionService.students().then(setStudents).catch(() => {});
    }
  }, [activePage]);

  useEffect(() => {
    if (user.ultimoAviso) {
      onToast({ message: user.ultimoAviso, type: "success" });
    }
  }, [user.ultimoAviso, onToast]);

  async function handleStartSemester() {
    setStartingSemester(true);
    try {
      const response = await institutionService.startSemester();
      const updated = await institutionService.me();
      onUpdateUser(updated);
      institutionService.professors().then(setProfessors).catch(() => {});
      onToast({ message: `${response.mensagem} ${response.professoresAtualizados} professor(es) atualizado(s).`, type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setStartingSemester(false);
    }
  }

  async function handleAddProfessor(event) {
    event.preventDefault();
    setAddingProf(true);
    try {
      const created = await institutionService.createProfessor({
        nome: profForm.nome,
        email: profForm.email,
        cpf: profForm.cpf,
        senha: profForm.senha,
        cursos: profForm.cursos,
      });
      setProfessors((prev) => [...prev, created]);
      setProfForm(emptyProfessor);
      onToast({ message: "Professor cadastrado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setAddingProf(false);
    }
  }

  async function handleDeleteProfessor(professor) {
    if (!window.confirm(`Remover professor "${professor.nome}"?`)) return;
    try {
      await institutionService.deleteProfessor(professor.id);
      setProfessors((prev) => prev.filter((p) => p.id !== professor.id));
      onToast({ message: "Professor removido.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    }
  }

  function toggleCurso(curso) {
    setProfForm((prev) => ({
      ...prev,
      cursos: prev.cursos.includes(curso)
        ? prev.cursos.filter((c) => c !== curso)
        : [...prev.cursos, curso],
    }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (profileForm.nome) payload.nome = profileForm.nome;
      if (profileForm.email) payload.email = profileForm.email;
      if (profileForm.senha) payload.senha = profileForm.senha;
      if (profileForm.telefone) payload.telefone = profileForm.telefone;
      if (profileForm.endereco) payload.endereco = profileForm.endereco;

      const updated = await institutionService.update(payload);
      onUpdateUser(updated);
      setProfileForm(emptyProfile);
      onToast({ message: "Perfil atualizado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  const studentsByCourse = students.reduce((acc, student) => {
    const curso = student.curso || "Sem curso";
    if (!acc[curso]) acc[curso] = [];
    acc[curso].push(student);
    return acc;
  }, {});

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="INSTITUTION"
        user={user}
        tabs={[
          { key: "overview", label: "Visao Geral" },
          { key: "professors", label: "Professores" },
          { key: "students", label: "Alunos" },
          { key: "profile", label: "Perfil" },
        ]}
      />

      <main className="student-home">
        {activePage === "overview" && (() => {
          const hcEmCirculacao =
            professors.reduce((s, p) => s + (p.saldoMoedas || 0), 0) +
            students.reduce((s, st) => s + (st.saldoMoedas || 0), 0);

          return (
            <>
              <div>
                <p className="eyebrow" style={{ marginBottom: 6 }}>Painel institucional</p>
                <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 0 }}>
                  {user.nome}
                </h2>
              </div>

              <div className="stat-cards">
                <div className="stat-card stat-card-gold">
                  <p className="eyebrow">HC em circulação</p>
                  <span className="stat-value">{hcEmCirculacao.toLocaleString("pt-BR")}</span>
                </div>
                <div className="stat-card">
                  <p className="eyebrow">Professores ativos</p>
                  <span className="stat-value">{professors.length}</span>
                  {professors.length > 0 && (
                    <div className="avatar-group">
                      {professors.slice(0, 4).map((p) => {
                        const ini = p.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                        return (
                          <div key={p.id} className="avatar-group-item" title={p.nome}>
                            {p.photoUrl ? <img src={p.photoUrl} alt={p.nome} /> : ini}
                          </div>
                        );
                      })}
                      {professors.length > 4 && (
                        <div className="avatar-group-item avatar-group-more">+{professors.length - 4}</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="stat-card stat-card-teal">
                  <p className="eyebrow">Empresas parceiras</p>
                  <span className="stat-value">{companies.length}</span>
                  <p style={{ color: "rgba(255,255,255,.6)", fontSize: "0.78rem", margin: "6px 0 0", fontWeight: 600 }}>
                    Empresas cadastradas no sistema
                  </p>
                </div>
              </div>

              <section className="professor-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Diretório institucional</p>
                    <h2>Professores, Alunos &amp; Empresas</h2>
                  </div>
                  <div className="dir-tabs">
                    <button type="button" className={dirTab === "professors" ? "is-active" : ""} onClick={() => setDirTab("professors")}>
                      Professores
                    </button>
                    <button type="button" className={dirTab === "students" ? "is-active" : ""} onClick={() => setDirTab("students")}>
                      Alunos
                    </button>
                    <button type="button" className={dirTab === "companies" ? "is-active" : ""} onClick={() => setDirTab("companies")}>
                      Empresas
                    </button>
                  </div>
                </div>

                {dirTab === "professors" && (
                  professors.length === 0
                    ? <p className="empty-state">Nenhum professor vinculado.</p>
                    : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr><th>Professor</th><th>Cursos</th><th>Saldo</th></tr>
                          </thead>
                          <tbody>
                            {professors.map((p) => {
                              const ini = p.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                              return (
                                <tr key={p.id}>
                                  <td>
                                    <div className="table-name-cell">
                                      <div className="table-avatar">
                                        {p.photoUrl ? <img src={p.photoUrl} alt={p.nome} /> : ini}
                                      </div>
                                      <div className="table-name-meta">
                                        <strong>{p.nome}</strong>
                                        <span>{p.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="dept-chips">
                                      {(p.cursos || []).slice(0, 2).map((c) => (
                                        <span key={c} className="dept-chip">{c}</span>
                                      ))}
                                    </div>
                                  </td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{p.saldoMoedas}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                )}

                {dirTab === "students" && (
                  students.length === 0
                    ? <p className="empty-state">Nenhum aluno cadastrado.</p>
                    : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr><th>Aluno</th><th>Curso</th><th>Saldo</th></tr>
                          </thead>
                          <tbody>
                            {students.map((s) => {
                              const ini = s.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                              return (
                                <tr key={s.id}>
                                  <td>
                                    <div className="table-name-cell">
                                      <div className="table-avatar table-avatar-teal">
                                        {s.photoUrl ? <img src={s.photoUrl} alt={s.nome} /> : ini}
                                      </div>
                                      <div className="table-name-meta">
                                        <strong>{s.nome}</strong>
                                        <span>{s.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{s.curso && <span className="dept-chip">{s.curso}</span>}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{s.saldoMoedas}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                )}

                {dirTab === "companies" && (
                  companies.length === 0
                    ? <p className="empty-state">Nenhuma empresa cadastrada.</p>
                    : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr><th>Empresa</th><th>CNPJ</th><th>Email</th></tr>
                          </thead>
                          <tbody>
                            {companies.map((c) => {
                              const ini = c.nomeFantasia.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                              return (
                                <tr key={c.id}>
                                  <td>
                                    <div className="table-name-cell">
                                      <div className="table-avatar" style={{ background: "linear-gradient(135deg,#5b6af0,#3a4adc)" }}>
                                        {c.photoUrl ? <img src={c.photoUrl} alt={c.nomeFantasia} /> : ini}
                                      </div>
                                      <div className="table-name-meta">
                                        <strong>{c.nomeFantasia}</strong>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>{c.cnpj}</td>
                                  <td>{c.email}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                )}
              </section>

              <section className="professor-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Semestre letivo</p>
                    <h2>Distribuir créditos aos professores</h2>
                  </div>
                  <button className="button button-primary" type="button" onClick={handleStartSemester} disabled={startingSemester}>
                    {startingSemester ? "Iniciando..." : "Iniciar semestre (+1000 moedas)"}
                  </button>
                </div>
              </section>
            </>
          );
        })()}

        {activePage === "professors" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Gestao de professores</p>
                <h2>Cadastrar professor</h2>
              </div>
            </div>

            <form className="entity-form professor-form" onSubmit={handleAddProfessor}>
              <label>
                Nome completo
                <input value={profForm.nome} onChange={(e) => setProfForm((p) => ({ ...p, nome: e.target.value }))} required />
              </label>
              <label>
                Email
                <input type="email" value={profForm.email} onChange={(e) => setProfForm((p) => ({ ...p, email: e.target.value }))} required />
              </label>
              <label>
                CPF (11 digitos)
                <input value={profForm.cpf} maxLength={11} onChange={(e) => setProfForm((p) => ({ ...p, cpf: e.target.value }))} required />
              </label>
              <label>
                Senha
                <input type="password" value={profForm.senha} onChange={(e) => setProfForm((p) => ({ ...p, senha: e.target.value }))} required />
              </label>
              <div className="full-field">
                <p style={{ marginBottom: "8px", fontWeight: 500 }}>Cursos atribuidos</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {COURSES.map((curso) => (
                    <label key={curso} style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "normal", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={profForm.cursos.includes(curso)}
                        onChange={() => toggleCurso(curso)}
                      />
                      {curso}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={addingProf || profForm.cursos.length === 0}>
                  {addingProf ? "Cadastrando..." : "Cadastrar professor"}
                </button>
              </div>
            </form>

            <div className="table-wrap" style={{ marginTop: "32px" }}>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Cursos</th>
                    <th>Saldo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {professors.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>Nenhum professor cadastrado.</td></tr>
                  )}
                  {professors.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td>{p.email}</td>
                      <td>{(p.cursos || []).join(", ")}</td>
                      <td>{p.saldoMoedas} moedas</td>
                      <td>
                        <button
                          className="button"
                          style={{ color: "var(--error, #e53e3e)", background: "none", border: "1px solid currentColor", padding: "4px 10px", fontSize: "0.8rem" }}
                          onClick={() => handleDeleteProfessor(p)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activePage === "students" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Alunos matriculados</p>
                <h2>{students.length} aluno(s) na instituicao</h2>
              </div>
            </div>

            {Object.keys(studentsByCourse).length === 0 && (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px" }}>Nenhum aluno cadastrado nesta instituicao.</p>
            )}

            {Object.entries(studentsByCourse).map(([curso, list]) => (
              <div key={curso} style={{ marginBottom: "32px" }}>
                <h3 style={{ marginBottom: "12px", color: "var(--text-secondary, #555)" }}>{curso} — {list.length} aluno(s)</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Saldo</th>
                        <th>Cadastrado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((s) => (
                        <tr key={s.id}>
                          <td>{s.nome}</td>
                          <td>{s.email}</td>
                          <td>{s.saldoMoedas} moedas</td>
                          <td>{s.criadoEm ? new Date(s.criadoEm).toLocaleDateString("pt-BR") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        )}

        {activePage === "profile" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Dados da instituicao</p>
                <h2>Editar perfil</h2>
              </div>
            </div>

            <div className="info-card">
              <p><strong>Nome</strong>{user.nome}</p>
              <p><strong>Email</strong>{user.email}</p>
              {user.telefone && <p><strong>Telefone</strong>{user.telefone}</p>}
              {user.endereco && <p><strong>Endereco</strong>{user.endereco}</p>}
            </div>

            <form className="entity-form professor-form" onSubmit={handleSaveProfile}>
              <div className="full-field">
                <div className="photo-upload-wrap">
                  <div className="photo-upload-preview">
                    {profileForm.photoUrl
                      ? <img src={profileForm.photoUrl} alt="Logo" />
                      : (user.photoUrl
                          ? <img src={user.photoUrl} alt="Logo" />
                          : user.nome.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase())}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.88rem" }}>Logo da instituição</p>
                    <label className="photo-upload-btn" style={{ display: "inline-block" }}>
                      {(profileForm.photoUrl || user.photoUrl) ? "Trocar logo" : "Adicionar logo"}
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
                Telefone (opcional)
                <input value={profileForm.telefone} onChange={(e) => setProfileForm((p) => ({ ...p, telefone: e.target.value }))} />
              </label>
              <label className="full-field">
                Endereco (opcional)
                <input value={profileForm.endereco} onChange={(e) => setProfileForm((p) => ({ ...p, endereco: e.target.value }))} />
              </label>
              <label>
                Nova senha (opcional)
                <input type="password" value={profileForm.senha} onChange={(e) => setProfileForm((p) => ({ ...p, senha: e.target.value }))} />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default InstitutionPage;
