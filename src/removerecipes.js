// removerecipes.js
import fetch from 'node-fetch'; // Utilisez fetch natif si Node 18+ est disponible
import { recipesStore } from './recipes.js';

export async function removerecipes(request, reply) {
  const { cityId, recipeId } = request.params;
  const apiKey = process.env.API_KEY;

  // Vérification de l'existence de la ville via la City API
  const cityUrl = `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}/insights?apiKey=${apiKey}`;
  let cityResponse;
  try {
    cityResponse = await fetch(cityUrl);
  } catch (error) {
    reply.code(500);
    return { success: false, error: "Erreur lors de la vérification de la ville" };
  }
  if (!cityResponse.ok) {
    reply.code(404);
    return { success: false, error: "Ville non trouvée" };
  }

  // Vérification de l'existence de la recette dans le store en mémoire
  const recipes = recipesStore[cityId];
  if (!recipes) {
    reply.code(404);
    return { success: false, error: "Aucune recette trouvée pour cette ville" };
  }

  // Recherche de la recette par son identifiant (en convertissant recipeId en nombre)
  const recipeIndex = recipes.findIndex(recipe => recipe.id === parseInt(recipeId, 10));
  if (recipeIndex === -1) {
    reply.code(404);
    return { success: false, error: "Recette non trouvée" };
  }

  // Suppression de la recette du tableau
  recipes.splice(recipeIndex, 1);
  
  // Réponse avec le status "no content"
  reply.code(204).send();
}
