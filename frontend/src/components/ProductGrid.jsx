function ProductGrid({
  products,
  walletBalance = 0,
  purchasingId,
  onDelete,
  onEdit,
  onPurchase,
  title = "Catálogo de Prêmios",
  subtitle = "Troque seus pontos por produtos exclusivos.",
  showFilter = true,
}) {
  return (
    <section className="products-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {showFilter && (
          <button className="student-filter-button" type="button">
            Ver filtros
            <svg viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
          </button>
        )}
      </div>

      {products.length === 0 && (
        <p className="student-empty-state">Nenhum produto encontrado.</p>
      )}

      <div className="product-grid">
        {products.map((product) => {
          const isOutOfStock = product.quantidade != null && product.quantidade === 0;
          const canPurchase = !isOutOfStock && Number(walletBalance || 0) >= product.custoMoedas;
          const isPurchasing = purchasingId === product.id;

          return (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                {product.imageUrl && <img src={product.imageUrl} alt={product.nome} />}
                {isOutOfStock && <span className="product-out-of-stock-badge">Esgotado</span>}
              </div>
              <div className="product-body">
                {product.empresaParceira && <span className="product-brand-chip">{product.empresaParceira}</span>}
                <h3>{product.nome}</h3>
                <p>{product.descricao}</p>
              </div>
              <div className="product-footer">
                <strong className="product-price">
                  <span className="coin-mark">$</span>
                  {Number(product.custoMoedas || 0).toLocaleString("pt-BR")} HC
                </strong>
                {onPurchase && (
                  <button
                    className="button-buy"
                    type="button"
                    disabled={!canPurchase || isPurchasing}
                    title={isOutOfStock ? "Produto esgotado" : canPurchase ? `Resgatar ${product.nome}` : "Saldo insuficiente"}
                    onClick={() => onPurchase(product)}
                  >
                    {isPurchasing ? "Resgatando..." : isOutOfStock ? "Esgotado" : canPurchase ? "Comprar" : "Saldo insuficiente"}
                  </button>
                )}
                {(onEdit || onDelete) && (
                  <div className="row-actions">
                    {onEdit && (
                      <button className="button product-outline-action" type="button" onClick={() => onEdit(product)}>
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button className="button product-outline-action product-danger-action" type="button" onClick={() => onDelete(product)}>
                        Remover
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default ProductGrid;
