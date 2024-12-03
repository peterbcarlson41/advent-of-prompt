// app/api/weather/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    const weatherUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2023-01-01&end_date=2023-12-31&daily=snowfall_sum&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // Get location name again for confirmation
    const reverseGeoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}`;
    const geoResponse = await fetch(reverseGeoUrl);
    const geoData = await geoResponse.json();

    const locationName = geoData.results?.[0]
      ? [
          geoData.results[0].name,
          geoData.results[0].admin1,
          geoData.results[0].country_code,
        ]
          .filter(Boolean)
          .join(", ")
      : `${lat}°N, ${lon}°W`;

    const snowfallData = weatherData.daily.snowfall_sum;
    const totalSnowfall = snowfallData.reduce(
      (sum, val) => sum + (val || 0),
      0
    );
    const daysWithSnow = snowfallData.filter((val) => val > 0).length;
    const averageSnowfall = totalSnowfall / 365;

    const processedData = {
      location: locationName,
      coordinates: {
        latitude: lat,
        longitude: lon,
      },
      snowData: {
        totalAnnualSnowfall: totalSnowfall.toFixed(1),
        daysWithSnow,
        averageDailySnowfall: averageSnowfall.toFixed(1),
        unit: "cm",
      },
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
