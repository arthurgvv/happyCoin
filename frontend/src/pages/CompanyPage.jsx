import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { companyService } from "../services/companyService.js";
import { productService } from "../services/productService.js";

const emptyProduct = { nome: "", descricao: "", fotoUrl: "", fotoNome: "", custoMoedas: "" };
const emptyProfile = { nomeFantasia: "", email: "", senha: "", photoUrl: null };

function CompanyPage({ user, onLogout, onUpdateUser, onToast }) {
  const { products, refresh } = useProducts();
  const [activePage, setActivePage] = useState("products");
  const [form, setForm] = useState(emptyProduct);
  const [submitting, setSubmitting] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyProduct);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (activePage === "purchases") {
      setLoadingPurchases(true);
      productService.purchases()
        .then(setPurchases)
        .catch((err) => onToast({ message: err.message, type: "error" }))
        .finally(() => setLoadingPurchases(false));
    }
  }, [activePage]);

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
      onToast({ message: "Anexe um arquivo de imagem valido.", type: "error" });
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
      onToast({ message: "Anexe um arquivo de imagem valido.", type: "error" });
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setEditForm((f) => ({ ...f, fotoUrl: dataUrl, fotoNome: file.name }));
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

  const companyProducts = products.filter((p) => p.companyId === user.id);

  const totalResgatado = purchases.reduce((sum, p) => sum + p.custoMoedas, 0);

  return (
    <div className="app-shell">
      <Navbar
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={onLogout}
        role="COMPANY"
        user={user}
        tabs={[
          { key: "products", label: "Produtos" },
          { key: "purchases", label: "Resgates" },
          { key: "profile", label: "Perfil" },
        ]}
      />

      <main className="student-home">
        <section className="company-hero">
          <div>
            <p className="eyebrow">Empresa parceira</p>
            <h1>{user.nomeFantasia}</h1>
          </div>
          <span>CNPJ {user.cnpj}</span>
        </section>

        {activePage === "products" && (
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
                <input value={form.nome} onChange={(e) => update("nome", e.target.value)} required />
              </label>
              <label>
                Custo em moedas
                <input type="number" min="1" value={form.custoMoedas} onChange={(e) => update("custoMoedas", e.target.value)} required />
              </label>
              <label className="full-field">
                Foto do produto
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
              {form.fotoUrl && (
                <div className="image-preview full-field">
                  <img src={form.fotoUrl} alt="Previa do produto" />
                  <span>{form.fotoNome || "Imagem anexada"}</span>
                </div>
              )}
              <label className="full-field">
                Descricao
                <textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} required />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={submitting}>
                  {submitting ? "Cadastrando..." : "Cadastrar produto"}
                </button>
              </div>
            </form>

            <ProductGrid products={companyProducts} onDelete={handleDelete} onEdit={openEdit} />
          </section>
        )}

        {activePage === "purchases" && (
          <section className="professor-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Historico de resgates</p>
                <h2>{purchases.length} resgate(s) — {totalResgatado} moedas recebidas</h2>
              </div>
            </div>

            {loadingPurchases && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Carregando...</p>
            )}

            {!loadingPurchases && purchases.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>Nenhum resgate registrado ainda.</p>
            )}

            {!loadingPurchases && purchases.length > 0 && (
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
                    {purchases.map((p) => (
                      <tr key={p.id}>
                        <td>{p.productName}</td>
                        <td>{p.studentName}</td>
                        <td>{p.studentEmail}</td>
                        <td>{p.custoMoedas}</td>
                        <td>{p.criadoEm ? new Date(p.criadoEm).toLocaleString("pt-BR") : "—"}</td>
                      </tr>
                    ))}
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
                <p className="eyebrow">Dados da empresa</p>
                <h2>Editar perfil</h2>
              </div>
            </div>

            <div className="info-card">
              <p><strong>Nome</strong>{user.nomeFantasia}</p>
              <p><strong>Email</strong>{user.email}</p>
              <p><strong>CNPJ</strong>{user.cnpj}</p>
            </div>

            <form className="entity-form professor-form" onSubmit={handleSaveProfile}>
              <div className="full-field">
                <div className="photo-upload-wrap">
                  <div className="photo-upload-preview photo-upload-preview-blue">
                    {profileForm.photoUrl
                      ? <img src={profileForm.photoUrl} alt="Logo" />
                      : (user.photoUrl
                          ? <img src={user.photoUrl} alt="Logo" />
                          : user.nomeFantasia.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase())}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.88rem" }}>Logo da empresa</p>
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
                Novo nome fantasia (opcional)
                <input value={profileForm.nomeFantasia} onChange={(e) => setProfileForm((p) => ({ ...p, nomeFantasia: e.target.value }))} />
              </label>
              <label>
                Novo email (opcional)
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))} />
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

      {editingProduct && (
        <div className="modal-backdrop" role="presentation" onClick={() => setEditingProduct(null)}>
          <section className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Editar produto</p>
                <h2>{editingProduct.nome}</h2>
              </div>
              <button className="button button-secondary" type="button" onClick={() => setEditingProduct(null)}>Fechar</button>
            </div>

            <form className="entity-form professor-form" onSubmit={handleSaveEdit}>
              <label>
                Nome do produto
                <input value={editForm.nome} onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))} required />
              </label>
              <label>
                Custo em moedas
                <input type="number" min="1" value={editForm.custoMoedas} onChange={(e) => setEditForm((f) => ({ ...f, custoMoedas: e.target.value }))} required />
              </label>
              <label className="full-field">
                Nova foto (opcional)
                <input type="file" accept="image/*" onChange={handleEditImageChange} />
              </label>
              {editForm.fotoUrl && editForm.fotoNome && (
                <div className="image-preview full-field">
                  <img src={editForm.fotoUrl} alt="Previa" />
                  <span>{editForm.fotoNome}</span>
                </div>
              )}
              <label className="full-field">
                Descricao
                <textarea value={editForm.descricao} onChange={(e) => setEditForm((f) => ({ ...f, descricao: e.target.value }))} required />
              </label>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={savingEdit}>
                  {savingEdit ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default CompanyPage;
