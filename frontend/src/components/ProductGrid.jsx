function ProductGrid({ products, walletBalance = 0, purchasingId, onDelete, onEdit, onPurchase }) {
  return (
    <section className="products-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Empresas parceiras</p>
          <h2>Produtos e descontos</h2>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => {
          const canPurchase = Number(walletBalance || 0) >= product.custoMoedas;
          const isPurchasing = purchasingId === product.id;

          return (
            <article className="product-card" key={product.id}>
              {product.imageUrl && <img src={product.imageUrl} alt={product.nome} />}
              <div className="product-body">
                <span>{product.empresaParceira}</span>
                <h3>{product.nome}</h3>
                <p>{product.descricao}</p>
              </div>
              <div className="product-footer">
                <strong className="product-price">{product.custoMoedas} moedas</strong>
                {onPurchase && (
                  <button
                    className="button-buy"
                    type="button"
                    disabled={!canPurchase || isPurchasing}
                    title={canPurchase ? `Resgatar ${product.nome}` : "Saldo insuficiente"}
                    onClick={() => onPurchase(product)}
                  >
                    {isPurchasing ? "Resgatando..." : "Resgatar"}
                  </button>
                )}
                {(onEdit || onDelete) && (
                  <div className="row-actions">
                    {onEdit && (
                      <button className="button button-secondary" type="button" onClick={() => onEdit(product)}>
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button className="button button-danger" type="button" onClick={() => onDelete(product)}>
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
