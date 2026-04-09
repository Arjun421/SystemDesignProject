import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import passport from 'passport'
import './config/passport'
import authRoutes from './routes/auth.routes'
import resourceRoutes from './routes/resource.routes'
import bookRoutes from './routes/book.routes'
import courseRoutes from './routes/course.routes'
import learningPathRoutes from './routes/learning-path.routes'
import recommendationRoutes from './routes/recommendation.routes'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://system-design-project-5mhp.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use(passport.initialize())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/learning-paths', learningPathRoutes)
app.use('/api/recommendations', recommendationRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
