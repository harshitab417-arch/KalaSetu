{/*
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/signin");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);


  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (!user) return null;

  return (
    <div className="home-bg">
      <nav className="navbar">
        <h1 className="brand-title">KalaSetu</h1>
        <div className="nav-buttons">
          {user.role !== "user" && (
            <button>Create Post</button>
          )}
          {user.role === "user" && (
            <button onClick={() => navigate("/register")}>
              Register
            </button>
          )}
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => navigate("/weather")}>
            Weather
          </button>

        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="card home-card mb-4">
          <h3>Welcome, {user.username} 👋</h3>
          <p>
            Explore cultural stories, artisans, and upcoming events.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
*/}




import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Line
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import "./Home.css";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const [showWeatherInput, setShowWeatherInput] = useState(false);
  const [city, setCity] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/signin");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchWeatherByCity = async (cityName) => {
    if (!cityName) {
      alert("Please enter a city name");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/weather?city=${cityName}`
      );

      const list = res.data.list.slice(0, 8);

      setLocationName(`${res.data.city}, ${res.data.country}`);
      setCurrentDate(new Date().toDateString());

      setWeatherData({
        labels: list.map(item =>
          new Date(item.dt * 1000).getHours() + ":00"
        ),
        temp: list.map(item => item.main.temp),
        humidity: list.map(item => item.main.humidity),
        wind: list.map(item => item.wind.speed),
      });

      //setShowWeatherInput(false);

    } catch (err) {
      alert("City not found or weather fetch failed");
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" }
    }
  };

  const createChartData = (label, data, color) => ({
    labels: weatherData.labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
      },
    ],
  });

  if (!user) return null;

  return (
    <div className="home-bg">

      <nav className="navbar">
        <h1 className="brand-title">KalaSetu</h1>

        <div className="nav-buttons">

          {user.role === "user" && (
            <button onClick={() => navigate("/register")}>
              Register
            </button>
          )}

          {user.role !== "user" && (
            <button>Create Post</button>
          )}

          <button onClick={() => setShowWeatherInput(true)}>
            Weather
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>
      </nav>

      <div className="container-fluid py-4">

        <div className="card home-card mb-4">
          <h3>Welcome, {user.username} 👋</h3>
          <p>Explore cultural stories and weather updates in your region.</p>
        </div>

        {showWeatherInput && (
          <div className="weather-search-card">
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button onClick={() => fetchWeatherByCity(city)}>
              Get Weather
            </button>
          </div>
        )}

        {weatherData && (
          <>
            <div className="weather-info-card">
              <h4>📍 {locationName}</h4>
              <p>📅 {currentDate}</p>
            </div>

            <div className="weather-grid">

              <div className="weather-card">
                <h4>🌡 Temperature (°C)</h4>
                <Line
                  data={createChartData(
                    "Temperature",
                    weatherData.temp,
                    "orange"
                  )}
                  options={chartOptions}
                />
              </div>

              <div className="weather-card">
                <h4>💧 Humidity (%)</h4>
                <Line
                  data={createChartData(
                    "Humidity",
                    weatherData.humidity,
                    "blue"
                  )}
                  options={chartOptions}
                />
              </div>

              <div className="weather-card">
                <h4>🌬 Wind Speed (m/s)</h4>
                <Line
                  data={createChartData(
                    "Wind Speed",
                    weatherData.wind,
                    "green"
                  )}
                  options={chartOptions}
                />
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Home;
