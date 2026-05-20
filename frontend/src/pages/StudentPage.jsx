import { useEffect, useState } from "react";
import AccountForm from "../components/AccountForm.jsx";
import BalanceBanner from "../components/BalanceBanner.jsx";
import Navbar from "../components/Navbar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import QRCodeModal from "../components/QRCodeModal.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { productService } from "../services/productService.js";
import { studentService } from "../services/studentService.js";

function StudentPage({ user, onLogout, onUpdateUser, onToast }) {
  const [activePage, setActivePage] = useState("products");
  const [purchasingId, setPurchasingId] = useState(null);
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
    if (activePage === "historico") {
      setLoadingTransfers(true);
      studentService.transfers()
        .then(setTransfers)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingTransfers(false));
    }
  }, [activePage]);

  useEffect(() => {
    if (activePage === "purchases" || activePage === "historico") {
      setLoadingPurchases(true);
      studentService.purchases()
        .then(setPurchases)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingPurchases(false));
    }
  }, [activePage]);

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

  const totalRecebido = transfers.reduce((sum, t) => sum + t.quantidade, 0);
  const totalGasto = purchases.reduce((sum, p) => sum + p.custoMoedas, 0);

  const history = [
    ...transfers.map((t) => ({
      id: `t-${t.id}`,
      type: "credit",
      name: t.professorName || "Professor",
      description: t.motivo || "—",
      amount: t.quantidade,
      date: t.criadoEm,
    })),
    ...purchases.map((p) => ({
      id: `p-${p.id}`,
      type: "debit",
      name: p.productName ? `Store: ${p.productName}` : "Loja",
      description: p.productName ? `Resgate: ${p.productName}` : "—",
      amount: p.custoMoedas,
      date: p.criadoEm,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  function getInitials(name) {
    return name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
  }
  const AVATAR_PALETTE = ["#f4b91f", "#7ec8e3", "#b8d4a8", "#f4a261", "#a8c5da", "#c4b5fd"];
  function avatarBg(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
    return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
  }

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="STUDENT"
        user={user}
        tabs={[
          { key: "products", label: "Produtos" },
          { key: "purchases", label: "Minhas Compras" },
          { key: "historico", label: "Histórico" },
          { key: "account", label: "Minha Conta" },
        ]}
      />

      <main className="student-home">
        <BalanceBanner saldo={user.saldoMoedas} />

        {activePage === "products" && (
          <ProductGrid
            products={products}
            walletBalance={user.saldoMoedas}
            purchasingId={purchasingId}
            onPurchase={handlePurchase}
          />
        )}

        {activePage === "purchases" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Historico de resgates</p>
                <h2>{purchases.length} compra(s) — {totalGasto} moedas gastas</h2>
              </div>
            </div>

            {loadingPurchases && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Carregando...</p>
            )}
            {!loadingPurchases && purchases.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Nenhuma compra realizada ainda.</p>
            )}
            {!loadingPurchases && purchases.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Moedas</th>
                      <th>Data</th>
                      <th>Resgate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td style={{ color: "var(--error, #e53e3e)", fontWeight: 600 }}>-{p.custoMoedas}</td>
                        <td>{p.criadoEm ? new Date(p.criadoEm).toLocaleString("pt-BR") : "—"}</td>
                        <td>
                          <button
                            className="button button-secondary"
                            style={{ fontSize: "12px", padding: "4px 10px" }}
                            type="button"
                            onClick={() => setQrPurchase(p)}
                          >
                            Ver QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activePage === "historico" && (
          <section className="professor-panel">
            <div className="tx-stats-row">
              <div className="tx-stat-card">
                <span className="tx-stat-label">TOTAL RECEBIDO</span>
                <span className="tx-stat-value">{totalRecebido.toLocaleString("pt-BR")} HC</span>
              </div>
              <div className="tx-stat-card">
                <span className="tx-stat-label">TOTAL DE TRANSAÇÕES</span>
                <span className="tx-stat-value">{history.length}</span>
              </div>
            </div>

            <h2 style={{ margin: "28px 0 16px", fontWeight: 700, fontSize: "1.25rem" }}>Histórico de Transações</h2>

            {(loadingTransfers || loadingPurchases) && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Carregando...</p>
            )}
            {!(loadingTransfers || loadingPurchases) && (
              <div className="tx-list">
                {history.map((item) => (
                  <div key={item.id} className="tx-item">
                    <div
                      className="tx-avatar"
                      style={{ background: item.type === "debit" ? "#e2e8f0" : avatarBg(item.name) }}
                    >
                      {item.type === "debit" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                      ) : getInitials(item.name)}
                    </div>
                    <div className="tx-info">
                      <span className="tx-name">{item.name}</span>
                      <span className="tx-desc">{item.description}</span>
                    </div>
                    <div className="tx-right">
                      <span className="tx-date">
                        {item.date ? new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </span>
                      <span className={`tx-amount ${item.type === "credit" ? "tx-credit" : "tx-debit-amount"}`}>
                        {item.type === "credit" ? "+" : "-"}{item.amount} HC
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activePage === "account" && (
          <AccountForm user={user} onSave={onUpdateUser} onToast={onToast} />
        )}
      </main>

      <QRCodeModal purchase={qrPurchase} onClose={() => setQrPurchase(null)} />
    </div>
  );
}

export default StudentPage;
