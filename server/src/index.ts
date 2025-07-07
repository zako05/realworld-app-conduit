import express from "express";
import http from "http";
import cors from "cors";
import mongoose, { Document } from "mongoose";
import process from "process";
import * as dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { gql } from "graphql-tag";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

import User from "./models/User";

dotenv.config({ path: process.env.ENV_FILE ?? ".env" });

interface UserDocument extends Document {
  comparePassword: (password: string) => Promise<boolean>;
  id: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
}

interface MyContext {
  user?: UserDocument | null;
}

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    bio: String
    image: String
    token: String!
  }

  type Query {
    hello: String
    currentUser: User
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!): User
    loginUser(email: String!, password: String!): User
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello from the GraphQL server!",
    currentUser: async (_, __, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated!", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return {
        id: context.user.id,
        username: context.user.username,
        email: context.user.email,
        bio: context.user.bio,
        image: context.user.image,
        token: jwt.sign(
          {
            id: context.user.id,
            email: context.user.email,
          },
          process.env.JWT_SECRET || "YOUR_SECRET_KEY",
          { expiresIn: "1h" },
        ),
      };
    },
  },
  Mutation: {
    registerUser: async (_, { username, email, password }) => {
      if (!username || !email || !password) {
        throw new GraphQLError("Username, email, and password are required!");
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new GraphQLError("Invalid email format!");
      }

      if (!/^[a-zA-Z0-9]+$/.test(username)) {
        throw new GraphQLError(
          "Username can only contain letters and numbers!",
        );
      }

      if (password.length < 8) {
        throw new GraphQLError("Password must be at least 8 characters long!");
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new GraphQLError(
          "Password must contain at least one uppercase letter, one lowercase letter, and one number!",
        );
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        throw new GraphQLError(
          "User with this email or username already exists!",
        );
      }

      const user = new User({ username, email, password });
      await user.save();

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET || "YOUR_SECRET_KEY",
        { expiresIn: "1h" },
      );

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        token,
      };
    },
    loginUser: async (_, { email, password }) => {
      const user = (await User.findOne({ email })) as UserDocument | null;
      if (!user) {
        throw new GraphQLError("No user found with this email address.");
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new GraphQLError("Invalid password!");
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET || "YOUR_SECRET_KEY",
        { expiresIn: "1h" },
      );

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        token,
      };
    },
  },
};

const startServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const port = process.env.PORT || 4000;

  const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/realworld_db";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  }

  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || "";

        if (authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7, authHeader.length);

          if (!token || token.trim() === "") {
            return { user: null };
          }

          try {
            const decoded = jwt.verify(
              token,
              process.env.JWT_SECRET || "YOUR_SECRET_KEY",
            ) as {
              id: string;
            };
            const user = (await User.findById(
              decoded.id,
            )) as UserDocument | null;

            return { user };
          } catch (err) {
            console.log("Invalid token!");
          }
        }

        return { user: null };
      },
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));

  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
};

startServer();
