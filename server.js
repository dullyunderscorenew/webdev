/* <summary> Codewiki

- dotenv = lädt umgebungsvariablen aus der .env

- express = hauptframework für routing, middleware und requests

- pg Pool = schnittstelle zur PostgreSQL DB

- ejs + express-ejs-layouts = rendert dynamische seiten und ermöglicht zentrale templates/layouts

- express.urlencoded() = HTML-Formulardaten aus req.body auslesen

- express-session = verwaltet usersessions

- express.static() = statische Ressourcen wie favicon, styles usw

- pageGuard() = middleware für geschützte seiten | leitet nicht eingeloggte benutzer weiter

- /login = loginseite rendern

- / = hauptseite

- /api/login = session erzeugen anhand username und pw

- /api/logout = session killen

- app.listen() = startet den server 

hinweise:
- assets werden über /public/assets geladen
- templates/layouts liegen unter /public/pages
- authentifizierung erfolgt sessionbasiert

</summary> */


// #region variablen und imports
    require("dotenv").config();
    const express = require("express");
    const { Pool } = require("pg");
    const path = require("path");
    const session = require("express-session");
    const bcrypt = require("bcryptjs"); // für verschlüsselung später, noch nicht nötig jetzt
    const { title } = require("process");
    const ejsLayouts = require("express-ejs-layouts");
    const app = express();
    const PORT = process.env.PORT;
    const pool = new Pool({
        user: process.env.DB_USER,
        host: "database",
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
// #endregion

// #region app setup
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

    app.use(express.static(path.join(__dirname, "public/assets")));

    const pageGuard = (req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.redirect("/login");
        }
    }

    app.get("/login", (req, res) => {res.render("login", { title: "Login"});});
    app.get("/", pageGuard, (req, res) => {res.render("index", { title: "Login"})});
// #endregion

// #region login & logout 
    app.post("/api/login", async (req, res) => {
        const { name, pw } = req.body;
        try {
            const result = await pool.query("SELECT * FROM nutzer WHERE name = $1", [name]);
            const user = result.rows[0];
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

    app.get("/api/logout", (req, res) => {
        req.session.destroy();
        res.json({ success: true });
    });
// #endregion

async function verbinde_db() {
    let connected = false;

    while (!connected) {
        try {
            await pool.query("SELECT NOW()");
            connected = true;
            console.log("Database connected");
        } catch (err) {
            console.log("Waiting for database...");
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

async function serverstart() {
    await verbinde_db();

    app.listen(PORT, () => {
        console.log("Server läuft auf http://localhost:" + PORT);
    });
}

serverstart();

/*app.listen(PORT, () => {
    console.log("Server läuft auf http://localhost:" + PORT);
});*/