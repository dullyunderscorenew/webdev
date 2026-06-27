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
const { title } = require("process");
const ejsLayouts = require("express-ejs-layouts");
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/pages"));
app.use(ejsLayouts);
app.set("layout", "layout");
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    }
}));

/* allgemeinen pfad für resourcen wie style usw hinterlegen */
app.use(express.static(path.join(__dirname, "public/assets")));

/* wer keine session besitzt der darf auch keine weiteren funktionen verwenden, daher weiterleitung zur anmeldeseite */
const pageGuard = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}

app.get("/login", (req, res) => {
    res.render("login", { title: "test"});
    //res.sendFile(path.join(__dirname, "public/pages", "login.html"));
});

/* insofern der pageguard nicht anders weiterleitet dann kommt man standardmäßig zum index */
app.get("/", pageGuard, (req, res) => {
    res.render("index", { title: "test"})
    //res.sendFile(path.join(__dirname, "public/pages", "index.html"));
});

/* login funktion */
app.post("/api/login", async (req, res) => {
    const { name, pw } = req.body;
    try {
        const result = await pool.query("SELECT * FROM nutzer WHERE name = $1", [name]);
        const user = result.rows[0];
        console.log(res.body);
        if (user && user.pw == pw) {
            req.session.user = {
                id: user.user_id,
                name: user.name
            };
            return res.redirect("/");
        } else {
            return res.render("login", {title: "Login", error: "Nutzername oder Passwort sind falsch!"});
        }
    } catch (err) {
        return res.render("login", {title: "Login", error: "Es ist ein Fehler aufgetreten!"});
    }
});

/* logout funktion */
app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


/* port für den localhost bestimmen */
app.listen(PORT, () => {
    console.log("Server läuft auf http://localhost:" + PORT);
});