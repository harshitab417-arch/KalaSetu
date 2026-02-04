import "./Catalog.css";
import { useNavigate } from "react-router-dom";

/* This should be PlanCard, not Catalog */
function PlanCard({
  title,
  price,
  duration,
  features,
  buttonText,
  highlight,
  badge
}) {
  return (
    <div className={`plan-card ${highlight ? "highlight" : ""}`}>
      {badge && <div className="badge">{badge}</div>}

      <h2>{title}</h2>
      <h1 className="price">
        ₹{price} <span>/{duration}</span>
      </h1>

      <ul>
        {features.map((feature, index) => (
          <li key={index}>✔ {feature}</li>
        ))}
      </ul>

      <button className="plan-btn">{buttonText}</button>
    </div>
  );
}

/* This is your main page component */
function Catalog() {
  const navigate = useNavigate();

  return (
    <div className="plans-bg">
      <nav className="navbar">
        <h1 onClick={() => navigate("/")}>KalaSetu</h1>
        <button onClick={() => navigate("/home")}>Back</button>
      </nav>

      <div className="plans-header">
        <h1>Simple Plans for Everyone</h1>
        <p>Grow your talent and get noticed in your city.</p>
      </div>

      <div className="plans-container">

        <PlanCard
          title="Explorer"
          price="0"
          duration="life"
          features={[
            "Look for any Artist",
            "Chat with Creators",
            "Save your Favorites",
            "Cannot Post Skills"
          ]}
          buttonText="Using This Now"
        />

        <PlanCard
          title="Artisan"
          price="99"
          duration="mo"
          features={[
            "Show 5 Works every month",
            "Upload High Quality Videos",
            "Your own Artist Profile",
            "See who viewed your page",
            "Join Local Events"
          ]}
          buttonText="Start Posting"
          highlight={true}
          badge="Best for Artists"
        />

        <PlanCard
          title="Patron Pro"
          price="199"
          duration="mo"
          features={[
            "Post Unlimited Times",
            "Golden Verified Badge",
            "Stay at the Top Search",
            "Get Weekly Reports on Fans",
            "No Ads on your Profile"
          ]}
          buttonText="Get Full Power"
          badge="Top Tier"
        />

      </div>
    </div>
  );
}

export default Catalog;
