import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );

    res.json({
      list: response.data.list,
      city: response.data.city.name,
      country: response.data.city.country
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching weather" });
  }
});

export default router;
