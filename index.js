const express = require('express')

const app = express()

app.get('/api', (req, res) =>
  res.json({ message: 'This is the 2-factor authentication eg.' })
)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
