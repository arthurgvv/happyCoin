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

  useEffect(() => {
    studentService.me()
      .then(onUpdateUser)
      .catch(() => {});
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
      : "Configurações";

  const searchPlaceholder =
    activePage === "products" ? "Buscar produtos..."
      : activePage === "purchases" ? "Pesquisar compras..."
      : activePage === "historico" ? "Buscar transações..."
      : "";

  return (
    <div className="app-shell">
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

export default StudentPage;
