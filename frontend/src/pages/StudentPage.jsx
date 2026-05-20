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
    if (user.ultimoAviso) {
      onToast({ message: user.ultimoAviso, type: "success" });
    }
  }, [user.ultimoAviso, onToast]);

  useEffect(() => {
    if (activePage === "transfers") {
      setLoadingTransfers(true);
      studentService.transfers()
        .then(setTransfers)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingTransfers(false));
    }
  }, [activePage]);

  useEffect(() => {
    if (activePage === "purchases") {
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
          { key: "transfers", label: "Extrato" },
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

        {activePage === "transfers" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Moedas recebidas</p>
                <h2>{transfers.length} transferencia(s) — {totalRecebido} moedas recebidas</h2>
              </div>
            </div>

            {loadingTransfers && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Carregando...</p>
            )}
            {!loadingTransfers && transfers.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Nenhuma transferencia recebida ainda.</p>
            )}
            {!loadingTransfers && transfers.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Professor</th>
                      <th>Moedas</th>
                      <th>Motivo</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => (
                      <tr key={t.id}>
                        <td>{t.professorName || "Professor"}</td>
                        <td style={{ color: "var(--success, #38a169)", fontWeight: 600 }}>+{t.quantidade}</td>
                        <td>{t.motivo}</td>
                        <td>{t.criadoEm ? new Date(t.criadoEm).toLocaleString("pt-BR") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
