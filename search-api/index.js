import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// URLs de las APIs (configurables por variables de entorno)
const EMPLOYEES_API_URL = process.env.EMPLOYEES_API_URL || "http://localhost:8001";
const FLIGHTS_API_URL = process.env.FLIGHTS_API_URL || "http://localhost:8002";
const SPACEMISSIONS_API_URL = process.env.SPACEMISSIONS_API_URL || "http://localhost:8003";

app.get("/api/v1/search", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "Missing 'city' query parameter" });
  }

  try {
    const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cityRegex = new RegExp(`^${escapedCity}$`, "i");

    // Llamadas paralelas a las 3 APIs
    const [employeesRes, flightsRes, spacemissionsRes] = await Promise.all([
      fetch(`${EMPLOYEES_API_URL}/api/v1/employees`),
      fetch(`${FLIGHTS_API_URL}/api/v1/flight`),
      fetch(`${SPACEMISSIONS_API_URL}/api/v1/spacemissions`)
    ]);

    const allEmployees = await employeesRes.json();
    const allFlights = await flightsRes.json();
    const allSpacemissions = await spacemissionsRes.json();

    // Filtrar por ciudad en memoria (misma lógica que antes)
    const employees = allEmployees.filter(e => cityRegex.test(e.city));
    const flights = allFlights.filter(f =>
      cityRegex.test(f.departure?.city) || cityRegex.test(f.arrival?.city)
    );
    const spacemissions = allSpacemissions.filter(s =>
      cityRegex.test(s.launch?.city)
    );

    res.json({
      query: city,
      results: {
        employees,
        flights,
        spacemissions
      }
    });
  } catch (err) {
    console.error("Error during search:", err.message);
    res.status(500).json({ error: "Error during search" });
  }
});

app.listen(port, () => {
  console.log(`Search API listening on port ${port}`);
});
