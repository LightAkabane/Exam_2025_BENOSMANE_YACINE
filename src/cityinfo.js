// cityinfo.js
import fetch from 'node-fetch'; // Si vous êtes sur Node <18, sinon utilisez la global fetch
import { recipesStore } from './recipes.js'; // Ce module doit exporter un objet mutable pour stocker les recettes

export async function cityinfo(request, reply) {
  // Récupération du paramètre cityId depuis l'URL
  const { cityId } = request.params;
  const apiKey = process.env.API_KEY;

  try {
    // Récupération des informations de la ville via City API
    const cityUrl = `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}/insights?apiKey=${apiKey}`;
    const cityResponse = await fetch(cityUrl);
    
    // Si la réponse n'est pas OK (ex: ville inexistante), on renvoie l'erreur
    if (!cityResponse.ok) {
      reply.code(cityResponse.status);
      return await cityResponse.json();
    }
    
    const cityData = await cityResponse.json();
    // Transformation des coordonnées : de { latitude, longitude } vers [latitude, longitude]
    const coordinates = [cityData.coordinates.latitude, cityData.coordinates.longitude];
    const population = cityData.population;
    const knownFor = cityData.knownFor;
    
    // Récupération des prévisions météo via Weather API
    const weatherUrl = `https://api-ugi2pflmha-ew.a.run.app/weather-predictions?cityId=${cityId}&apiKey=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      reply.code(weatherResponse.status);
      return await weatherResponse.json();
    }
    
    const weatherDataArray = await weatherResponse.json();
    let weatherPredictions = [];
    
    // On s'assure d'extraire les prévisions pour "today" et "tomorrow"
    if (weatherDataArray.length > 0 && weatherDataArray[0].predictions) {
      const predictions = weatherDataArray[0].predictions;
      const today = predictions.find(pred => pred.when === 'today');
      const tomorrow = predictions.find(pred => pred.when === 'tomorrow');
      
      if (today) weatherPredictions.push({ when: 'today', min: today.min, max: today.max });
      if (tomorrow) weatherPredictions.push({ when: 'tomorrow', min: tomorrow.min, max: tomorrow.max });
    }
    
    // Récupération des recettes associées à la ville depuis le store (vide par défaut)
    const recipes = recipesStore[cityId] || [];
    
    // Assemblage de la réponse au format demandé
    const response = {
      coordinates,
      population,
      knownFor,
      weatherPredictions,
      recipes,
    };
    
    return response;
  } catch (error) {
    reply.code(500);
    return { success: false, error: error.message };
  }
}
