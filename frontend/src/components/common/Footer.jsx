import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import kalasetuLogo from "../../assets/kalasetu_logo.png";

export default function Footer() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [email, setEmail] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast("✨ Thank you for joining the KalaSetu cultural newsletter!");
    setEmail("");
  };

  return (
    <>
      <footer className="ks-footer">
        <div className="ks-footer-top">
          <div className="ks-footer-brand">
            <div className="ks-footer-logo-row" onClick={() => { window.scrollTo(0, 0); navigate("/"); }}>
              <img src={kalasetuLogo} alt="KalaSetu Logo" className="ks-footer-logo" />
              <span className="ks-footer-title">KalaSetu</span>
            </div>
            <p className="ks-footer-tagline">
              Bridging traditional Indian craftsmanship with modern digital patronage. Empowering rural artisans and heritage NGOs across the nation through community storytelling.
            </p>
            <form onSubmit={handleSubscribe} className="ks-newsletter-form">
              <input
                type="email"
                placeholder="Stay updated on cultural workshops..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ks-newsletter-input"
              />
              <button type="submit" className="ks-newsletter-btn">Subscribe</button>
            </form>
          </div>

          <div className="ks-footer-cols">
            <div className="ks-footer-col">
              <h4>Explore Culture</h4>
              <button onClick={() => { window.scrollTo(0, 0); navigate("/search"); }}>Artisan Directory</button>
              <button onClick={() => { window.scrollTo(0, 0); navigate("/"); }}>Cultural Feed</button>
              <button onClick={() => showToast("📅 Upcoming Heritage Workshops and Exhibitions will be showcased soon!")}>Events &amp; Exhibitions</button>
              <button onClick={() => showToast("🏺 Traditional Indian Craftsmanship Index: Handloom, Pottery, Terracotta & Woodwork")}>Craft Categories</button>
            </div>

            <div className="ks-footer-col">
              <h4>NGOs &amp; Impact</h4>
              <button onClick={() => showToast("🤝 Connecting grassroots non-profits with verified traditional artists.")}>NGO Network</button>
              <button onClick={() => showToast("📜 KalaSetu Craft Preservation Initiative: Supporting endangered art forms.")}>Heritage Grants</button>
              <button onClick={() => showToast("📈 Real-time social impact metrics tracked across 28 states.")}>Impact Report</button>
              <button onClick={() => showToast("🏛️ Institutional Collaborations & Ministry of Culture alignment.")}>Partner with Us</button>
            </div>

            <div className="ks-footer-col">
              <h4>Trust &amp; Safety</h4>
              <button onClick={() => setModal("guidelines")}>Community Guidelines</button>
              <button onClick={() => setModal("privacy")}>Privacy Policy</button>
              <button onClick={() => setModal("terms")}>Terms of Service</button>
              <button onClick={() => showToast("💬 Grievance & Creator Support: support@kalasetu.in")}>Help &amp; Support</button>
            </div>
          </div>
        </div>

        <div className="ks-footer-bottom">
          <div className="ks-footer-copyright">
            <span>&copy; {new Date().getFullYear()} KalaSetu Foundation. Made with pride in India for cultural heritage preservation.</span>
          </div>
          <div className="ks-footer-social">
            <button onClick={() => showToast("📸 Follow our artisan showcases on Instagram: @kalasetu.in")} aria-label="Instagram"><i className="fi fi-sr-camera" /></button>
            <button onClick={() => showToast("📘 Join our NGO partner network on Facebook")} aria-label="Facebook"><i className="fi fi-sr-social-network" /></button>
            <button onClick={() => showToast("▶️ Watch heritage documentary shorts on our YouTube channel")} aria-label="YouTube"><i className="fi fi-sr-play-alt" /></button>
            <button onClick={() => showToast("💼 Connect with institutional patrons on LinkedIn")} aria-label="LinkedIn"><i className="fi fi-sr-briefcase" /></button>
          </div>
        </div>
      </footer>

      {modal && createPortal(
        <div className="ks-modal-overlay" onClick={() => setModal(null)}>
          <div className="ks-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ks-modal-header">
              <h2 className="display-serif">
                {modal === "guidelines" ? "Community Guidelines" : modal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </h2>
              <button className="ks-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="ks-modal-body">
              {modal === "guidelines" && (
                <>
                  <p><strong>1. Respect for Traditional Heritage:</strong> KalaSetu is a sanctuary for authentic Indian arts, crafts, and performing traditions. All members are expected to interact with dignity and respect towards creators.</p>
                  <p><strong>2. Authentic Representation:</strong> Artisans and NGOs must accurately represent their location, heritage art form, and community impact. Misrepresentation or cultural appropriation is strictly prohibited.</p>
                  <p><strong>3. Fair Collaboration:</strong> All communications between patrons, NGOs, and individual creators must adhere to ethical standards of transparency and mutual growth.</p>
                </>
              )}
              {modal === "privacy" && (
                <>
                  <p><strong>Protecting Creator Privacy:</strong> KalaSetu treats the contact information, geographical origin, and financial details of rural artisans and non-profits with paramount security.</p>
                  <p><strong>Data Minimization:</strong> We only collect necessary authentication data to facilitate community discovery and direct secure communications. Your personal data is never sold to marketing aggregators or third parties.</p>
                </>
              )}
              {modal === "terms" && (
                <>
                  <p><strong>Platform Purpose:</strong> KalaSetu operates as a dedicated bridge for cultural preservation and empowerment. By registering as an Artisan, NGO, or enthusiast, you agree to foster non-commercial exploitation and uphold the integrity of our cultural archive.</p>
                  <p><strong>Intellectual Property:</strong> All photos, stories, and artworks posted remain the absolute copyright of the respective creators. KalaSetu is granted a non-exclusive license solely to display and promote these works within our community ecosystem.</p>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className="ks-toast">
          <span className="ks-toast-icon">✨</span>
          <span>{toast}</span>
        </div>,
        document.body
      )}
    </>
  );
}
