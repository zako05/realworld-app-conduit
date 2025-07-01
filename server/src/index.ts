import express from 'express'
import http from 'http'
import cors from 'cors'
import mongoose from 'mongoose'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { gql } from 'graphql-tag'

const typeDefs = gql`
  type Query {
    hello: String
  }
`

const resolvers = {
  Query: {
    hello: () => 'Hello from the GraphQL server!',
  },
}

const startServer = async () => {
  const app = express()
  const httpServer = http.createServer(app)
  const port = 4000

  const MONGO_URI = 'mongodb://127.0.0.1:27017/realworld_db'

  try {
    await mongoose.connect(MONGO_URI)
    console.log('🔌 Connected to MongoDB')
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err)
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  await server.start()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server),
  )

  await new Promise<void>(resolve => httpServer.listen({ port }, resolve))

  console.log(`🚀 Server ready at http://localhost:${port}/graphql`)
}

startServer()
