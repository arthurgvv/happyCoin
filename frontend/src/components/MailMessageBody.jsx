function parseCoinTransfer(message) {
  const body = message?.body || "";
  const subject = message?.subject || "";
  const amountMatch = subject.match(/(\d+)/) || body.match(/(\d+)\s+HappyCoins/i);
  const reason = body.split("Motivo:")[1]?.trim();

  return {
    amount: amountMatch?.[1] || "",
    reason: reason || body,
  };
}

function MailMessageBody({ message, source }) {
  if (message?.type !== "COIN_TRANSFER") {
    return <p className="mail-read-text">{message?.body}</p>;
  }

  const transfer = parseCoinTransfer(message);
  const isSent = source === "sent";
  const title = isSent ? "Moedas enviadas" : "Moedas recebidas";
  const counterpartLabel = isSent ? "Aluno" : "Professor";
  const counterpartName = isSent ? message.toNome : message.fromNome;

  return (
    <div className="mail-transfer-receipt">
      <div className="mail-transfer-hero">
        <div className="mail-transfer-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v2m0 8v2M9.5 9.5A2.5 2.5 0 0 1 12 8c1.38 0 2.5.9 2.5 2s-1.12 2-2.5 2-2.5.9-2.5 2 1.12 2 2.5 2a2.5 2.5 0 0 0 2.5-1.5" />
          </svg>
        </div>
        <div>
          <span>{title}</span>
          <strong>{transfer.amount || "-"} HappyCoins</strong>
        </div>
      </div>

      <div className="mail-transfer-grid">
        <div>
          <span>{counterpartLabel}</span>
          <strong>{counterpartName}</strong>
        </div>
        <div>
          <span>Data</span>
          <strong>{new Date(message.criadoEm).toLocaleString("pt-BR")}</strong>
        </div>
      </div>

      <div className="mail-transfer-reason">
        <span>Motivo</span>
        <p>{transfer.reason}</p>
      </div>
    </div>
  );
}

export default MailMessageBody;
