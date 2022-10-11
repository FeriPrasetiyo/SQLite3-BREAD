const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

const sqlite3 = require('sqlite3').verbose();
const dbpath = path.join(__dirname, 'db', 'user.db')
const db = new sqlite3.Database(dbpath);

// Tampilkan add
app.get('/add', (req, res) => {
    res.render('add')
})
// TAMBAH DATA
app.post('/add', (req, res) => {
    db.run('INSERT INTO users(strings, integers, floats, dates , booleans) VALUES (?, ?, ?, ?, ?)', [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err) => {
        if (err) return res.render({ err })
        res.redirect('/');
    })
})
// DELETE
app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.all('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) return res.render({ err })
        // res.redirect('/');
    })
    res.redirect('/');
})
// TAMPILAN EDIT
app.get('/edit/:id', (req, res) => {
    const id = req.params.id
    db.all('SELECT * FROM users WHERE id=?', [id], (err, data) => {
        if (err) console.log(err)
        res.render('edit', { item: data[0] })
    })
})
app.post('/edit/:id', (req, res) => {
    db.run('UPDATE users SET strings = ?, integers= ?, floats= ?, dates = ?, booleans = ? WHERE id = ?', [req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean, req.params.id], (err) => {
        if (err) {
            console.error(err)
        }
        res.redirect('/')
    })
})

app.get('/', (req, res) => {
    const page = req.query.page || 1
    const limit = 3;
    const offset = (page - 1) * limit
    const url = req.url == '/' ? '/?page=1' : req.url

    const posisi = []
    const values = []

    db.all('SELECT * FROM users', (err, total) => {
        if (err) {
            console.log('tidak terhubung dengan data ')
        }

        console.log(url)
        // cekbox
        if (req.query.id && req.query.idCek == 'on') {
            posisi.push(`id = ?`);
            values.push(req.query.id);
        }

        if (req.query.string && req.query.strCek == 'on') {
            posisi.push(`strings like '%' || ? || '%'`);
            values.push(req.query.string);
        }

        if (req.query.integer && req.query.intCek == 'on') {
            posisi.push(`integers like '%' || ? || '%'`);
            values.push(req.query.integer);
        }

        if (req.query.float && req.query.floatCek == 'on') {
            posisi.push(`floats like '%' || ? || '%'`);
            values.push(req.query.float);
        }
        //
        if (req.query.dateCek == 'on') {
            if (req.query.mulaiDate != '' && req.query.akhirDate != '') {
                posisi.push('dates BETWEEN ? AND ?')
                values.push(req.query.mulaiDate);
                values.push(req.query.akhirDate);
            }
            else if (req.query.mulaiDate) {
                posisi.push('dates > ?')
                values.push(req.query.mulaiDate);
            }
            else if (req.query.akhirDate) {
                posisi.push('dates < ?')
                values.push(req.query.akhirDate);
            }
        }
        if (req.query.boolean && req.query.booleanCek == 'on') {
            posisi.push(`booleans = ?`);
            values.push(req.query.boolean);
        }
        // akhir cek box
        let sql = 'SELECT COUNT(*) AS total FROM users';
        if (posisi.length > 0) {
            sql += ` WHERE ${posisi.join(' AND ')}`
        }

        db.all(sql, values, (err, data) => {
            if (err) {
                console.error(err);
            }
            const pages = Math.ceil(data[0].total / limit)

            sql = 'SELECT * FROM users'
            if (posisi.length > 0) {
                sql += ` WHERE ${posisi.join(' AND ')}`
            }
            sql += ' LIMIT ? OFFSET ?';

            db.all(sql, [...values, limit, offset], (err, data) => {
                if (err) {
                    console.error(err);
                }
                res.render('index', { data, pages, page, query: req.query, url, total })
            })
        })
    })
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})