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
  const [courses, setCourses] = useState(user.cursos || []);
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
  const [twoFa, setTwoFa] = useState(false);
  const coursesLoadedRef = useRef(false);

  // Load courses once
  useEffect(() => {
    if (!coursesLoadedRef.current && (user.cursos || []).length === 0) {
      professorService.courses().then(setCourses).catch(() => {});
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
        .then(([txs, crs]) => { setTransfers(txs); setCourses(crs); })
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
      professorService.courses().then(setCourses).catch(() => {});
      if (transfers.length === 0) {
        professorService.transfers().then(setTransfers).catch(() => {});
      }
    }
    if (activePage === "settings") {
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

  useEffect(() => {
    if (user.ultimoAviso) {
      onToast({ message: user.ultimoAviso, type: "success" });
    }
  }, [user.ultimoAviso, onToast]);

  // Load dir students when on students tab, courses ready, or filter changes
  useEffect(() => {
    if (activePage !== "students" || courses.length === 0) return;
    setLoadingDir(true);
    const toLoad = (studentFilter && studentFilter !== "all") ? [studentFilter] : courses;
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

  // Dashboard stats
  const totalDistributed = transfers.reduce((s, t) => s + t.quantidade, 0);
  const totalBudget = totalDistributed + user.saldoMoedas;
  const budgetPercent = totalBudget > 0 ? Math.round((totalDistributed / totalBudget) * 100) : 0;
  const activeStudents = new Set(transfers.map((t) => t.studentName)).size;
  const recentActivity = transfers.slice(0, 3);
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

  const distributeBtn = (
    <button
      className="prof-distribute-btn"
      type="button"
      onClick={() => setActivePage("students")}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Distribuir Moedas
    </button>
  );

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="PROFESSOR"
        user={user}
        subtitle="Portal do Professor"
        footerCta={distributeBtn}
        tabs={[
          { key: "dashboard", label: "Painel" },
          { key: "wallet", label: "Carteira" },
          { key: "students", label: "Alunos" },
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
            {(activePage === "students" || activePage === "wallet" || activePage === "dashboard") && (
              <button
                className="prof-topbar-distribute-btn"
                type="button"
                onClick={() => { setActivePage("students"); onToast({ message: "Escolha um aluno e clique em Distribuir.", type: "success" }); }}
              >
                {DISTRIBUTE_ICON}
                Distribuir Moedas
              </button>
            )}
            <button className="prof-topbar-avatar" type="button" onClick={() => setActivePage("settings")} aria-label="Abrir perfil">
              {user.photoUrl
                ? <img src={user.photoUrl} alt={user.nome} />
                : userInitials}
            </button>
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
                    return (
                      <div className="activity-item" key={t.id}>
                        <div className="activity-avatar">{ini}</div>
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
                              <div className="table-avatar wallet-dist-avatar">{initials(t.studentName || "")}</div>
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
                                <div className="table-avatar">{initials(t.studentName || "")}</div>
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
                    <div className="settings-divider" style={{ margin: "20px 0" }} />
                    <div className="settings-2fa-row">
                      <div className="settings-2fa-info">
                        <div className="settings-2fa-title-row">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          <strong>Autenticação de Dois Fatores</strong>
                        </div>
                        <p>Adicione uma camada extra de segurança à sua conta.</p>
                      </div>
                      <button className={`settings-toggle${twoFa ? " is-on" : ""}`} type="button"
                        onClick={() => setTwoFa((v) => !v)} aria-label="Ativar autenticação de dois fatores" />
                    </div>
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

export default ProfessorPage;
