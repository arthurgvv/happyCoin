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
const emptyEditForm = { nome: "", email: "", senha: "", cursos: [] };

const AVATAR_PALETTE = ["#f4b91f","#e07b39","#9b6cf5","#3eb489","#e15c64","#5b8af5","#f5a623","#50c878","#c0392b","#8e44ad"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

const COURSE_ABBR = {
  "Administracao": "ADM",
  "Arquitetura e Urbanismo": "ARQ",
  "Ciencia da Computacao": "CC",
  "Direito": "DIR",
  "Engenharia Civil": "ENC",
  "Engenharia de Software": "ES",
  "Medicina": "MED",
  "Psicologia": "PSI",
  "Publicidade e Propaganda": "PP",
  "Sistemas de Informacao": "SI",
};

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
  const [editingProfessor, setEditingProfessor] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [profFilter, setProfFilter] = useState("");
  const [openStudentAction, setOpenStudentAction] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [highlightStudentId, setHighlightStudentId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);

  useEffect(() => {
    if (!openStudentAction) return;
    function close() { setOpenStudentAction(null); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openStudentAction]);

  useEffect(() => {
    if (!highlightStudentId) return;
    const timer = setTimeout(() => {
      document.getElementById(`student-row-${highlightStudentId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    const clear = setTimeout(() => setHighlightStudentId(null), 3000);
    return () => { clearTimeout(timer); clearTimeout(clear); };
  }, [highlightStudentId]);

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
    function refreshOnFocus() {
      if (activePage === "students" || activePage === "overview") {
        institutionService.students().then(setStudents).catch(() => {});
      }
    }
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
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

  function openEditProfessor(professor) {
    setEditingProfessor(professor);
    setEditForm({ nome: professor.nome, email: professor.email, senha: "", cursos: professor.cursos || [] });
  }

  function toggleEditCurso(curso) {
    setEditForm((prev) => ({
      ...prev,
      cursos: prev.cursos.includes(curso)
        ? prev.cursos.filter((c) => c !== curso)
        : [...prev.cursos, curso],
    }));
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    setSavingEdit(true);
    try {
      const payload = {};
      if (editForm.nome && editForm.nome !== editingProfessor.nome) payload.nome = editForm.nome;
      if (editForm.email && editForm.email !== editingProfessor.email) payload.email = editForm.email;
      if (editForm.senha) payload.senha = editForm.senha;
      if (editForm.cursos.length > 0) payload.cursos = editForm.cursos;

      const updated = await institutionService.updateProfessor(editingProfessor.id, payload);
      setProfessors((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setEditingProfessor(null);
      onToast({ message: "Professor atualizado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSavingEdit(false);
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
      if (profileForm.photoUrl) payload.photoUrl = profileForm.photoUrl;

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
          const professorsBalance = professors.reduce((s, p) => s + (p.saldoMoedas || 0), 0);
          const studentsBalance = students.reduce((s, st) => s + (st.saldoMoedas || 0), 0);
          const hcEmCirculacao = professorsBalance + studentsBalance;

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
                  <div className="stat-card-main">
                    <p className="eyebrow">HappyCoins em circulação</p>
                    <span className="stat-value">{hcEmCirculacao.toLocaleString("pt-BR")}</span>
                    <p className="stat-card-note">Saldo total entre professores e alunos da instituição.</p>
                  </div>
                  <div className="stat-card-footer">
                    <button className="stat-card-action" type="button" onClick={() => setShowDistribution(true)}>
                      Ver distribuição
                    </button>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-main">
                    <p className="eyebrow">Professores ativos</p>
                    <span className="stat-value">{professors.length}</span>
                    <p className="stat-card-note">Docentes vinculados e aptos a distribuir HappyCoins.</p>
                  </div>
                  <div className="stat-card-footer">
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
                </div>
                <div className="stat-card stat-card-teal">
                  <div className="stat-card-main">
                    <p className="eyebrow">Empresas parceiras</p>
                    <span className="stat-value">{companies.length}</span>
                    <p className="stat-card-note">Empresas cadastradas no sistema para ofertas e vantagens.</p>
                  </div>
                  <div className="stat-card-footer">
                    <button
                      className="stat-card-action"
                      type="button"
                      onClick={() => {
                        setDirTab("companies");
                        document.querySelector(".professor-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      Ver parceiros
                    </button>
                  </div>
                </div>
              </div>

              {showDistribution && (
                <div className="modal-backdrop" role="presentation" onClick={() => setShowDistribution(false)}>
                  <section className="modal-card distribution-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">Distribuição de HappyCoins</p>
                        <h2>{hcEmCirculacao.toLocaleString("pt-BR")} HappyCoins em circulação</h2>
                      </div>
                      <button className="button button-secondary" type="button" onClick={() => setShowDistribution(false)}>Fechar</button>
                    </div>
                    <div className="distribution-grid">
                      <div className="distribution-item">
                        <span>Professores</span>
                        <strong>{professorsBalance.toLocaleString("pt-BR")}</strong>
                        <p>{professors.length} professor(es) com saldo ativo</p>
                      </div>
                      <div className="distribution-item">
                        <span>Alunos</span>
                        <strong>{studentsBalance.toLocaleString("pt-BR")}</strong>
                        <p>{students.length} aluno(s) vinculados à instituição</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

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
                            <tr><th>Professor</th><th>Cursos</th><th className="balance-col">Saldo</th></tr>
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
                                  <td className="balance-col">
                                    <span className="coin-balance">
                                      <span className="coin-balance-icon">$</span>
                                      {(p.saldoMoedas ?? 0).toLocaleString("pt-BR")}
                                    </span>
                                  </td>
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
                            <tr><th>Aluno</th><th>Curso</th><th className="balance-col">Saldo</th></tr>
                          </thead>
                          <tbody>
                            {students.map((s) => {
                              const ini = s.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                              return (
                                <tr
                                  key={s.id}
                                  id={`student-row-${s.id}`}
                                  className={highlightStudentId === s.id ? "student-row-highlight" : ""}
                                >
                                  <td>
                                    <div className="table-name-cell">
                                      <div className="table-avatar" style={{ background: avatarColor(s.nome), color: "#fff" }}>
                                        {s.photoUrl ? <img src={s.photoUrl} alt={s.nome} /> : ini}
                                      </div>
                                      <div className="table-name-meta">
                                        <strong>{s.nome}</strong>
                                        <span>{s.email}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{s.curso && <span className="dept-chip">{s.curso}</span>}</td>
                                  <td className="balance-col">
                                    <span className="balance-pill">
                                      <span className="balance-dot" />
                                      {(s.saldoMoedas || 0).toLocaleString("pt-BR")} moedas
                                    </span>
                                  </td>
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
                <p className="eyebrow">Gestao academica</p>
                <h2>Cadastrar professor</h2>
                <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.88rem" }}>
                  Adicione novos docentes e atribua seus respectivos cursos.
                </p>
              </div>
            </div>

            <form className="entity-form professor-form" onSubmit={handleAddProfessor}>
              <label>
                Nome completo
                <input placeholder="Ex. Dr. Carlos Mendes" value={profForm.nome} onChange={(e) => setProfForm((p) => ({ ...p, nome: e.target.value }))} required />
              </label>
              <label>
                Email institucional
                <input type="email" placeholder="email@pucminas.br" value={profForm.email} onChange={(e) => setProfForm((p) => ({ ...p, email: e.target.value }))} required />
              </label>
              <label>
                CPF (11 digitos)
                <input placeholder="000.000.000-00" value={profForm.cpf} maxLength={14} onChange={(e) => setProfForm((p) => ({ ...p, cpf: e.target.value }))} required />
              </label>
              <label>
                Senha provisoria
                <input type="password" value={profForm.senha} onChange={(e) => setProfForm((p) => ({ ...p, senha: e.target.value }))} required />
              </label>
              <div className="full-field">
                <p style={{ marginBottom: "12px", fontWeight: 600 }}>Cursos Atribuidos</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {COURSES.map((curso) => {
                    const selected = profForm.cursos.includes(curso);
                    return (
                      <button
                        key={curso}
                        type="button"
                        onClick={() => toggleCurso(curso)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                          padding: "12px 16px", borderRadius: "var(--radius)", cursor: "pointer",
                          border: selected ? "2px solid var(--primary)" : "1.5px solid var(--line)",
                          background: selected ? "rgba(244,185,31,.12)" : "var(--surface-card)",
                          color: "var(--ink)", fontWeight: selected ? 700 : 500, fontSize: "0.75rem",
                          transition: "all .15s", minWidth: "88px", textAlign: "center",
                        }}
                      >
                        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{COURSE_ABBR[curso] || "?"}</span>
                        <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.2 }}>
                          {curso.length > 14 ? curso.replace(" e ", " &\n") : curso}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={addingProf || profForm.cursos.length === 0}>
                  {addingProf ? "Cadastrando..." : "Finalizar cadastro"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ margin: 0 }}>Docentes Registrados</h3>
                <input
                  placeholder="Filtrar professores..."
                  value={profFilter}
                  onChange={(e) => setProfFilter(e.target.value)}
                  style={{
                    padding: "8px 14px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--line)",
                    background: "var(--surface-card)", fontSize: "0.88rem", minWidth: "220px", outline: "none",
                  }}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nome do professor</th>
                      <th>Email institucional</th>
                      <th>Departamentos</th>
                      <th className="balance-col">Saldo (HC)</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professors.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>Nenhum professor cadastrado.</td></tr>
                    )}
                    {professors
                      .filter((p) => {
                        if (!profFilter) return true;
                        const q = profFilter.toLowerCase();
                        return p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
                      })
                      .map((p) => {
                        const ini = p.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                        return (
                          <tr key={p.id}>
                            <td className="balance-col">
                              <div className="table-name-cell">
                                <div className="table-avatar">
                                  {p.photoUrl ? <img src={p.photoUrl} alt={p.nome} /> : ini}
                                </div>
                                <div className="table-name-meta">
                                  <strong>{p.nome}</strong>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: "var(--primary-strong)", fontWeight: 500 }}>{p.email}</td>
                            <td>
                              <div className="dept-chips">
                                {(p.cursos || []).map((c) => (
                                  <span key={c} className="dept-chip">{c}</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className="coin-balance">
                                <span className="coin-balance-icon">$</span>
                                {(p.saldoMoedas ?? 0).toLocaleString("pt-BR")}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  className="button"
                                  style={{ padding: "5px 12px", fontSize: "0.8rem", background: "none", border: "1.5px solid var(--line)", borderRadius: "var(--radius-sm)" }}
                                  onClick={() => openEditProfessor(p)}
                                  title="Editar professor"
                                >
                                  Editar
                                </button>
                                <button
                                  className="button"
                                  style={{ padding: "5px 12px", fontSize: "0.8rem", background: "none", border: "1.5px solid var(--danger)", color: "var(--danger)", borderRadius: "var(--radius-sm)" }}
                                  onClick={() => handleDeleteProfessor(p)}
                                  title="Remover professor"
                                >
                                  Remover
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {editingProfessor && (
          <div className="modal-backdrop" role="presentation" onClick={() => setEditingProfessor(null)}>
            <section className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Editar docente</p>
                  <h2>{editingProfessor.nome}</h2>
                </div>
                <button className="button button-secondary" type="button" onClick={() => setEditingProfessor(null)}>Fechar</button>
              </div>

              <form className="entity-form professor-form" onSubmit={handleSaveEdit}>
                <label>
                  Nome completo
                  <input value={editForm.nome} onChange={(e) => setEditForm((p) => ({ ...p, nome: e.target.value }))} />
                </label>
                <label>
                  Email institucional
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                </label>
                <label>
                  Nova senha (opcional)
                  <input type="password" value={editForm.senha} onChange={(e) => setEditForm((p) => ({ ...p, senha: e.target.value }))} />
                </label>
                <div className="full-field">
                  <p style={{ marginBottom: "12px", fontWeight: 600 }}>Cursos Atribuidos</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {COURSES.map((curso) => {
                      const selected = editForm.cursos.includes(curso);
                      return (
                        <button
                          key={curso}
                          type="button"
                          onClick={() => toggleEditCurso(curso)}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                            padding: "10px 14px", borderRadius: "var(--radius)", cursor: "pointer",
                            border: selected ? "2px solid var(--primary)" : "1.5px solid var(--line)",
                            background: selected ? "rgba(244,185,31,.12)" : "var(--surface-card)",
                            color: "var(--ink)", fontWeight: selected ? 700 : 500, fontSize: "0.73rem",
                            transition: "all .15s", minWidth: "82px", textAlign: "center",
                          }}
                        >
                          <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{COURSE_ABBR[curso] || "?"}</span>
                          <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.2 }}>
                            {curso.length > 14 ? curso.replace(" e ", " &\n") : curso}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-actions">
                  <button className="button button-primary" type="submit" disabled={savingEdit || editForm.cursos.length === 0}>
                    {savingEdit ? "Salvando..." : "Salvar alteracoes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {activePage === "students" && (() => {
          const totalMoedas = students.reduce((s, st) => s + (st.saldoMoedas || 0), 0);
          const cursosAtivos = Object.keys(studentsByCourse).length;
          const openStudent = students.find((s) => s.id === openStudentAction) ?? null;
          return (
            <section className="professor-panel">
              <div className="enrolled-header">
                <div>
                  <p className="eyebrow">Alunos matriculados</p>
                  <h2 className="enrolled-title">
                    <strong>{students.length} alunos</strong> na instituição
                  </h2>
                </div>
                <div className="enrolled-stats-card">
                  <div className="enrolled-stat">
                    <p className="eyebrow">Total Moedas</p>
                    <strong>{totalMoedas.toLocaleString("pt-BR")} HC</strong>
                  </div>
                  <div className="enrolled-stat-divider" />
                  <div className="enrolled-stat">
                    <p className="eyebrow">Cursos Ativos</p>
                    <strong>{cursosAtivos}</strong>
                  </div>
                </div>
              </div>

              {Object.keys(studentsByCourse).length === 0 && (
                <p className="empty-state">Nenhum aluno cadastrado nesta instituição.</p>
              )}

              {Object.entries(studentsByCourse).map(([curso, list]) => (
                <div key={curso} className="course-group">
                  <div className="course-group-header">
                    <span>{curso} &nbsp;{list.length} aluno(s)</span>
                  </div>
                  <div className="table-wrap students-table-wrap">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th className="th-nome">Nome</th>
                          <th className="balance-col">Saldo</th>
                          <th>Cadastrado em</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((s) => {
                          const ini = s.nome.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                          return (
                            <tr key={s.id}>
                              <td className="balance-col">
                                <div className="table-name-cell">
                                  <div className="table-avatar" style={{ background: avatarColor(s.nome), color: "#fff" }}>
                                    {s.photoUrl ? <img src={s.photoUrl} alt={s.nome} /> : ini}
                                  </div>
                                  <div className="table-name-meta">
                                    <strong>{s.nome}</strong>
                                    <a href={`mailto:${s.email}`} className="student-email-link">{s.email}</a>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="balance-pill">
                                  <span className="balance-dot" />
                                  {(s.saldoMoedas || 0).toLocaleString("pt-BR")} moedas
                                </span>
                              </td>
                              <td className="date-cell">
                                {s.criadoEm ? new Date(s.criadoEm).toLocaleDateString("pt-BR") : "—"}
                              </td>
                              <td>
                                <button
                                  className="row-action-btn"
                                  title="Ações"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                    setOpenStudentAction(openStudentAction === s.id ? null : s.id);
                                  }}
                                >⋮</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {openStudent && (
                <div
                  className="student-action-menu"
                  style={{ top: dropdownPos.top, right: dropdownPos.right }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button onClick={() => {
                    setHighlightStudentId(openStudent.id);
                    setActivePage("overview");
                    setDirTab("students");
                    setOpenStudentAction(null);
                  }}>
                    Ver no diretório
                  </button>
                  <button onClick={() => {
                    navigator.clipboard.writeText(openStudent.email);
                    setOpenStudentAction(null);
                    onToast({ message: "Email copiado!", type: "success" });
                  }}>
                    Copiar email
                  </button>
                </div>
              )}
            </section>
          );
        })()}

        {activePage === "profile" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Dados da instituição</p>
                <h2>Editar perfil</h2>
              </div>
            </div>

            <div className="profile-info-bar">
              <div className="profile-info-item">
                <span className="profile-info-label">Nome</span>
                <span className="profile-info-value">{user.nome}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{user.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Telefone</span>
                <span className="profile-info-value">{user.telefone || "—"}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Endereço</span>
                <span className="profile-info-value">{user.endereco || "—"}</span>
              </div>
            </div>

            <form className="entity-form professor-form" onSubmit={handleSaveProfile}>
              <div className="full-field">
                <div className="photo-upload-wrap">
                  <div className="photo-upload-preview profile-logo-avatar">
                    {profileForm.photoUrl
                      ? <img src={profileForm.photoUrl} alt="Logo" />
                      : (user.photoUrl
                          ? <img src={user.photoUrl} alt="Logo" />
                          : user.nome.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase())}
                    <span className="profile-logo-badge" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: "0.95rem" }}>Logo da instituição</p>
                    <label className="photo-upload-btn profile-upload-btn">
                      {(profileForm.photoUrl || user.photoUrl) ? "Trocar logo" : "Adicionar logo"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
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
                Novo nome <span className="label-optional">(opcional)</span>
                <input
                  placeholder="Digite o novo nome da instituição"
                  value={profileForm.nome}
                  onChange={(e) => setProfileForm((p) => ({ ...p, nome: e.target.value }))}
                />
              </label>
              <label>
                Novo email <span className="label-optional">(opcional)</span>
                <input
                  type="email"
                  placeholder="Digite o novo email da instituição"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                />
              </label>
              <label>
                Telefone <span className="label-optional">(opcional)</span>
                <input
                  placeholder="(00) 0000-0000"
                  value={profileForm.telefone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, telefone: e.target.value }))}
                />
              </label>
              <label>
                Endereço <span className="label-optional">(opcional)</span>
                <input
                  placeholder="Rua, Número, Cidade - UF"
                  value={profileForm.endereco}
                  onChange={(e) => setProfileForm((p) => ({ ...p, endereco: e.target.value }))}
                />
              </label>
              <label className="full-field">
                Nova senha <span className="label-optional">(opcional)</span>
                <div className="profile-pwd-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profileForm.senha}
                    onChange={(e) => setProfileForm((p) => ({ ...p, senha: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="profile-pwd-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Salvando..." : "Salvar alterações"}
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
