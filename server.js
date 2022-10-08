const express = require('express')
const path = require('path')

const app = express()
const port = 3000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

const sqlite3 = require('sqlite3').verbose();
const dbpath = path.join(__dirname, 'db', 'user.db')
const db = new sqlite3.Database(dbpath);


app.get('/', (req, res) => {
    db.all('SELECT * FROM users', (err, data) => {
        if (err) return res.render('index', { suscces: false })
        res.render('index', { data })
    })
});
// edit
app.get('/add', (req, res) => {
    res.render('add')
})
app.post('/add', (req, res) => {
    db.run('INSERT INTO users(strings, integers, floats, dates , booleans) VALUES (?, ?, ?, ?, ?)', [req.body.strings, req.body.integers, req.body.floats, req.body.datas, req.body.boolean], (err) => {
        callback(err)
    })
    res.redirect('/');
})


app.get('/delete/:id', (req, res) => {
    const index = req.params.id
    data.splice(index, 1);
    fs.writeFileSync('data.json', JSON.stringify(data));
    res.redirect('/');
})
// app.get('/edit', (req, res) => {
//     res.render('edit')
// })
// app.get('/edit/:id', (req, res) => {
//     const id = req.params.id
//     res.render('edit', { item: data[id] })
// })

// app.post('/edit/:id', (req, res) => {
//     data[req.params.id] = { string: req.body.string, integer: parseInt(req.body.integer), float: parseFloat(req.body.float), date: req.body.date, boolean: JSON.parse(req.body.boolean) }
//     fs.writeFileSync('data.json', JSON.stringify(data, null, 3))
//     res.redirect('/')
// })
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})