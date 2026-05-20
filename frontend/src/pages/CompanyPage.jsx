import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { companyService } from "../services/companyService.js";
import { productService } from "../services/productService.js";

const emptyProduct = { nome: "", descricao: "", fotoUrl: "", fotoNome: "", custoMoedas: "" };
const emptyProfile = { nomeFantasia: "", email: "", senha: "", photoUrl: null };

const PRODUCT_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h12l1 14H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

const REDEEM_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 9h.01M17 15h.01M9 15l6-6" />
  </svg>
);

const COIN_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
  </svg>
);

function CompanyPage({ user, onLogout, onUpdateUser, onToast }) {
  const { products, refresh } = useProducts();
  const [activePage, setActivePage] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyProduct);
  const [submitting, setSubmitting] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyProduct);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [twoFa, setTwoFa] = useState(false);

  useEffect(() => {
    if (activePage === "dashboard" || activePage === "purchases") {
      loadPurchases();
    }
  }, [activePage]);

  useEffect(() => {
    setSearchTerm("");
  }, [activePage]);

  async function loadPurchases() {
    setLoadingPurchases(true);
    try {
      setPurchases(await productService.purchases());
    } catch (err) {
      onToast({ message: err.message, type: "error" });
    } finally {
      setLoadingPurchases(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await productService.create({
        nome: form.nome,
        descricao: form.descricao,
        fotoUrl: form.fotoUrl,
        custoMoedas: Number(form.custoMoedas),
      });
      setForm(emptyProduct);
      await refresh();
      onToast({ message: "Produto cadastrado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onToast({ message: "Anexe um arquivo de imagem válido.", type: "error" });
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setForm((current) => ({ ...current, fotoUrl: dataUrl, fotoNome: file.name }));
  }

  function openEdit(product) {
    setEditingProduct(product);
    setEditForm({
      nome: product.nome,
      descricao: product.descricao || "",
      fotoUrl: product.imageUrl || "",
      fotoNome: "",
      custoMoedas: String(product.custoMoedas),
    });
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    setSavingEdit(true);
    try {
      await productService.update(editingProduct.id, {
        nome: editForm.nome,
        descricao: editForm.descricao,
        fotoUrl: editForm.fotoUrl,
        custoMoedas: Number(editForm.custoMoedas),
      });
      setEditingProduct(null);
      await refresh();
      onToast({ message: "Produto atualizado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleEditImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onToast({ message: "Anexe um arquivo de imagem válido.", type: "error" });
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setEditForm((current) => ({ ...current, fotoUrl: dataUrl, fotoNome: file.name }));
  }

  async function handleDelete(product) {
    if (!window.confirm(`Remover "${product.nome}"?`)) return;
    try {
      await productService.remove(product.id);
      await refresh();
      onToast({ message: "Produto removido com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {};
      if (profileForm.nomeFantasia) payload.nomeFantasia = profileForm.nomeFantasia;
      if (profileForm.email) payload.email = profileForm.email;
      if (profileForm.senha) payload.senha = profileForm.senha;
      if (profileForm.photoUrl) payload.photoUrl = profileForm.photoUrl;

      const updated = await companyService.update(payload);
      if (onUpdateUser) onUpdateUser(updated);
      setProfileForm(emptyProfile);
      onToast({ message: "Perfil atualizado com sucesso.", type: "success" });
    } catch (error) {
      onToast({ message: error.message, type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  const companyProducts = products.filter((product) => product.companyId === user.id);
  const filteredCompanyProducts = useMemo(() => {
    return companyProducts.filter((product) => matchesSearch(searchTerm, [product.nome, product.descricao, product.custoMoedas]));
  }, [companyProducts, searchTerm]);
  const filteredPurchases = useMemo(() => {
    return purchases.filter((purchase) => matchesSearch(searchTerm, [purchase.productName, purchase.studentName, purchase.studentEmail, purchase.custoMoedas]));
  }, [purchases, searchTerm]);

  const totalResgatado = purchases.reduce((sum, purchase) => sum + Number(purchase.custoMoedas || 0), 0);
  const pageTitle =
    activePage === "dashboard" ? "Painel da Empresa"
      : activePage === "products" ? "Meus Produtos"
      : activePage === "purchases" ? "Resgates"
      : "Configurações";

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="COMPANY"
        user={user}
        subtitle="Portal da Empresa"
        tabs={[
          { key: "dashboard", label: "Painel" },
          { key: "products", label: "Meus Produtos" },
          { key: "purchases", label: "Resgates" },
          { key: "profile", label: "Configurações" },
        ]}
      />

      <div className="prof-layout">
        <header className="prof-topbar">
          <span className="prof-topbar-title">{pageTitle}</span>
          {(activePage === "products" || activePage === "purchases") && (
            <div className="prof-search">
              <input
                placeholder={activePage === "products" ? "Buscar produtos..." : "Buscar resgates..."}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          )}
          <div className="prof-topbar-icons">
            {activePage !== "profile" && (
              <button className="prof-topbar-avatar" type="button" onClick={() => setActivePage("profile")} aria-label="Abrir perfil">
                {user.photoUrl ? <img src={user.photoUrl} alt={user.nomeFantasia} /> : initials(user.nomeFantasia)}
              </button>
            )}
          </div>
        </header>

        <main className="prof-main">
          {activePage === "dashboard" && (
            <CompanyDashboard
              user={user}
              products={companyProducts}
              purchases={purchases}
              totalResgatado={totalResgatado}
              loadingPurchases={loadingPurchases}
              onNewProduct={() => setActivePage("products")}
              onViewPurchases={() => setActivePage("purchases")}
            />
          )}

          {activePage === "products" && (
            <ProductsManager
              form={form}
              update={update}
              submitting={submitting}
              handleSubmit={handleSubmit}
              handleImageChange={handleImageChange}
              products={filteredCompanyProducts}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          )}

          {activePage === "purchases" && (
            <PurchasesTable
              purchases={filteredPurchases}
              loading={loadingPurchases}
              totalResgatado={totalResgatado}
            />
          )}

          {activePage === "profile" && (
            <CompanyProfile
              user={user}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              savingProfile={savingProfile}
              onSubmit={handleSaveProfile}
              showPwdChange={showPwdChange}
              setShowPwdChange={setShowPwdChange}
              twoFa={twoFa}
              setTwoFa={setTwoFa}
            />
          )}
        </main>
      </div>

      {editingProduct && (
        <ProductEditModal
          editingProduct={editingProduct}
          editForm={editForm}
          setEditForm={setEditForm}
          savingEdit={savingEdit}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleSaveEdit}
          onImageChange={handleEditImageChange}
        />
      )}
    </div>
  );
}

function CompanyDashboard({ user, products, purchases, totalResgatado, loadingPurchases, onNewProduct, onViewPurchases }) {
  const recentPurchases = purchases.slice(0, 4);
  const weeklyTarget = Math.max(1, products.length * 10);
  const targetPercent = Math.min(100, Math.round((purchases.length / weeklyTarget) * 100));

  return (
    <>
      <section className="company-welcome-card">
        <div className="company-welcome-identity">
          <div className="company-logo-bubble">
            {user.photoUrl ? <img src={user.photoUrl} alt={user.nomeFantasia} /> : initials(user.nomeFantasia)}
          </div>
          <div>
            <h2>Bem-vindo, {user.nomeFantasia}</h2>
            <p>Acompanhe produtos, resgates e o desempenho da sua parceria.</p>
          </div>
        </div>
        <button className="prof-distribute-btn company-new-product-btn" type="button" onClick={onNewProduct}>
          <span>+</span>
          Novo Produto
        </button>
      </section>

      <div className="stat-cards prof-stat-cards">
        <div className="stat-card prof-stat-card prof-stat-card-gold">
          <div className="stat-card-icon stat-card-icon-coin">{PRODUCT_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Total de Produtos</p>
          <span className="stat-value">{products.length}</span>
        </div>
        <div className="stat-card prof-stat-card prof-stat-card-blue">
          <div className="stat-card-icon stat-card-icon-people">{REDEEM_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Total de Resgates</p>
          <span className="stat-value">{purchases.length}</span>
        </div>
        <div className="stat-card prof-stat-card prof-stat-card-green">
          <div className="stat-card-icon stat-card-icon-trend">{COIN_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Moedas Recebidas</p>
          <span className="stat-value">{Number(totalResgatado || 0).toLocaleString("pt-BR")}</span>
        </div>
      </div>

      <div className="prof-dashboard-body">
        <section className="prof-activity">
          <div className="prof-activity-header">
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>Resgates Recentes</h3>
            <button className="button button-ghost" type="button" style={{ fontSize: "0.8rem", minHeight: 32, padding: "0 12px" }} onClick={onViewPurchases}>
              Ver todos
            </button>
          </div>

          {loadingPurchases && <p style={{ color: "var(--muted)", padding: "24px 0", textAlign: "center" }}>Carregando...</p>}
          {!loadingPurchases && recentPurchases.length === 0 && (
            <p style={{ color: "var(--muted)", padding: "24px 0", textAlign: "center", fontSize: "0.88rem" }}>Nenhum resgate registrado ainda.</p>
          )}
          {recentPurchases.map((purchase) => (
            <div className="activity-item" key={purchase.id}>
              <div className="activity-avatar">
                {purchase.studentPhotoUrl ? <img src={purchase.studentPhotoUrl} alt={purchase.studentName || "Aluno"} /> : initials(purchase.studentName)}
              </div>
              <div className="activity-info">
                <p className="activity-name">{purchase.studentName}</p>
                <p className="activity-desc">{purchase.productName}</p>
              </div>
              <div className="activity-meta">
                <span className="activity-badge">HC {purchase.custoMoedas}</span>
                <span className="activity-time">{timeAgo(purchase.criadoEm)}</span>
              </div>
            </div>
          ))}
        </section>

        <aside className="prof-quick-actions">
          <h3 className="quick-actions-title">Ações Rápidas</h3>
          <button className="quick-action-card is-primary" type="button" onClick={onNewProduct}>
            <div className="quick-action-icon">{PRODUCT_ICON}</div>
            <div className="quick-action-body">
              <p className="quick-action-name">Cadastrar produto</p>
              <p className="quick-action-desc">Criar uma nova recompensa para alunos</p>
            </div>
          </button>
          <button className="quick-action-card" type="button" onClick={onViewPurchases}>
            <div className="quick-action-icon">{REDEEM_ICON}</div>
            <div className="quick-action-body">
              <p className="quick-action-name">Ver resgates</p>
              <p className="quick-action-desc">Acompanhar alunos e cupons resgatados</p>
            </div>
          </button>
          <div className="budget-card">
            <p className="budget-label">Meta Operacional</p>
            <div className="budget-bar-track">
              <div className="budget-bar-fill" style={{ width: `${targetPercent}%` }} />
            </div>
            <div className="budget-bar-info">
              <span>{purchases.length} resgates</span>
              <span>{targetPercent}%</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function ProductsManager({ form, update, submitting, handleSubmit, handleImageChange, products, onDelete, onEdit }) {
  return (
    <>
      <div className="settings-page-header">
        <h2>Meus Produtos</h2>
        <p>Cadastre e mantenha as recompensas disponíveis para os alunos.</p>
      </div>

      <section className="professor-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Produtos e descontos</p>
            <h2>Cadastrar oferta para alunos</h2>
          </div>
        </div>

        <form className="entity-form professor-form" onSubmit={handleSubmit}>
          <label>
            Nome do produto ou desconto
            <input value={form.nome} onChange={(event) => update("nome", event.target.value)} required />
          </label>
          <label>
            Custo em moedas
            <input type="number" min="1" value={form.custoMoedas} onChange={(event) => update("custoMoedas", event.target.value)} required />
          </label>
          <label className="full-field">
            Foto do produto
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          {form.fotoUrl && (
            <div className="image-preview full-field">
              <img src={form.fotoUrl} alt="Prévia do produto" />
              <span>{form.fotoNome || "Imagem anexada"}</span>
            </div>
          )}
          <label className="full-field">
            Descrição
            <textarea value={form.descricao} onChange={(event) => update("descricao", event.target.value)} required />
          </label>
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Cadastrando..." : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </section>

      <ProductGrid
        products={products}
        onDelete={onDelete}
        onEdit={onEdit}
        title="Produtos cadastrados"
        subtitle="Ofertas vinculadas à sua empresa parceira."
        showFilter={false}
      />
    </>
  );
}

function PurchasesTable({ purchases, loading, totalResgatado }) {
  return (
    <>
      <div className="settings-page-header">
        <h2>Resgates</h2>
        <p>Confira os produtos resgatados pelos alunos.</p>
      </div>

      <div className="stat-cards prof-stat-cards">
        <div className="stat-card prof-stat-card prof-stat-card-gold">
          <div className="stat-card-icon stat-card-icon-coin">{REDEEM_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Total de Resgates</p>
          <span className="stat-value">{purchases.length}</span>
        </div>
        <div className="stat-card prof-stat-card prof-stat-card-blue">
          <div className="stat-card-icon stat-card-icon-people">{COIN_ICON}</div>
          <p className="eyebrow" style={{ marginTop: 16 }}>Moedas recebidas</p>
          <span className="stat-value">{Number(totalResgatado || 0).toLocaleString("pt-BR")}</span>
        </div>
      </div>

      <section className="professor-panel">
        {loading && <p style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>Carregando...</p>}
        {!loading && purchases.length === 0 && <p style={{ textAlign: "center", color: "var(--muted)", padding: "32px" }}>Nenhum resgate registrado ainda.</p>}
        {!loading && purchases.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Aluno</th>
                  <th>Email do aluno</th>
                  <th>Moedas</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{purchase.productName}</td>
                    <td>
                      <div className="table-name-cell">
                        <div className="table-avatar">
                          {purchase.studentPhotoUrl ? <img src={purchase.studentPhotoUrl} alt={purchase.studentName || "Aluno"} /> : initials(purchase.studentName)}
                        </div>
                        <span>{purchase.studentName}</span>
                      </div>
                    </td>
                    <td>{purchase.studentEmail}</td>
                    <td><span className="wallet-dist-amount">+{purchase.custoMoedas} HC</span></td>
                    <td className="date-cell">{purchase.criadoEm ? new Date(purchase.criadoEm).toLocaleString("pt-BR") : "-"}</td>
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

function CompanyProfile({ user, profileForm, setProfileForm, savingProfile, onSubmit, showPwdChange, setShowPwdChange, twoFa, setTwoFa }) {
  const currentPhoto = profileForm.photoUrl || user.photoUrl;

  function update(name, value) {
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="settings-page-header">
        <h2>Configurações de Perfil da Empresa</h2>
        <p>Gerencie identidade, acesso e dados da empresa parceira.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-left">
          <div className="settings-profile-card">
            <div className="settings-profile-photo-wrap">
              <div className="settings-profile-photo">
                {currentPhoto ? <img src={currentPhoto} alt="Logo" /> : initials(user.nomeFantasia)}
              </div>
              <label className="settings-photo-badge">
                <CameraIcon />
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  update("photoUrl", await readFileAsDataUrl(file));
                }} />
              </label>
            </div>
            <h3 className="settings-profile-name">{user.nomeFantasia}</h3>
            <p className="settings-profile-role">EMPRESA PARCEIRA</p>
            <label className="button settings-update-photo-btn">
              Atualizar Logo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                update("photoUrl", await readFileAsDataUrl(file));
              }} />
            </label>
            <button className="button settings-remove-photo-btn" type="button" onClick={() => update("photoUrl", "")}>
              Remover
            </button>
          </div>

          <div className="settings-creds-card">
            <div className="settings-creds-title">
              <ShieldIcon />
              Credenciais
            </div>
            <div className="settings-creds-row">
              <span className="settings-creds-label">Status</span>
              <span className="settings-status-chip">Ativo</span>
            </div>
            <div className="settings-creds-row">
              <span className="settings-creds-label">CNPJ</span>
              <span className="settings-creds-balance">{user.cnpj}</span>
            </div>
          </div>
        </div>

        <div className="settings-right">
          <div className="settings-section-card">
            <div className="settings-section-header">
              <h2>Informações da Empresa</h2>
              <span className="settings-section-meta">Dados atuais</span>
            </div>
            <div className="settings-divider" />
            <form className="settings-form" onSubmit={onSubmit}>
              <div className="settings-form-row">
                <div className="settings-form-field">
                  <label className="settings-label">Nome Fantasia</label>
                  <input className="settings-input" value={profileForm.nomeFantasia} placeholder={user.nomeFantasia} onChange={(event) => update("nomeFantasia", event.target.value)} />
                </div>
                <div className="settings-form-field">
                  <label className="settings-label">Endereço de Email</label>
                  <input className="settings-input" type="email" value={profileForm.email} placeholder={user.email} onChange={(event) => update("email", event.target.value)} />
                </div>
              </div>
              <div className="settings-form-field">
                <label className="settings-label">CNPJ</label>
                <input className="settings-input" value={user.cnpj} disabled />
                <span className="settings-field-hint">O CNPJ é definido no cadastro e não é alterado pelo perfil.</span>
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
            <p className="settings-security-desc">Atualize a senha para manter produtos e resgates protegidos.</p>
            <button className="button button-secondary settings-pwd-btn" type="button" onClick={() => setShowPwdChange((value) => !value)}>
              Alterar Senha
            </button>
            {showPwdChange && (
              <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
                <div className="settings-form-field">
                  <label className="settings-label">Nova Senha</label>
                  <input
                    className="settings-input"
                    type="password"
                    value={profileForm.senha}
                    placeholder="Letras e números"
                    onChange={(event) => update("senha", event.target.value)}
                  />
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
                  <ShieldIcon />
                  <strong>Autenticação de Dois Fatores</strong>
                </div>
                <p>Adicione uma camada extra de segurança à conta da empresa.</p>
              </div>
              <button className={`settings-toggle${twoFa ? " is-on" : ""}`} type="button" onClick={() => setTwoFa((value) => !value)} aria-label="Ativar autenticação de dois fatores" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductEditModal({ editingProduct, editForm, setEditForm, savingEdit, onClose, onSubmit, onImageChange }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Editar produto</p>
            <h2>{editingProduct.nome}</h2>
          </div>
          <button className="button button-secondary" type="button" onClick={onClose}>Fechar</button>
        </div>

        <form className="entity-form professor-form" onSubmit={onSubmit}>
          <label>
            Nome do produto
            <input value={editForm.nome} onChange={(event) => setEditForm((current) => ({ ...current, nome: event.target.value }))} required />
          </label>
          <label>
            Custo em moedas
            <input type="number" min="1" value={editForm.custoMoedas} onChange={(event) => setEditForm((current) => ({ ...current, custoMoedas: event.target.value }))} required />
          </label>
          <label className="full-field">
            Nova foto (opcional)
            <input type="file" accept="image/*" onChange={onImageChange} />
          </label>
          {editForm.fotoUrl && editForm.fotoNome && (
            <div className="image-preview full-field">
              <img src={editForm.fotoUrl} alt="Prévia" />
              <span>{editForm.fotoNome}</span>
            </div>
          )}
          <label className="full-field">
            Descrição
            <textarea value={editForm.descricao} onChange={(event) => setEditForm((current) => ({ ...current, descricao: event.target.value }))} required />
          </label>
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={savingEdit}>
              {savingEdit ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0] || "").join("").toUpperCase() || "?";
}

function matchesSearch(query, values) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalized));
}

function timeAgo(dateString) {
  if (!dateString) return "-";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CameraIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}

function ShieldIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}

export default CompanyPage;
