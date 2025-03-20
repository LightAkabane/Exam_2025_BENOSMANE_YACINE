// postrecipes.js
// Plus besoin d'importer node-fetch avec Node 18+
import { recipesStore } from './recipes.js';

let nextRecipeId = 1;

export async function postrecipes(request, reply) {
  const { cityId } = request.params;
  const { content } = request.body;
  const apiKey = process.env.API_KEY;

  // Vérification du contenu
  if (!content || typeof content !== 'string') {
    reply.code(400);
    return { success: false, error: "Le contenu de la recette est requis" };
  }
  if (content.length < 10) {
    reply.code(400);
    return { success: false, error: "Le contenu de la recette est trop court (minimum 10 caractères)" };
  }
  if (content.length > 2000) {
    reply.code(400);
    return { success: false, error: "Le contenu de la recette est trop long (maximum 2000 caractères)" };
  }

  // Vérification de l'existence de la ville via la City API
  const cityUrl = `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}/insights?apiKey=${apiKey}`;
  let cityResponse;
  try {
    cityResponse = await fetch(cityUrl);
  } catch (error) {
    reply.code(500);
    return { success: false, error: "Erreur lors de la récupération des informations de la ville" };
  }
  if (!cityResponse.ok) {
    reply.code(404);
    return { success: false, error: "Ville non trouvée" };
  }

  // Création et stockage de la recette
  const recipe = {
    id: nextRecipeId++,
    content
  };

  // Initialiser le tableau de recettes pour la ville si inexistant
  if (!recipesStore[cityId]) {
    recipesStore[cityId] = [];
  }
  recipesStore[cityId].push(recipe);

  reply.code(201);
  return recipe;
}
