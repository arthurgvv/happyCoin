import { useState } from "react";
import Toast from "./components/Toast.jsx";
import { useAuth } from "./hooks/useAuth.js";
import AuthPage from "./pages/AuthPage.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";
import InstitutionPage from "./pages/InstitutionPage.jsx";
import ProfessorPage from "./pages/ProfessorPage.jsx";
import StudentPage from "./pages/StudentPage.jsx";

function App() {
  const [toast, setToast] = useState(null);
  const auth = useAuth({ onToast: setToast });

  async function handleRegister(payload) {
    try {
      await auth.register(payload);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  }

  async function handleCompanyRegister(payload) {
    try {
      await auth.registerCompany(payload);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  }

  async function handleInstitutionRegister(payload) {
    try {
      await auth.registerInstitution(payload);
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  }

  async function handleLogin(payload) {
    try {
      await auth.login(payload);
      return true;
    } catch (error) {
      setToast({ message: error.message, type: "error" });
      return false;
    }
  }

  if (auth.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo" aria-label="happycoin">
          <span className="brand-happy">happy</span><span className="brand-coin">coin</span>
        </div>
      </div>
    );
  }

  if (!auth.loggedIn) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} onCompanyRegister={handleCompanyRegister} onInstitutionRegister={handleInstitutionRegister} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  const dashboard =
    auth.role === "PROFESSOR" ? (
      <ProfessorPage user={auth.user} onLogout={auth.logout} onUpdateUser={auth.updateUser} onToast={setToast} />
    ) : auth.role === "INSTITUTION" ? (
      <InstitutionPage user={auth.user} onLogout={auth.logout} onUpdateUser={auth.updateUser} onToast={setToast} />
    ) : auth.role === "COMPANY" ? (
      <CompanyPage user={auth.user} onLogout={auth.logout} onUpdateUser={auth.updateUser} onToast={setToast} />
    ) : (
      <StudentPage user={auth.user} onLogout={auth.logout} onUpdateUser={auth.updateUser} onToast={setToast} />
    );

  return (
    <>
      {dashboard}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default App;
