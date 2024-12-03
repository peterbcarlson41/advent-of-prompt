// app/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const searchLocations = async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const isZipCode = /^\d{5}(-\d{4})?$/.test(input.trim());
      const searchParam = isZipCode ? `postal_code=${input}` : `name=${input}`;

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${searchParam}&count=5`
      );
      const data = await response.json();

      if (data.results) {
        const formattedSuggestions = data.results.map((location) => ({
          ...location,
          displayName: [location.name, location.admin1, location.country_code]
            .filter(Boolean)
            .join(", "),
        }));
        setSuggestions(formattedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleLocationSelect = async (location) => {
    setQuery(location.displayName);
    setSuggestions([]); // Clear suggestions after selection
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/weather?lat=${location.latitude}&lon=${location.longitude}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch weather data");
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Annual Snowfall Data</h1>

      <div className={styles.searchContainer} ref={dropdownRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city, state, country, or zip code"
          className={styles.input}
        />

        {suggestions.length > 0 && (
          <ul className={styles.suggestions}>
            {suggestions.map((location) => (
              <li
                key={`${location.latitude}-${location.longitude}`}
                onClick={() => handleLocationSelect(location)}
                className={styles.suggestionItem}
              >
                {location.displayName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p>Loading weather data...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {weatherData && (
        <div className={styles.result}>
          <h2>Results for {weatherData.location}</h2>
          <p>
            Coordinates: {weatherData.coordinates.latitude}°N,{" "}
            {weatherData.coordinates.longitude}°W
          </p>
          <div className={styles.snowData}>
            <p>
              Total Annual Snowfall: {weatherData.snowData.totalAnnualSnowfall}{" "}
              cm
            </p>
            <p>Days with Snow: {weatherData.snowData.daysWithSnow}</p>
            <p>
              Average Daily Snowfall:{" "}
              {weatherData.snowData.averageDailySnowfall} cm
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
