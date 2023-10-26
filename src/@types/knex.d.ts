import { knex } from 'knex'
import { ZodDate } from 'zod'

declare module 'knex/types/tables'{
    export interface Tables {
        users: {
            id: string
            first_name: string
            last_name: string
            photo_url: string
            created_at: string
            session_id?: string
        }

        meals: {
            id: string
            date?: string
            time?: string
            name: string
            user_id: string
            on_diet: boolean
            created_at: string
            description: string
        }
    }
}