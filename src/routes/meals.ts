import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  
  app.post('/', {preHandler:[checkSessionIdExists]}, async (request, reply) => {
    
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      onDiet: z.boolean(),
    })

    const validationResult = createMealBodySchema.safeParse(request.body)

    if (!validationResult.success) {
      return reply.status(400).send({
        message: validationResult.error.errors,
      })
    }

    const { name, description, date, time, onDiet } = validationResult.data

    const { sessionId } = request.cookies

    const isUserCreated = await knex('users')
      .select('id')
      .where({ session_id: sessionId })
      .first()

    if(!isUserCreated){
      return reply.status(404).send({
        message: 'User not Found'
      })
    }

    await knex('meals')
      .insert({
        id: randomUUID(),
        name,
        description,
        date: date,
        time,
        on_diet: onDiet,
        user_id: isUserCreated.id,
      })
    

    reply.status(201).send()
    
  })

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const editMealParams = z.object({
        id: z.string(),
      })

      const editMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        onDiet: z.boolean().optional(),
      })

      const validationResult = editMealBodySchema.safeParse(request.body)

      if (!validationResult.success) {
        return reply.status(400).send({
          message: validationResult.error.errors,
        })
      }

      const { id } = editMealParams.parse(request.params)
      const { name, description, date, time, onDiet } = validationResult.data

      const meal = await knex('meals')
        .select('*')
        .where({ id })
        .first()
        .update({
          name,
          description,
          date: date,
          time,
          on_diet: onDiet,
        })
        .returning('*')

      reply.status(202).send({ meal })
    },
  )
  
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const isUserCreated = await knex('users')
      .select('id')
      .where({ session_id: sessionId })
      .first()

    if(!isUserCreated){
      return reply.status(404).send({
        message: 'User not Found'
      })
    }

      const meals = await knex('meals')
        .select('*')
        .where({ user_id: isUserCreated.id })
        .orderBy('date', 'desc')

      reply.status(200).send({ meals })
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteMealParams = z.object({
        id: z.string(),
      })

      const { sessionId } = request.cookies

      const isUserCreated = await knex('users')
      .select('id')
      .where({ session_id: sessionId })
      .first()

    if(!isUserCreated){
      return reply.status(404).send({
        message: 'User not Found'
      })
    }
   
    const { id } = deleteMealParams.parse(request.params)

    const meal = await knex('meals')
    .select('*')
    .where({ id, user_id: isUserCreated.id })
    .first()

    if(!meal){
      return reply.status(404).send({
        message: 'Meal not Found'
      })
    }

      await knex('meals').where({ id }).del()

      reply.status(204).send()
    },
  )
  
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParams = z.object({
        id: z.string(),
      })

      const { id } = getMealParams.parse(request.params)

      const { sessionId } = request.cookies

      const isUserCreated = await knex('users')
      .select('id')
      .where({ session_id: sessionId })
      .first()

    if(!isUserCreated){
      return reply.status(404).send({
        message: 'User not Found'
      })
    }

    const meal = await knex('meals')
      .select('*')
      .where({ id, user_id: isUserCreated.id })
      .first()

    if(!meal){
      return reply.status(404).send({
        message: 'Meal not Found'
      })
    }

      reply.status(200).send({ meal })
    },
  )

}
