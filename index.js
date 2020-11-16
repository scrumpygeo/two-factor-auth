const express = require('express')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

const app = express()

// middleware to allow use of app.body later when we verify token
app.use(express.json())

// initialize db
const db = new JsonDB(new Config('myDatabase', true, false, '/'))

// Register user & create temp secret (unam & pwd would go here too)
app.post('/api/register', (req, res) => {
  const id = uuid.v4()

  try {
    const path = `/user/${id}`
    const temp_secret = speakeasy.generateSecret()

    db.push(path, { id, temp_secret })
    res.json({ id, secret: temp_secret.base32 })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error generating the secret' })
  }
})

app.get('/api', (req, res) =>
  res.json({ message: 'This is the 2-factor authentication eg.' })
)

// Verify token and make secret permanent
app.post('/api/verify', (req, res) => {
  const { token, userId } = req.body

  try {
    const path = `/user/${userId}`
    const user = db.getData(path)

    const { base32: secret } = user.temp_secret

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    })

    if (verified) {
      db.push(path, { id: userId, secret: user.temp_secret })
      res.json({ verified: true })
    } else {
      res.json({ verified: false })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error finding user' })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
