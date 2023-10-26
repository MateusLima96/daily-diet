import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import request from 'supertest';
import { execSync } from 'node:child_process';
import { app } from '../src/app';

describe('Users/Meals routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new user', async () => {
     await request(app.server)
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        photoUrl: 'https://example.com/photo.jpg',
      }).expect(201);
  });

  it('should be able to get user metrics', async () => {
    // Create a user and get their session ID
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        photoUrl: 'https://example.com/photo.jpg',
      });

    const cookies = createUserResponse.get('Set-Cookie');
    
    // Add logic to create meals and associate them with the user

    await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)
      .expect(200)

  });

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
    .post('/users')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: 'https://example.com/photo.jpg',
    });

  const cookies = createUserResponse.get('Set-Cookie');
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal',
        description: 'Description',
        date: '2023-10-23',
        time: '12:00 PM',
        onDiet: true,
      }).expect(201);
  });

  it('should be able to update a meal', async () => {

    const createUserResponse = await request(app.server)
    .post('/users')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: 'https://example.com/photo.jpg',
    });

  const cookies = createUserResponse.get('Set-Cookie');
    
    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal',
        description: 'Description',
        date: '2023-10-23',
        time: '12:00 PM',
        onDiet: true,
      });

    const mealId = createMealResponse.body.id; // Update this based on your response format

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Updated meal',
      }).expect(202);
   
  });

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server)
    .post('/users')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: 'https://example.com/photo.jpg',
    });

  const cookies = createUserResponse.get('Set-Cookie');

    await request(app.server)
      .get('/meals')
      .set('Cookie', cookies).expect(200);
  });

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
    .post('/users')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: 'https://example.com/photo.jpg',
    });

  const cookies = createUserResponse.get('Set-Cookie');

  //create meal
   await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal',
        description: 'Description',
        date: '2023-10-23',
        time: '12:00 PM',
        onDiet: true,
      });

      const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies).expect(200);
    
  });

  it('should be able to delete a specific meal', async () => {
    const createUserResponse = await request(app.server)
    .post('/users')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: 'https://example.com/photo.jpg',
    });

  const cookies = createUserResponse.get('Set-Cookie');
    
    
    // Create a meal
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'New meal',
        description: 'Description',
        date: '2023-10-23',
        time: '12:00 PM',
        onDiet: true,
      });

      const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies).expect(204);
  });
});
