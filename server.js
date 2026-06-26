/* .env datei auslesen */
require("dotenv").config();

/* web framework für node */
const express = require("express");

/* PostgreSQL pool */
const { Pool } = require("pg");

/* CORS = cross origin resource sharing, verhindert requestblocken von unterschiedlichen domains, sollte erstmal unrelevant sein daher raus */
/* const cors = require("cors"); */

const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const app = express();


/* process enthält sowas wie die derzeitigen server.js instance und daher kann man hier auf die envs zugreifen */
const PORT = process.env.PORT;

/* der pool ist die schnittstelle zur datenbank im hintergrund */
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


/* siehe cors kommentar weiter oben */
/* app.use(cors()); */ 

app.use(express.json());
app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));

/* wer keine session besitzt der darf auch keine weiteren funktionen verwenden, daher weiterleitung zur anmeldeseite */
const pageGuard = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}


/* insofern der pageguard nicht anders weiterleitet dann kommt man standardmäßig zum index */
app.get('/', pageGuard, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* login funktion */
app.post("/api/login", async (req, res) => {
    const { name, pw } = req.body;
    try {
        const result = await pool.query("SELECT * FROM nutzer WHERE name = $1", [name]);
        const user = result.rows[0];
        console.log(result.rows[0]);
        if (user && user.pw == pw) {
            req.session.user = {
                id: user.user_id,
                name: user.name
            };
            res.json({ success: true });
        } else {
            res.status(401).json({ message: "Nutzername oder Passwort sind falsch!"});
        }
    } catch (err) {
        res.status(500).json({ message: "Es ist ein Fehler aufgetreten bitte versuchen Sie es erneut!"});
    }
});

/* logout funktion */
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

/* allgemeinen pfad für seiten hinterlegen */
app.use(express.static(path.join(__dirname, 'public')));

/* port für den localhost bestimmen */
app.listen(PORT, () => {
    console.log("Server läuft auf http://localhost:" + PORT);
});