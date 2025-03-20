// cityinfo.js
import { recipesStore } from './recipes.js';

export async function cityinfo(request, reply) {
  try {
    const { cityId } = request.params;
    const apiKey = process.env.API_KEY;

    // 1) Récupérer les infos de la ville via /cities/:cityId/insights
    const cityResponse = await fetch(
      `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}/insights?apiKey=${apiKey}`
    );
    if (!cityResponse.ok) {
      return reply
        .status(404)
        .send({ error: `City with id "${cityId}" not found` });
    }
    const cityData = await cityResponse.json();
    // cityData devrait contenir : { coordinates: { latitude, longitude }, population, knownFor }

    // 2) Récupérer la météo via /weather-predictions
    const weatherResponse = await fetch(
      `https://api-ugi2pflmha-ew.a.run.app/weather-predictions?cityId=${cityId}&apiKey=${apiKey}`
    );
    if (!weatherResponse.ok) {
      return reply
        .status(500)
        .send({ error: `Failed to fetch weather for city "${cityId}"` });
    }
    const weatherData = await weatherResponse.json();
    // weatherData est supposé être un tableau, généralement avec weatherData[0] contenant l'objet recherché
    const cityWeather = weatherData[0];
    if (
      !cityWeather ||
      !cityWeather.predictions ||
      cityWeather.predictions.length < 2
    ) {
      return reply
        .status(500)
        .send({ error: `Weather data format invalid for city "${cityId}"` });
    }
    // On suppose que l'ordre des prédictions est "today" puis "tomorrow"
    const [today, tomorrow] = cityWeather.predictions;

    // 3) Construire la réponse attendue
    const responsePayload = {
      // Transformation des coordonnées en tableau [latitude, longitude]
      coordinates: [
        cityData.coordinates.latitude,
        cityData.coordinates.longitude,
      ],
      population: cityData.population,
      knownFor: cityData.knownFor,
      weatherPredictions: [
        { when: 'today', min: today.min, max: today.max },
        { when: 'tomorrow', min: tomorrow.min, max: tomorrow.max },
      ],
      // On renvoie les recettes associées à la ville (vide par défaut)
      recipes: recipesStore[cityId] || [],
    };

    return reply.send(responsePayload);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: error.message });
  }
}
