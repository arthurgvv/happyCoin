function BalanceBanner({ saldo }) {
  return (
    <section className="balance-center">
      <div>
        <h1>Seu Saldo</h1>
        <p>Continue ganhando moedas através de suas atividades acadêmicas.</p>
      </div>
      <div className="balance-wallet-card">
        <strong><span className="coin-mark">$</span>{Number(saldo || 0).toLocaleString("pt-BR")}</strong>
        <span>HappyCoins (HC)</span>
      </div>
    </section>
  );
}

export default BalanceBanner;
