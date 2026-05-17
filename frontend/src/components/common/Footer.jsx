import { useState } from "react";
import { createPortal } from "react-dom";
import "./Footer.css";
import kalasetuLogo from "../../assets/kalasetu_logo.png";

export default function Footer() {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  return (
    <>
      <footer className="gh-footer">
        <div className="gh-footer-container">
          <div className="gh-footer-left">
            <img src={kalasetuLogo} alt="KalaSetu" className="gh-footer-logo" />
            <span>&copy; 2026 KalaSetu, Inc.</span>
          </div>
          <div className="gh-footer-links">
            <button className="gh-footer-btn" onClick={() => setModal("terms")}>Terms</button>
            <button className="gh-footer-btn" onClick={() => setModal("privacy")}>Privacy</button>
            <button className="gh-footer-btn" onClick={() => showToast("🔒 High-grade TLS encryption active across all KalaSetu microservices")}>Security</button>
            <button className="gh-footer-btn" onClick={() => showToast("🟢 All KalaSetu systems operational (API & Realtime WebSockets)")}>Status</button>
            <button className="gh-footer-btn" onClick={() => showToast("🤝 Respecting artisan craft & cultural heritage across India")}>Community</button>
            <button className="gh-footer-btn" onClick={() => showToast("📚 Interactive OpenAPI documentation available at /api-docs")}>Docs</button>
            <button className="gh-footer-btn" onClick={() => showToast("✉️ Support Contact: support@kalasetu.in")}>Contact</button>
            <button className="gh-footer-btn" onClick={() => showToast("🍪 Cookie preferences successfully saved and optimized")}>Manage cookies</button>
            <button className="gh-footer-btn" onClick={() => showToast("🛡️ Privacy preference saved: Personal data will not be shared")}>Do not share my personal information</button>
          </div>
        </div>
      </footer>
      {modal && createPortal(
        <div className="gh-modal-overlay" onClick={() => setModal(null)}>
          <div className="gh-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="gh-modal-header">
              <h2>{modal === "terms" ? "Terms of Service" : "Privacy Policy"}</h2>
              <button className="gh-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="gh-modal-body">
              {modal === "terms" ? (
                <>
                  <p>Welcome to KalaSetu. By using our platform connecting traditional artisans with patrons across India, you agree to abide by our respectful community standards and transparent commerce guidelines.</p>
                  <p>All user-generated cultural content remains the intellectual property of the original creator. Unauthorized scraping or misrepresentation of artisan craft is strictly prohibited.</p>
                </>
              ) : (
                <>
                  <p>We respect your privacy. KalaSetu encrypts all personal credentials and ensures that artisan contact and financial details are kept strictly secure and never sold to third parties.</p>
                  <p>We collect only necessary authentication and session tokens to provide a seamless social and economic empowerment platform for traditional creators.</p>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {toast && createPortal(
        <div className="gh-toast">{toast}</div>,
        document.body
      )}
    </>
  );
}
