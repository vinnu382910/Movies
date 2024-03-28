const express = require('express')
const app = express()

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = (__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server  Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//1.Get all movie from movie table

const converDbObjToResponseObj = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT movie_name FROM movie ORDER BY movie_id;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => converDbObjToResponseObj(eachMovie)),
  )
})

//2.Post movie in movie table

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovieQuery = `
  INSERT INTO movie (director_id, movie_name, lead_actor) 
  VALUES (${directorId}, '${movieName}', '${leadActor}');`
  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//3. Get movie based on moviId

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  response.send(converDbObjToResponseObj(movie))
})

//4. Put movie details based on movie_id

app.put('/movies/:movieId', async (request, response) => {
  const {bookId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
  UPDATE movie 
  SET director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
  WHERE book_id = ${bookId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Up')
})
