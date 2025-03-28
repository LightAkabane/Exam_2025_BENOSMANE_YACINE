import 'dotenv/config'
import Fastify from 'fastify'
import { submitForReview } from './submission.js'
import { cityinfo } from "./cityinfo.js";
import { postrecipes } from "./postrecipes.js";
import { removerecipes } from "./removerecipes.js";
const fastify = Fastify({
  logger: true,
})

fastify.get("/cities/:cityId/infos", cityinfo);
fastify.post("/cities/:cityId/recipes", postrecipes);
fastify.delete("/cities/:cityId/recipes/:recipeId", removerecipes);
fastify.listen(
  {
    port: process.env.PORT || 3000,
    host: process.env.RENDER_EXTERNAL_URL ? '0.0.0.0' : process.env.HOST || 'localhost',
  },
  function (err) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }

    //////////////////////////////////////////////////////////////////////
    // Don't delete this line, it is used to submit your API for review //
    // everytime your start your server.                                //
    //////////////////////////////////////////////////////////////////////
    submitForReview(fastify)
  }
)
