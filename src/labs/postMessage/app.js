const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()

const port = 3000

app.get('/', (req, res) => {
  res.send(
    fs.readFileSync(path.resolve(process.cwd(), 'remote.html')).toString()
  )
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
