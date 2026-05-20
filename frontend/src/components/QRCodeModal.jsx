import { useEffect, useRef } from "react";
import QRCode from "qrcode";

function QRCodeModal({ purchase, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!purchase || !canvasRef.current) return;

    const payload = JSON.stringify({
      id: purchase.id,
      produto: purchase.productName,
      aluno: purchase.studentName,
      moedas: purchase.custoMoedas,
      data: purchase.criadoEm,
    });

    QRCode.toCanvas(canvasRef.current, payload, { width: 240, margin: 2 });
  }, [purchase]);

  if (!purchase) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">QR Code de resgate</p>
            <h2>{purchase.productName}</h2>
          </div>
          <button className="button button-secondary" type="button" onClick={onClose}>Fechar</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "16px 0" }}>
          <canvas ref={canvasRef} style={{ borderRadius: "8px" }} />
          <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center" }}>
            Mostre este QR Code a empresa para confirmar o resgate.
          </p>
          <div style={{ fontSize: "13px", background: "var(--surface-2, #f5f5f5)", borderRadius: "8px", padding: "12px 16px", width: "100%", maxWidth: "320px" }}>
            <p><strong>Produto:</strong> {purchase.productName}</p>
            <p><strong>Aluno:</strong> {purchase.studentName}</p>
            <p><strong>Moedas:</strong> {purchase.custoMoedas}</p>
            <p><strong>Data:</strong> {purchase.criadoEm ? new Date(purchase.criadoEm).toLocaleString("pt-BR") : "-"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default QRCodeModal;
