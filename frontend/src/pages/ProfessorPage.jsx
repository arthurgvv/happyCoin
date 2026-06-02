import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { professorService } from "../services/professorService.js";

const COURSES = [
  "Administracao", "Arquitetura e Urbanismo", "Ciencia da Computacao",
  "Direito", "Engenharia Civil", "Engenharia de Software",
  "Medicina", "Psicologia", "Publicidade e Propaganda", "Sistemas de Informacao",
];

const emptyProfile = { nome: "", email: "", senha: "", cursos: [], photoUrl: null, especialidade: "", bio: "" };

function timeAgo(dateString) {
  if (!dateString) return "—";
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Agora";
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  return `${days}d atrás`;
}

function initials(name) {
  return (name || "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function uniqueList(values = []) {
  return [...new Set(values.filter(Boolean))];
}

const COIN_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
  </svg>
);

const COIN_ICON_SM = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
  </svg>
);

const PEOPLE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TREND_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const DISTRIBUTE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const DOWNLOAD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FILTER_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="12" y2="18" />
  </svg>
);

function ProfessorPage({ user, onLogout, onUpdateUser, onToast }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [courses, setCourses] = useState(uniqueList(user.cursos || []));
  const [transfers, setTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);

  // Students directory state
  const [studentFilter, setStudentFilter] = useState("all");
  const [dirStudents, setDirStudents] = useState([]);
  const [loadingDir, setLoadingDir] = useState(false);
  const [dirReloadToken, setDirReloadToken] = useState(0);
  const [distributeTarget, setDistributeTarget] = useState(null);
  const [distForm, setDistForm] = useState({ quantidade: "", motivo: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);
  const coursesLoadedRef = useRef(false);

  // Load courses once
  useEffect(() => {
    if (!coursesLoadedRef.current && (user.cursos || []).length === 0) {
      professorService.courses().then((crs) => setCourses(uniqueList(crs))).catch(() => {});
    }
    coursesLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (activePage === "dashboard") {
      setLoadingTransfers(true);
      Promise.all([
        professorService.transfers(),
        professorService.courses(),
      ])
        .then(([txs, crs]) => { setTransfers(txs); setCourses(uniqueList(crs)); })
        .catch(() => {})
        .finally(() => setLoadingTransfers(false));
    }
    if (activePage === "wallet") {
      setLoadingTransfers(true);
      professorService.transfers()
        .then(setTransfers)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingTransfers(false));
    }
    if (activePage === "students") {
      professorService.courses().then((crs) => setCourses(uniqueList(crs))).catch(() => {});
      if (transfers.length === 0) {
        professorService.transfers().then(setTransfers).catch(() => {});
      }
    }
    if (activePage === "settings") {
      setProfileForm(emptyProfile);
      professorService.me()
        .then((prof) => {
          if (prof.cursos && prof.cursos.length > 0) {
            setProfileForm((prev) => ({ ...prev, cursos: uniqueList(prof.cursos) }));
          }
        })
        .catch(() => {
          if (user.cursos && user.cursos.length > 0) {
            setProfileForm((prev) => ({ ...prev, cursos: uniqueList(user.cursos) }));
          }
        });
    }
  }, [activePage]);

  useEffect(() => {
    if (user.ultimoAviso) {
      onToast({ message: user.ultimoAviso, type: "success" });
    }
  }, [user.ultimoAviso, onToast]);

  // Load directory students to render cards and to enrich transfer avatars.
  useEffect(() => {
    if (!["dashboard", "wallet", "students"].includes(activePage) || courses.length === 0) return;
    setLoadingDir(true);
    const toLoad = (activePage === "students" && studentFilter && studentFilter !== "all") ? [studentFilter] : courses;
    Promise.all(
      toLoad.map((c) =>
        professorService.studentsByCourse(c)
          .then((ss) => ss.map((s) => ({ ...s, courseName: c })))
          .catch(() => [])
      )
    ).then((results) => {
      const seen = new Set();
      const merged = [];
      results.flat().forEach((s) => {
        if (!seen.has(s.id)) { seen.add(s.id); merged.push(s); }
      });
      setDirStudents(merged);
    }).finally(() => setLoadingDir(false));
  }, [activePage, courses, studentFilter, dirReloadToken]);

  async function handleDistribute(event) {
    event.preventDefault();
    if (!distributeTarget) return;
    setSubmitting(true);
    try {
      const professor = await professorService.transfer({
        studentId: distributeTarget.id,
        quantidade: Number(distForm.quantidade),
        motivo: distForm.motivo,
      });
      onUpdateUser(professor);
      setDirReloadToken((v) => v + 1);
      setDistForm({ quantidade: "", motivo: "" });
      setDistributeTarget(null);
      // Refresh transfers
      professorService.transfers().then(setTransfers).catch(() => {});
      onToast({ message: "Moedas enviadas com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function exportStatement() {
    const rows = [
      ["Aluno", "Curso", "Data", "Motivo", "Valor"],
      ...transfers.map((t) => [
        t.studentName || "",
        t.studentCourse || "",
        t.criadoEm ? new Date(t.criadoEm).toLocaleString("pt-BR") : "",
        t.motivo || "",
        `${t.quantidade} HC`,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "extrato-happycoins.csv";
    link.click();
    URL.revokeObjectURL(url);
    onToast({ message: "Extrato exportado com sucesso.", type: "success" });
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
      if (profileForm.photoUrl) payload.photoUrl = profileForm.photoUrl;

      const updated = await professorService.update(payload);
      onUpdateUser(updated);
      setCourses(uniqueList(updated.cursos || courses));
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

  // Dashboard stats
  const totalDistributed = transfers.reduce((s, t) => s + t.quantidade, 0);
  const totalBudget = totalDistributed + user.saldoMoedas;
  const budgetPercent = totalBudget > 0 ? Math.round((totalDistributed / totalBudget) * 100) : 0;
  const activeStudents = new Set(transfers.map((t) => t.studentName)).size;
  const recentActivity = transfers.slice(0, 3);
  const studentPhotoByKey = useMemo(() => {
    const map = new Map();
    dirStudents.forEach((student) => {
      if (!student.photoUrl) return;
      if (student.id) map.set(student.id, student.photoUrl);
      if (student.email) map.set(student.email, student.photoUrl);
    });
    return map;
  }, [dirStudents]);
  const transferStudentPhoto = (transfer) =>
    transfer.studentPhotoUrl
    || studentPhotoByKey.get(transfer.studentId)
    || studentPhotoByKey.get(transfer.studentEmail)
    || null;
  const filteredDirStudents = dirStudents.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return [s.nome, s.email, s.courseName, s.curso].some((value) => (value || "").toLowerCase().includes(q));
  });
  const filteredTransfers = transfers.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || activePage !== "wallet") return true;
    return [t.studentName, t.studentEmail, t.studentCourse, t.motivo].some((value) => (value || "").toLowerCase().includes(q));
  });
  const firstName = (user.nome || "Professor").split(" ")[0];
  const userInitials = initials(user.nome);

  return (
    <div className="app-shell professor-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="PROFESSOR"
        user={user}
        subtitle="Portal do Professor"
        tabs={[
          { key: "dashboard", label: "Painel" },
          { key: "wallet", label: "Carteira" },
          { key: "students", label: "Alunos" },
          { key: "emails", label: "E-mails" },
          { key: "settings", label: "Configurações" },
        ]}
      />

      <div className="prof-layout">
        {/* Top bar */}
        <header className="prof-topbar">
          <span className="prof-topbar-title">
            {activePage === "dashboard" ? "Painel do Professor"
              : activePage === "wallet" ? "Carteira"
              : activePage === "students" ? "Diretório de Alunos"
              : activePage === "emails" ? "E-mails"
              : "Configurações"}
          </span>
          {(activePage === "students" || activePage === "wallet") && (
            <div className="prof-search">
              <input
                placeholder={activePage === "students" ? "Buscar alunos..." : "Buscar transações..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <div className="prof-topbar-icons">
            {activePage !== "settings" && (
              <button className="prof-topbar-avatar" type="button" onClick={() => setActivePage("settings")} aria-label="Abrir perfil">
                {user.photoUrl
                  ? <img src={user.photoUrl} alt={user.nome} />
                  : userInitials}
              </button>
            )}
          </div>
        </header>

        <main className="prof-main">

          {/* ── DASHBOARD ── */}
          {activePage === "dashboard" && (
            <>
              <div className="prof-greeting">
                <h2>Olá, Professor {firstName}</h2>
                <p>Aqui está a economia de moedas da sua turma hoje.</p>
              </div>

              <div className="stat-cards prof-stat-cards">
                <div className="stat-card prof-stat-card prof-stat-card-gold">
                  <div className="stat-card-icon stat-card-icon-coin">{COIN_ICON}</div>
                  <p className="eyebrow" style={{ marginTop: 16 }}>Total de Moedas Distribuídas</p>
                  <span className="stat-value">{totalDistributed.toLocaleString("pt-BR")}</span>
                </div>
                <div className="stat-card prof-stat-card prof-stat-card-blue">
                  <div className="stat-card-icon stat-card-icon-people">{PEOPLE_ICON}</div>
                  <p className="eyebrow" style={{ marginTop: 16 }}>Alunos Ativos</p>
                  <span className="stat-value">{activeStudents}</span>
                </div>
                <div className="stat-card prof-stat-card prof-stat-card-green">
                  <div className="stat-card-icon stat-card-icon-trend">{TREND_ICON}</div>
                  <p className="eyebrow" style={{ marginTop: 16 }}>Média Mensal</p>
                  <span className="stat-value">
                    {totalDistributed > 0
                      ? <>{totalDistributed}<span style={{ fontSize: "1.1rem", fontWeight: 700, marginLeft: 4 }}>/mês</span></>
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="prof-dashboard-body">
                {/* Recent Activity */}
                <div className="prof-activity">
                  <div className="prof-activity-header">
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Atividade Recente</h3>
                    <button
                      className="button button-ghost"
                      type="button"
                      style={{ fontSize: "0.8rem", minHeight: 32, padding: "0 12px" }}
                      onClick={() => setActivePage("wallet")}
                    >
                      Ver Todos os Registros
                    </button>
                  </div>

                  {loadingTransfers && (
                    <p style={{ color: "var(--muted)", padding: "24px 0", textAlign: "center" }}>Carregando...</p>
                  )}

                  {!loadingTransfers && recentActivity.length === 0 && (
                    <p style={{ color: "var(--muted)", padding: "24px 0", textAlign: "center", fontSize: "0.88rem" }}>
                      Sem atividade ainda. Comece distribuindo moedas para os alunos.
                    </p>
                  )}

                  {recentActivity.map((t) => {
                    const ini = initials(t.studentName || "");
                    const photoUrl = transferStudentPhoto(t);
                    return (
                      <div className="activity-item" key={t.id}>
                        <div className="activity-avatar">
                          {photoUrl ? <img src={photoUrl} alt={t.studentName || "Aluno"} /> : ini}
                        </div>
                        <div className="activity-info">
                          <p className="activity-name">{t.studentName}</p>
                          <p className="activity-desc">{t.motivo}</p>
                        </div>
                        <div className="activity-meta">
                          <span className="activity-badge">HC {t.quantidade}</span>
                          <span className="activity-time">{timeAgo(t.criadoEm)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="prof-quick-actions">
                  <h3 className="quick-actions-title">Ações Rápidas</h3>

                  <button
                    className="quick-action-card is-primary"
                    type="button"
                    onClick={() => setActivePage("students")}
                  >
                    <div className="quick-action-icon">{DISTRIBUTE_ICON}</div>
                    <div className="quick-action-body">
                      <p className="quick-action-name">Distribuir moedas</p>
                      <p className="quick-action-desc">Escolher aluno e registrar reconhecimento</p>
                    </div>
                  </button>

                  <button
                    className="quick-action-card"
                    type="button"
                    onClick={exportStatement}
                  >
                    <div className="quick-action-icon">{DOWNLOAD_ICON}</div>
                    <div className="quick-action-body">
                      <p className="quick-action-name">Baixar Relatório</p>
                      <p className="quick-action-desc">Exportar CSV de distribuição mensal</p>
                    </div>
                  </button>

                  <div className="budget-card">
                    <p className="budget-label">Utilização do Orçamento</p>
                    <div className="budget-bar-track">
                      <div className="budget-bar-fill" style={{ width: `${budgetPercent}%` }} />
                    </div>
                    <div className="budget-bar-info">
                      <span>{totalDistributed.toLocaleString("pt-BR")} HC Gastos</span>
                      <span>{totalBudget.toLocaleString("pt-BR")} HC Limite</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── WALLET ── */}
          {activePage === "wallet" && (
            <>
              <div className="wallet-top-grid">
                {/* Balance card */}
                <div className="wallet-balance-card wallet-balance-card-gold">
                  <div className="wallet-balance-content">
                    <p className="eyebrow" style={{ margin: "0 0 16px" }}>Saldo Disponível</p>
                    <div className="wallet-balance-amount">
                      <span className="wallet-balance-number">{(user.saldoMoedas || 0).toLocaleString("pt-BR")}</span>
                      <span className="wallet-balance-unit">HC</span>
                    </div>
                    <p className="wallet-balance-note">Próxima recarga conforme calendário acadêmico</p>
                  </div>
                  <div className="wallet-balance-coin-icon" aria-hidden="true">
                    <svg viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="5" />
                      <text x="50" y="68" textAnchor="middle" fontSize="48" fontWeight="bold" fill="currentColor">$</text>
                    </svg>
                  </div>
                  <div className="wallet-balance-actions">
                    <button
                      className="button wallet-request-btn"
                      type="button"
                      onClick={() => setActivePage("students")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Distribuir Moedas
                    </button>
                    <button className="button button-secondary" type="button" onClick={exportStatement}>Exportar Extrato</button>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="wallet-stat-stack">
                  <div className="wallet-stat-card wallet-stat-card-blue">
                    <div className="wallet-stat-top">
                      <div className="wallet-stat-icon wallet-stat-icon-trend">{TREND_ICON}</div>
                      <span className="wallet-stat-badge">
                        {totalDistributed > 0 ? "HC distribuídos" : "Sem histórico"}
                      </span>
                    </div>
                    <p className="wallet-stat-label">Total Distribuído</p>
                    <p className="wallet-stat-value">{totalDistributed.toLocaleString("pt-BR")} HC</p>
                  </div>
                  <div className="wallet-stat-card wallet-stat-card-green">
                    <div className="wallet-stat-top">
                      <div className="wallet-stat-icon wallet-stat-icon-people">{PEOPLE_ICON}</div>
                      <span className="wallet-stat-count">{activeStudents} Alunos</span>
                    </div>
                    <p className="wallet-stat-label">Média por Aluno</p>
                    <p className="wallet-stat-value">
                      {activeStudents > 0 ? Math.round(totalDistributed / activeStudents).toLocaleString("pt-BR") : 0} HC
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Distributions */}
              <div className="wallet-distributions">
                <div className="wallet-dist-header">
                  <h3>Distribuições Recentes</h3>
                  <button className="prof-topbar-icon-btn" type="button" aria-label="Filtrar" onClick={() => setSearchTerm("")}>
                    {FILTER_ICON}
                  </button>
                </div>
                {loadingTransfers && (
                  <p style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>Carregando...</p>
                )}
                {!loadingTransfers && filteredTransfers.length === 0 && (
                  <p style={{ textAlign: "center", color: "var(--muted)", padding: "32px", fontSize: "0.88rem" }}>
                    Nenhuma transferência realizada ainda.
                  </p>
                )}
                {!loadingTransfers && filteredTransfers.length > 0 && (
                  <table className="wallet-dist-table">
                    <thead>
                      <tr>
                        <th>ALUNO</th>
                        <th>DATA</th>
                        <th>MOTIVO</th>
                        <th style={{ textAlign: "right" }}>VALOR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransfers.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <div className="table-name-cell">
                              <div className="table-avatar wallet-dist-avatar">
                                {transferStudentPhoto(t) ? <img src={transferStudentPhoto(t)} alt={t.studentName || "Aluno"} /> : initials(t.studentName || "")}
                              </div>
                              <div className="table-name-meta">
                                <strong>{t.studentName}</strong>
                                <span>{t.studentCourse || "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="date-cell">
                            {t.criadoEm
                              ? new Date(t.criadoEm).toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "numeric" })
                              : "—"}
                          </td>
                          <td><span className="wallet-reason-chip">{t.motivo}</span></td>
                          <td style={{ textAlign: "right" }}>
                            <span className="wallet-dist-amount">+{t.quantidade} HC</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── STUDENTS (diretório) ── */}
          {activePage === "students" && (
            <div className="student-dir">
              {/* Header */}
              <div className="student-dir-header">
                <h2 style={{ margin: 0 }}>Diretório de Alunos</h2>
                <p>Gerencie o desempenho e recompense a excelência acadêmica.</p>
              </div>

              {/* Filter tabs */}
              <div className="student-dir-filters">
                <button
                  className={`sdf-tab${studentFilter === "all" ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setStudentFilter("all")}
                >
                  Todas as Turmas
                </button>
                {courses.map((c) => (
                  <button
                    key={c}
                    className={`sdf-tab${studentFilter === c ? " is-active" : ""}`}
                    type="button"
                    onClick={() => setStudentFilter(c)}
                  >
                    {c}
                  </button>
                ))}
                <button className="sdf-tab sdf-tab-filter" type="button" onClick={() => setSearchTerm("")}>
                  {FILTER_ICON} Filtros
                </button>
              </div>

              {/* Carousel */}
              {loadingDir && (
                <p style={{ color: "var(--muted)", padding: "24px 0" }}>Carregando alunos...</p>
              )}

              {!loadingDir && filteredDirStudents.length === 0 && (
                <p style={{ color: "var(--muted)", padding: "24px 0" }}>Nenhum aluno encontrado.</p>
              )}

              {!loadingDir && filteredDirStudents.length > 0 && (
                <div className="student-carousel">
                  {filteredDirStudents.map((s) => (
                    <div className="student-card-dir" key={s.id}>
                      <div className="scd-top">
                        <div className="scd-avatar-wrap">
                          <div className="scd-avatar">
                            {s.photoUrl ? <img src={s.photoUrl} alt={s.nome} /> : initials(s.nome)}
                          </div>
                          <span className="scd-online-dot" />
                        </div>
                        <div className="scd-meta">
                          <span className="scd-name">{s.nome}</span>
                          <span className="scd-hc">
                            {COIN_ICON_SM}
                            {(s.saldoMoedas || 0).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <div className="scd-class-chip">
                        {s.courseName || s.curso || s.instituicao || "—"}
                      </div>
                      <div className="scd-actions">
                        <button
                          className="scd-distribute-btn"
                          type="button"
                          onClick={() => { setDistributeTarget(s); setDistForm({ quantidade: "", motivo: "" }); }}
                        >
                          + Distribuir
                        </button>
                        <button
                          className="scd-more-btn"
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(s.email || "");
                            onToast({ message: "Email do aluno copiado.", type: "success" });
                          }}
                        >
                          Email
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Distribution Activity */}
              <div className="sda-section">
                <div className="sda-header">
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Atividade Recente de Distribuição</h3>
                  <button
                    className="button button-ghost"
                    type="button"
                    style={{ fontSize: "0.8rem", minHeight: 32, padding: "0 12px" }}
                    onClick={() => setActivePage("wallet")}
                  >
                    Ver Histórico
                  </button>
                </div>
                {transfers.length === 0 ? (
                  <p style={{ color: "var(--muted)", padding: "24px", textAlign: "center", fontSize: "0.88rem" }}>Nenhuma distribuição realizada ainda.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Aluno</th>
                          <th>Curso</th>
                          <th>Ação</th>
                          <th>Valor</th>
                          <th>Data</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.slice(0, 5).map((t) => (
                          <tr key={t.id}>
                            <td>
                              <div className="table-name-cell">
                                <div className="table-avatar">
                                  {transferStudentPhoto(t) ? <img src={transferStudentPhoto(t)} alt={t.studentName || "Aluno"} /> : initials(t.studentName || "")}
                                </div>
                                <span>{t.studentName}</span>
                              </div>
                            </td>
                            <td><span className="scd-class-chip">{t.studentCourse || "—"}</span></td>
                            <td>{t.motivo}</td>
                            <td>
                              <span className="sda-amount">
                                {COIN_ICON_SM} +{t.quantidade}
                              </span>
                            </td>
                            <td style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{timeAgo(t.criadoEm)}</td>
                            <td><span className="sda-status-confirmed">Confirmado</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

                    {/* ── EMAIL ── */}
          {activePage === "emails" && (
            <EmailComposeSection professor={user} />
          )}

          {/* ── SETTINGS ── */}
          {activePage === "settings" && (
            <>
              <div className="settings-page-header">
                <h2>Configurações de Perfil do Professor</h2>
                <p>Gerencie sua identidade acadêmica e preferências de segurança.</p>
              </div>
              <div className="settings-layout">
                <div className="settings-left">
                  <div className="settings-profile-card">
                    <div className="settings-profile-photo-wrap">
                      <div className="settings-profile-photo">
                        {profileForm.photoUrl ? <img src={profileForm.photoUrl} alt="Foto" />
                          : user.photoUrl ? <img src={user.photoUrl} alt="Foto" />
                          : userInitials}
                      </div>
                      <label className="settings-photo-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                        </svg>
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const r = new FileReader(); r.onload = () => setProfileForm((p) => ({ ...p, photoUrl: r.result })); r.readAsDataURL(file);
                        }} />
                      </label>
                    </div>
                    <h3 className="settings-profile-name">{user.nome}</h3>
                    <p className="settings-profile-role">PROFESSOR SÊNIOR</p>
                    <label className="button settings-update-photo-btn">
                      Atualizar Foto
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const r = new FileReader(); r.onload = () => setProfileForm((p) => ({ ...p, photoUrl: r.result })); r.readAsDataURL(file);
                      }} />
                    </label>
                    <button className="button settings-remove-photo-btn" type="button"
                      onClick={() => setProfileForm((p) => ({ ...p, photoUrl: null }))}>
                      Remover
                    </button>
                  </div>

                  <div className="settings-creds-card">
                    <div className="settings-creds-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
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
                    <form className="settings-form" onSubmit={handleSaveProfile}>
                      <div className="settings-form-row">
                        <div className="settings-form-field">
                          <label className="settings-label">Nome Completo</label>
                          <input className="settings-input" value={profileForm.nome} placeholder={user.nome}
                            onChange={(e) => setProfileForm((p) => ({ ...p, nome: e.target.value }))} />
                        </div>
                        <div className="settings-form-field">
                          <label className="settings-label">Endereço de Email</label>
                          <input className="settings-input" type="email" value={profileForm.email} placeholder={user.email}
                            onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
                        </div>
                      </div>
                      <div className="settings-form-row">
                        <div className="settings-form-field">
                          <label className="settings-label">Especialidade</label>
                          <input className="settings-input" value={profileForm.especialidade} placeholder="Ex: Economia Comportamental"
                            onChange={(e) => setProfileForm((p) => ({ ...p, especialidade: e.target.value }))} />
                        </div>
                        <div className="settings-form-field">
                          <label className="settings-label">Departamento</label>
                          <div className="settings-course-list" role="group" aria-label="Departamentos do professor">
                            {COURSES.map((curso) => {
                              const selected = profileForm.cursos.includes(curso);
                              return (
                                <button
                                  key={curso}
                                  type="button"
                                  className={`settings-course-chip ${selected ? "is-selected" : ""}`}
                                  onClick={() => toggleCurso(curso)}
                                  aria-pressed={selected}
                                >
                                  <span className="settings-course-check">{selected ? "OK" : "+"}</span>
                                  {curso}
                                </button>
                              );
                            })}
                          </div>
                          <span className="settings-field-hint">Selecione um ou mais departamentos vinculados ao seu perfil.</span>
                        </div>
                      </div>
                      <div className="settings-form-field">
                        <label className="settings-label">Bio</label>
                        <textarea className="settings-input" rows={4} value={profileForm.bio}
                          placeholder="Descreva sua área de atuação e metodologia..."
                          onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))} />
                      </div>
                      <div className="settings-divider" />
                      <div className="settings-form-actions">
                        <button className="button button-secondary" type="button" onClick={() => setProfileForm(emptyProfile)}>Descartar</button>
                        <button className="button settings-save-btn" type="submit" disabled={savingProfile}>
                          {savingProfile ? "Salvando..." : "Salvar Alterações"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="settings-section-card">
                    <h2>Segurança e Senha</h2>
                    <p className="settings-security-desc">
                      Atualize sua senha para manter suas distribuições HappyCoin seguras.
                      Recomendamos uma senha única com pelo menos 12 caracteres.
                    </p>
                    <button className="button button-secondary settings-pwd-btn" type="button"
                      onClick={() => setShowPwdChange((v) => !v)}>
                      Alterar Senha
                    </button>
                    {showPwdChange && (
                      <form onSubmit={handleSaveProfile} style={{ marginTop: 16 }}>
                        <div className="settings-form-field">
                          <label className="settings-label">Nova Senha</label>
                          <input className="settings-input" type="password" value={profileForm.senha} placeholder="Mínimo 12 caracteres"
                            onChange={(e) => setProfileForm((p) => ({ ...p, senha: e.target.value }))} />
                        </div>
                        <div className="settings-form-actions" style={{ marginTop: 12 }}>
                          <button className="button settings-save-btn" type="submit" disabled={savingProfile}>
                            {savingProfile ? "Salvando..." : "Confirmar Nova Senha"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Distribute modal */}
      {distributeTarget && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDistributeTarget(null)}>
          <section className="modal-card" style={{ maxWidth: 480 }} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Distribuir moedas</p>
                <h2>{distributeTarget.nome}</h2>
              </div>
              <button className="button button-secondary" type="button" onClick={() => setDistributeTarget(null)}>Fechar</button>
            </div>
            <form className="entity-form professor-form" onSubmit={handleDistribute}>
              <label>
                Quantidade
                <input
                  type="number"
                  min="1"
                  max={user.saldoMoedas}
                  value={distForm.quantidade}
                  onChange={(e) => setDistForm((f) => ({ ...f, quantidade: e.target.value }))}
                  required
                />
              </label>
              <label className="full-field">
                Motivo do reconhecimento
                <textarea
                  value={distForm.motivo}
                  onChange={(e) => setDistForm((f) => ({ ...f, motivo: e.target.value }))}
                  required
                />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar moedas"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function EmailComposeSection({ professor }) {
  const [view, setView] = useState("inbox"); // "inbox" | "sent" | "compose" | "read"
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [readSource, setReadSource] = useState("inbox"); // which list we came from
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function loadInbox() {
    professorService.inbox().then(setInbox).catch(() => {});
  }
  function loadSent() {
    professorService.sent().then(setSent).catch(() => {});
  }

  useEffect(() => { loadInbox(); loadSent(); }, []);
  useEffect(() => { professorService.courses().then(setCourses).catch(() => {}); }, []);
  useEffect(() => {
    if (!selectedCourse) { setStudents([]); setStudentId(""); return; }
    professorService.studentsByCourse(selectedCourse).then((list) => { setStudents(list); setStudentId(""); }).catch(() => setStudents([]));
  }, [selectedCourse]);

  function openMessage(m, source) {
    setSelected(m);
    setReadSource(source);
    setView("read");
    if (source === "inbox" && !m.lido) {
      professorService.markRead(m.id).then(loadInbox).catch(() => {});
    }
  }

  function startReply(m) {
    setStudentId(m.fromId);
    setSubject(m.subject.startsWith("Re:") ? m.subject : `Re: ${m.subject}`);
    setBody("");
    setSelectedCourse("");
    setView("compose");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId) return;
    setSending(true);
    setFeedback(null);
    try {
      await professorService.sendEmail({ studentId, subject, body, replyToId: selected?.id ?? null });
      setFeedback({ type: "success", message: "E-mail enviado com sucesso!" });
      setSubject(""); setBody(""); setStudentId(""); setSelected(null);
      loadInbox(); loadSent();
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Falha ao enviar e-mail." });
    } finally {
      setSending(false);
    }
  }

  const unread = inbox.filter((m) => !m.lido).length;
  const inboxActive = view === "inbox" || (view === "read" && readSource === "inbox");
  const sentActive  = view === "sent"  || (view === "read" && readSource === "sent");

  return (
    <>
      <div className="settings-page-header">
        <h2>E-mails</h2>
        <p>Gerencie sua caixa de mensagens com os alunos.</p>
      </div>

      <div className="mail-tabs">
        <button type="button" className={`mail-tab${inboxActive ? " is-active" : ""}`} onClick={() => setView("inbox")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
          Recebidas
          {unread > 0 && <span className="mail-tab-badge">{unread}</span>}
        </button>
        <button type="button" className={`mail-tab${sentActive ? " is-active" : ""}`} onClick={() => setView("sent")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          Enviadas
        </button>
        <button type="button" className={`mail-tab${view === "compose" ? " is-active-gold" : ""}`} onClick={() => { setView("compose"); setSelected(null); setFeedback(null); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Nova Mensagem
        </button>
      </div>

      {view === "inbox" && (
        <div className="mail-list-card">
          <EmailMessageList messages={inbox} onSelect={(m) => openMessage(m, "inbox")} selectedId={selected?.id} emptyText="Sua caixa de entrada está vazia." showFrom />
        </div>
      )}

      {view === "sent" && (
        <div className="mail-list-card">
          <EmailMessageList messages={sent} onSelect={(m) => openMessage(m, "sent")} selectedId={selected?.id} emptyText="Nenhuma mensagem enviada ainda." showFrom={false} />
        </div>
      )}

      {view === "read" && selected && (
        <div className="mail-read-card">
          <div className="mail-read-header">
            <button type="button" className="mail-read-back" onClick={() => setView(readSource)}>← Voltar</button>
            <h3 className="mail-read-subject">{selected.subject}</h3>
            <p className="mail-read-meta">
              <strong>{readSource === "inbox" ? "De:" : "Para:"}</strong>{" "}
              {readSource === "inbox" ? selected.fromNome : selected.toNome}
              {" · "}{new Date(selected.criadoEm).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="mail-read-body">
            <p className="mail-read-text">{selected.body}</p>
            {readSource === "inbox" && (
              <div className="mail-read-actions">
                <button className="button button-primary" type="button" onClick={() => startReply(selected)}>Responder</button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === "compose" && (
        <div className="mail-compose-card">
          <div className="mail-compose-header">
            <div className="mail-compose-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            </div>
            <h3>{selected ? "Responder mensagem" : "Nova mensagem"}</h3>
          </div>
          <form onSubmit={handleSubmit} className="mail-compose-form">
            {!selected && (
              <div className="settings-form-row">
                <div className="settings-form-field">
                  <label className="settings-label">Curso</label>
                  <select className="settings-input" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required={!studentId}>
                    <option value="">Selecione um curso</option>
                    {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="settings-form-field">
                  <label className="settings-label">Destinatário</label>
                  <select className="settings-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} required disabled={!selectedCourse && !studentId}>
                    <option value="">{!selectedCourse ? "Selecione um curso primeiro" : students.length === 0 ? "Nenhum aluno" : "Selecione um aluno"}</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.nome} — {s.email}</option>)}
                  </select>
                </div>
              </div>
            )}
            {selected && (
              <div className="mail-reply-banner">
                Respondendo a <strong>{selected.fromNome}</strong>
              </div>
            )}
            <div className="settings-form-field">
              <label className="settings-label">Assunto</label>
              <input className="settings-input" type="text" placeholder="Assunto da mensagem" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} />
            </div>
            <div className="settings-form-field">
              <label className="settings-label">Mensagem</label>
              <textarea className="settings-input" placeholder="Escreva sua mensagem..." value={body} onChange={(e) => setBody(e.target.value)} required rows={7} maxLength={2000} style={{ minHeight: "150px", resize: "vertical" }} />
            </div>
            {feedback && (
              <p className={feedback.type === "success" ? "mail-feedback-ok" : "mail-feedback-err"}>{feedback.message}</p>
            )}
            <div className="mail-compose-actions">
              <button className="button button-primary" type="submit" disabled={sending}>{sending ? "Enviando..." : "Enviar mensagem"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function EmailMessageList({ messages, onSelect, selectedId, emptyText, showFrom }) {
  if (messages.length === 0) {
    return (
      <div className="mail-empty">
        <div className="mail-empty-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <p>{emptyText}</p>
      </div>
    );
  }
  return (
    <ul className="mail-list">
      {messages.map((m) => {
        const displayName = showFrom ? m.fromNome : m.toNome;
        const isUnread = showFrom && !m.lido;
        const isSelected = selectedId === m.id;
        return (
          <li key={m.id} onClick={() => onSelect(m)} className={`mail-item${isUnread ? " is-unread" : ""}${isSelected ? " is-selected" : ""}`}>
            <div className="mail-avatar">{initials(displayName)}</div>
            <div className="mail-item-body">
              <div className="mail-item-top">
                <span className="mail-item-name">{displayName}</span>
                <span className="mail-item-time">{timeAgo(m.criadoEm)}</span>
              </div>
              <div className="mail-item-subject">{m.subject}</div>
            </div>
            {isUnread && <div className="mail-unread-dot" />}
          </li>
        );
      })}
    </ul>
  );
}

export default ProfessorPage;
