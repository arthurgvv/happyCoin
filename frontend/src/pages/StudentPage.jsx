import { useEffect, useMemo, useState } from "react";
import AccountForm from "../components/AccountForm.jsx";
import Navbar from "../components/Navbar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import QRCodeModal from "../components/QRCodeModal.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { productService } from "../services/productService.js";
import { studentService } from "../services/studentService.js";

const COIN_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
  </svg>
);

const BAG_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h12l1 14H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

const HISTORY_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3 2" />
  </svg>
);

function StudentPage({ user, onLogout, onUpdateUser, onToast }) {
  const [activePage, setActivePage] = useState("products");
  const [purchasingId, setPurchasingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { products } = useProducts();
  const [transfers, setTransfers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [qrPurchase, setQrPurchase] = useState(null);
  const [unreadEmails, setUnreadEmails] = useState(0);

  useEffect(() => {
    studentService.me()
      .then(onUpdateUser)
      .catch(() => {});
    studentService.inbox().then((msgs) => setUnreadEmails(msgs.filter((m) => !m.lido).length)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user.ultimoAviso) {
      onToast({ message: user.ultimoAviso, type: "success" });
    }
  }, [user.ultimoAviso, onToast]);

  useEffect(() => {
    setSearchTerm("");
  }, [activePage]);

  useEffect(() => {
    if (activePage === "historico") {
      setLoadingTransfers(true);
      studentService.transfers()
        .then(setTransfers)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingTransfers(false));
    }
  }, [activePage, onToast]);

  useEffect(() => {
    if (activePage === "purchases" || activePage === "historico") {
      setLoadingPurchases(true);
      studentService.purchases()
        .then(setPurchases)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingPurchases(false));
    }
  }, [activePage, onToast]);

  async function handlePurchase(product) {
    if (user.saldoMoedas < product.custoMoedas) {
      onToast({ message: "Saldo insuficiente para comprar este produto.", type: "error" });
      return;
    }
    setPurchasingId(product.id);
    try {
      const nextUser = await productService.purchase(product.id);
      onUpdateUser(nextUser);
      onToast({ message: "Compra realizada com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setPurchasingId(null);
    }
  }

  async function handleShowPurchaseQr(purchaseId) {
    if (!purchaseId) return;
    let availablePurchases = purchases;
    if (availablePurchases.length === 0) {
      availablePurchases = await studentService.purchases();
      setPurchases(availablePurchases);
    }
    const purchase = availablePurchases.find((item) => item.id === purchaseId);
    if (purchase) {
      setQrPurchase(purchase);
    } else {
      onToast({ message: "Cupom nao encontrado em suas compras.", type: "error" });
    }
  }

  const filteredProducts = useMemo(() => {
    return filterBySearch(products, searchTerm, ["nome", "descricao", "empresaParceira"]);
  }, [products, searchTerm]);

  const filteredPurchases = useMemo(() => {
    return filterBySearch(purchases, searchTerm, ["productName"]);
  }, [purchases, searchTerm]);

  const totalRecebido = transfers.reduce((sum, t) => sum + Number(t.quantidade || 0), 0);
  const totalGasto = purchases.reduce((sum, p) => sum + Number(p.custoMoedas || 0), 0);

  const history = useMemo(() => ([
    ...transfers.map((t) => ({
      id: `t-${t.id}`,
      type: "credit",
      name: t.professorName || "Professor",
      photoUrl: t.professorPhotoUrl,
      description: t.motivo || "Sem motivo informado",
      amount: Number(t.quantidade || 0),
      date: t.criadoEm,
    })),
    ...purchases.map((p) => ({
      id: `p-${p.id}`,
      type: "debit",
      name: p.companyName || "Empresa Parceira",
      photoUrl: p.companyPhotoUrl || p.productImageUrl,
      description: p.productName ? `Resgate: ${p.productName}` : "Resgate",
      amount: Number(p.custoMoedas || 0),
      date: p.criadoEm,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))), [transfers, purchases]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => matchesSearch(searchTerm, [item.name, item.description, item.amount, formatDate(item.date)]));
  }, [history, searchTerm]);

  const pageTitle =
    activePage === "products" ? "Catálogo do Aluno"
      : activePage === "purchases" ? "Minhas Compras"
      : activePage === "historico" ? "Histórico"
      : activePage === "emails" ? "E-mails"
      : "Configurações";

  const searchPlaceholder =
    activePage === "products" ? "Buscar produtos..."
      : activePage === "purchases" ? "Pesquisar compras..."
      : activePage === "historico" ? "Buscar transações..."
      : "";

  return (
    <div className="app-shell student-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="STUDENT"
        user={user}
        subtitle="Portal do Aluno"
        tabs={[
          { key: "products", label: "Produtos" },
          { key: "purchases", label: "Minhas Compras" },
          { key: "historico", label: "Histórico" },
          { key: "emails", label: "E-mails", badge: unreadEmails },
          { key: "account", label: "Configurações" },
        ]}
      />

      <div className="prof-layout">
        <header className="prof-topbar">
          <span className="prof-topbar-title">{pageTitle}</span>
          {activePage !== "account" && (
            <div className="prof-search">
              <input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          )}
          <div className="prof-topbar-icons">
            {activePage !== "account" && (
              <button className="prof-topbar-avatar" type="button" onClick={() => setActivePage("account")} aria-label="Abrir perfil">
                {user.photoUrl ? <img src={user.photoUrl} alt={user.nome} /> : initials(user.nome)}
              </button>
            )}
          </div>
        </header>

        <main className="prof-main">
          {activePage === "products" && (
            <>
              <div className="prof-greeting">
                <h2>Olá, {firstName(user.nome)}</h2>
                <p>Use seus HappyCoins para resgatar produtos e benefícios disponíveis.</p>
              </div>

              <div className="stat-cards prof-stat-cards">
                <div className="stat-card prof-stat-card prof-stat-card-gold">
                  <div className="stat-card-icon stat-card-icon-coin">{COIN_ICON}</div>
                  <p className="eyebrow" style={{ marginTop: 16 }}>Saldo disponível</p>
                  <span className="stat-value">{Number(user.saldoMoedas || 0).toLocaleString("pt-BR")}</span>
                </div>
                <div className="stat-card prof-stat-card prof-stat-card-blue">
                  <div className="stat-card-icon stat-card-icon-people">{BAG_ICON}</div>
                  <p className="eyebrow" style={{ marginTop: 16 }}>Produtos disponíveis</p>
                  <span className="stat-value">{products.length}</span>
                </div>
                <div className="stat-card prof-stat-card prof-stat-card-green">
                  <div className="stat-card-icon stat-card-icon-trend">{HISTORY_ICON}</div>
                  <p className="eyebrow" style={{ marginTop: 16 }}>Resgates realizados</p>
                  <span className="stat-value">{purchases.length}</span>
                </div>
              </div>

              <ProductGrid
                products={filteredProducts}
                walletBalance={user.saldoMoedas}
                purchasingId={purchasingId}
                onPurchase={handlePurchase}
                showFilter={false}
              />
            </>
          )}

          {activePage === "purchases" && (
            <PurchasesView
              purchases={filteredPurchases}
              loading={loadingPurchases}
              totalGasto={totalGasto}
              onShowQr={setQrPurchase}
            />
          )}

          {activePage === "historico" && (
            <HistoryView
              history={filteredHistory}
              totalRecebido={totalRecebido}
              loading={loadingTransfers || loadingPurchases}
            />
          )}

          {activePage === "emails" && (
            <StudentEmailSection onUnreadChange={setUnreadEmails} onShowPurchaseQr={handleShowPurchaseQr} />
          )}

          {activePage === "account" && (
            <AccountForm user={user} onSave={onUpdateUser} onToast={onToast} />
          )}
        </main>
      </div>

      <QRCodeModal purchase={qrPurchase} onClose={() => setQrPurchase(null)} />
    </div>
  );
}

function PurchasesView({ purchases, loading, totalGasto, onShowQr }) {
  return (
    <>
      <div className="settings-page-header">
        <h2>Minhas Compras</h2>
        <p>Gerencie seus cupons e resgates realizados com HappyCoins.</p>
      </div>

      <div className="stat-cards prof-stat-cards">
        <div className="stat-card prof-stat-card prof-stat-card-gold">
          <div className="stat-card-icon stat-card-icon-coin">{BAG_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Compras realizadas</p>
          <span className="stat-value">{purchases.length}</span>
        </div>
        <div className="stat-card prof-stat-card prof-stat-card-blue">
          <div className="stat-card-icon stat-card-icon-people">{COIN_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Moedas gastas</p>
          <span className="stat-value">{Number(totalGasto || 0).toLocaleString("pt-BR")}</span>
        </div>
      </div>

      <section className="professor-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Histórico de resgates</p>
            <h2>Cupons e produtos</h2>
          </div>
        </div>
        {loading && <EmptyState text="Carregando compras..." />}
        {!loading && purchases.length === 0 && <EmptyState text="Nenhuma compra realizada ainda." />}
        {!loading && purchases.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Custo</th>
                  <th>Data do resgate</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>
                      <div className="table-name-cell">
                        <div className="table-avatar">{initials(purchase.productName)}</div>
                        <span>{purchase.productName}</span>
                      </div>
                    </td>
                    <td><span className="wallet-dist-amount" style={{ color: "var(--danger)" }}>-{Number(purchase.custoMoedas || 0).toLocaleString("pt-BR")} HC</span></td>
                    <td className="date-cell">{formatLongDate(purchase.criadoEm)}</td>
                    <td>
                      <button className="button button-secondary" type="button" onClick={() => onShowQr(purchase)}>Ver QR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function HistoryView({ history, totalRecebido, loading }) {
  return (
    <>
      <div className="settings-page-header">
        <h2>Histórico de Transações</h2>
        <p>Acompanhe moedas recebidas de professores e resgates realizados.</p>
      </div>

      <div className="stat-cards prof-stat-cards">
        <div className="stat-card prof-stat-card prof-stat-card-gold">
          <div className="stat-card-icon stat-card-icon-coin">{COIN_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Total recebido</p>
          <span className="stat-value">{Number(totalRecebido || 0).toLocaleString("pt-BR")}</span>
        </div>
        <div className="stat-card prof-stat-card prof-stat-card-blue">
          <div className="stat-card-icon stat-card-icon-people">{HISTORY_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Total de transações</p>
          <span className="stat-value">{history.length}</span>
        </div>
      </div>

      <section className="professor-panel">
        {loading && <EmptyState text="Carregando histórico..." />}
        {!loading && history.length === 0 && <EmptyState text="Nenhuma transação encontrada." />}
        {!loading && history.length > 0 && (
          <div className="tx-list student-prof-tx-list">
            {history.map((item) => (
              <article className="tx-item" key={item.id}>
                <div className="tx-avatar">
                  {item.photoUrl ? <img src={item.photoUrl} alt={item.name} /> : item.type === "credit" ? initials(item.name) : BAG_ICON}
                </div>
                <div className="tx-info">
                  <span className="tx-name">{item.name}</span>
                  <span className="tx-desc">{item.description}</span>
                </div>
                <div className="tx-right">
                  <span className="tx-date">{formatShortDate(item.date)}</span>
                  <span className={`tx-amount ${item.type === "credit" ? "tx-credit" : "tx-debit-amount"}`}>
                    {item.type === "credit" ? "+" : "-"}{Number(item.amount || 0).toLocaleString("pt-BR")} HC
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function EmptyState({ text }) {
  return <p style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>{text}</p>;
}

function filterBySearch(items, query, fields) {
  return items.filter((item) => matchesSearch(query, fields.map((field) => item[field])));
}

function matchesSearch(query, values) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalized));
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
}

function firstName(name = "") {
  return name.split(" ").filter(Boolean)[0] || "Aluno";
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString("pt-BR") : "";
}

function formatLongDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatShortDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "");
}

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

function StudentEmailSection({ onUnreadChange, onShowPurchaseQr }) {
  const [view, setView] = useState("inbox"); // "inbox" | "sent" | "compose" | "read"
  const [inboxMsgs, setInboxMsgs] = useState([]);
  const [sentMsgs, setSentMsgs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [readSource, setReadSource] = useState("inbox");
  const [professors, setProfessors] = useState([]);
  const [professorId, setProfessorId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function loadInbox() {
    studentService.inbox().then((msgs) => {
      setInboxMsgs(msgs);
      onUnreadChange?.(msgs.filter((m) => !m.lido).length);
    }).catch(() => {});
  }
  function loadSent() {
    studentService.sent().then(setSentMsgs).catch(() => {});
  }

  useEffect(() => { loadInbox(); loadSent(); }, []);
  useEffect(() => { studentService.professors().then(setProfessors).catch(() => {}); }, []);

  function openMessage(m, source) {
    setSelected(m);
    setReadSource(source);
    setView("read");
    if (source === "inbox" && !m.lido) {
      studentService.markRead(m.id).then(loadInbox).catch(() => {});
    }
  }

  function startReply(m) {
    setProfessorId(m.fromId);
    setSubject(m.subject.startsWith("Re:") ? m.subject : `Re: ${m.subject}`);
    setBody("");
    setView("compose");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!professorId) return;
    setSending(true);
    setFeedback(null);
    try {
      await studentService.sendEmail({ studentId: professorId, subject, body, replyToId: selected?.id ?? null });
      setFeedback({ type: "success", message: "E-mail enviado com sucesso!" });
      setSubject(""); setBody(""); setProfessorId(""); setSelected(null);
      loadInbox(); loadSent();
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Falha ao enviar e-mail." });
    } finally {
      setSending(false);
    }
  }

  const unread = inboxMsgs.filter((m) => !m.lido).length;
  const inboxActive = view === "inbox" || (view === "read" && readSource === "inbox");
  const sentActive  = view === "sent"  || (view === "read" && readSource === "sent");

  return (
    <>
      <div className="settings-page-header">
        <h2>E-mails</h2>
        <p>Gerencie sua caixa de mensagens com os professores.</p>
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
          <StudentMsgList messages={inboxMsgs} onSelect={(m) => openMessage(m, "inbox")} selectedId={selected?.id} emptyText="Sua caixa de entrada está vazia." showFrom />
        </div>
      )}

      {view === "sent" && (
        <div className="mail-list-card">
          <StudentMsgList messages={sentMsgs} onSelect={(m) => openMessage(m, "sent")} selectedId={selected?.id} emptyText="Nenhuma mensagem enviada ainda." showFrom={false} />
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
            {selected.type === "PURCHASE_COUPON" && selected.purchaseId && (
              <div className="mail-read-actions">
                <button className="button button-primary" type="button" onClick={() => onShowPurchaseQr(selected.purchaseId)}>
                  Ver QR
                </button>
              </div>
            )}
            {readSource === "inbox" && selected.fromRole === "PROFESSOR" && (
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
              <div className="settings-form-field">
                <label className="settings-label">Destinatário</label>
                <select className="settings-input" value={professorId} onChange={(e) => setProfessorId(e.target.value)} required>
                  <option value="">{professors.length === 0 ? "Nenhum professor disponível" : "Selecione um professor"}</option>
                  {professors.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
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
              <button className="button button-primary" type="submit" disabled={sending || professors.length === 0}>{sending ? "Enviando..." : "Enviar mensagem"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function StudentMsgList({ messages, onSelect, selectedId, emptyText, showFrom }) {
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

export default StudentPage;
