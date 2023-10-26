import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    //Getting user data and validating it with zod
    const createUserBodySchema = z.object({
      firstName: z.string(),
      lastName: z.string(),
      photoUrl: z.string().url()
    })

    //Validating request.body in order to see if follows the validation schema criteria
    const { firstName, lastName, photoUrl } = createUserBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      first_name: firstName,
      last_name: lastName,
      photo_url: photoUrl,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const { id } = await knex('users')
        .select('id')
        .where({ session_id: sessionId })
        .first()

      const meals = await knex('meals')
        .select('on_diet')
        .where({ user_id: id })

      let bestSequence = 0
      let currentSequence = 0

      for (const meal of meals) {
        if (meal.on_diet === 1) {
          currentSequence++
          bestSequence = Math.max(bestSequence, currentSequence)
        } else {
          currentSequence = 0
        }
      }

      const onDiet = meals.filter((meal) => meal.on_diet).length

      const metrics = {
        total: meals.length,
        onDiet,
        offDiet: meals.length - onDiet,
        bestSequence,
      }
      return { metrics }
    },
  )
}
