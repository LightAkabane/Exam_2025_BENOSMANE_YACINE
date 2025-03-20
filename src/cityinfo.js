// cityinfo.js
import { recipesStore } from './recipes.js';

export async function cityinfo(request, reply) {
  const { cityId } = request.params;
  const apiKey = process.env.API_KEY;

  try {
    // 1. Récupération des insights de la ville (population, knownFor, coordinates)
    const insightsUrl = `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}/insights?apiKey=${apiKey}`;
    const insightsResponse = await fetch(insightsUrl);
    if (!insightsResponse.ok) {
      reply.code(insightsResponse.status);
      return await insightsResponse.json();
    }
    const insights = await insightsResponse.json();

    // 2. Récupération des prévisions météo
    const weatherUrl = `https://api-ugi2pflmha-ew.a.run.app/weather-predictions?cityId=${cityId}&apiKey=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      reply.code(weatherResponse.status);
      return await weatherResponse.json();
    }
    const weatherDataArray = await weatherResponse.json();
    let weather = [];
    if (weatherDataArray.length > 0 && weatherDataArray[0].predictions) {
      const predictions = weatherDataArray[0].predictions;
      const today = predictions.find(p => p.when === 'today');
      const tomorrow = predictions.find(p => p.when === 'tomorrow');
      if (today) weather.push({ when: 'today', min: today.min, max: today.max });
      if (tomorrow) weather.push({ when: 'tomorrow', min: tomorrow.min, max: tomorrow.max });
    }

    // 3. Récupération des détails de la ville via le endpoint /cities
    const citiesUrl = `https://api-ugi2pflmha-ew.a.run.app/cities?apiKey=${apiKey}`;
    const citiesResponse = await fetch(citiesUrl);
    if (!citiesResponse.ok) {
      reply.code(citiesResponse.status);
      return await citiesResponse.json();
    }
    const citiesData = await citiesResponse.json();
    const cityDetails = citiesData.find(city => city.id === cityId);
    if (!cityDetails) {
      reply.code(404);
      return { success: false, error: "Ville non trouvée dans la liste des villes" };
    }

    // 4. Récupération des recettes associées à la ville depuis le store (vide par défaut)
    const recipes = recipesStore[cityId] || [];

    // Assemblage de la réponse finale avec le format attendu
    const response = {
      id: cityId,
      name: cityDetails.name,
      country: cityDetails.country,
      population: insights.population,
      knownFor: insights.knownFor,
      coordinates: {
        latitude: insights.coordinates.latitude,
        longitude: insights.coordinates.longitude
      },
      weather: weather,
      recipes: recipes
    };

    return response;
  } catch (error) {
    reply.code(500);
    return { success: false, error: error.message };
  }
}
