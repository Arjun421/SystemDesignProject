import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import resourceRoutes from './routes/resource.routes'
import bookRoutes from './routes/book.routes'
import courseRoutes from './routes/course.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/courses', courseRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
