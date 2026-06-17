import { useState } from "react";

const DEV_ACCOUNTS = [
  { label: "Aluno",       email: "aluno@aluno.com",          senha: "Aluno1234", fallbacks: [
    { email: "carlosprates@aluno.com", senha: "Aluno1234" },
    { email: "gabriel@aluno.pucminas.br", senha: "Aluno1234" },
  ] },
  { label: "Professor",   email: "professor@emoney.com",     senha: "Professor123" },
  { label: "Empresa",     email: "empresa@empresa.com",      senha: "Emp1234", fallbacks: [
    { email: "rammus@empresa.com", senha: "Emp1234" },
    { email: "parceiro@mercadoaurora.com", senha: "Emp1234" },
  ] },
  { label: "Instituição", email: "contato@pucminas.br",      senha: "PucMinas1"   },
];

const STORAGE_KEY = "dev-login-enabled";

function DevLogin({ onLogin }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) !== "false");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  async function quickLogin(account) {
    setLoading(account.email);
    try {
      const attempts = [{ email: account.email, senha: account.senha }, ...(account.fallbacks || [])];
      for (const credentials of attempts) {
        try {
          const ok = await onLogin(credentials);
          if (ok !== false) return;
        } catch {
          // try next fallback
        }
      }
    } finally {
      setLoading(null);
    }
  }

  if (!enabled) {
    return (
      <button className="dev-login-restore" onClick={toggle} title="Reativar acesso rápido">
        ·
      </button>
    );
  }

  return (
    <div className="dev-login-wrap">
      {open && (
        <div className="dev-login-panel">
          <div className="dev-login-header">
            <span>Entrar como</span>
            <button className="dev-login-disable" onClick={toggle} title="Desativar">
              ✕
            </button>
          </div>
          {DEV_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              className="dev-login-item"
              onClick={() => quickLogin(account)}
              disabled={loading !== null}
            >
              <span className="dev-login-label">{account.label}</span>
              {loading === account.email
                ? <span className="dev-login-spinner" />
                : <span className="dev-login-arrow">→</span>
              }
            </button>
          ))}
        </div>
      )}
      <button
        className={`dev-login-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="Acesso rápido"
      >
        Entrar rápido
      </button>
    </div>
  );
}

export default DevLogin;
