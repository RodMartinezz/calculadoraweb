require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoURI = 'mongodb+srv://rodrigomtz:BARCA6717@cluster0.stmrl.mongodb.net/';
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS y Express
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Configuración de sesiones
app.use(
  session({
      secret: process.env.SESSION_SECRET || "clave_por_defecto",
      resave: false,
      saveUninitialized: true,
  })
);


// Conexión a MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("🟢 Conectado a MongoDB"))
    .catch((err) => console.error("🔴 Error de conexión:", err));

// Ruta de inicio
app.get("/", (req, res) => {
    res.render("index");
});

// Ruta para mostrar el formulario de registro
app.get("/register", (req, res) => {
    res.render("register");
});

// Ruta para registrar usuarios
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.send("El usuario ya está registrado.");
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar el usuario en la BD
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.redirect("/login");
});

// Ruta para mostrar el formulario de login
app.get("/login", (req, res) => {
    res.render("login");
});

// Ruta para manejar el login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        return res.send("Usuario no encontrado.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.send("Contraseña incorrecta.");
    }

    req.session.user = user;
    res.redirect("/dashboard");
});

// Ruta protegida del dashboard
app.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.render("dashboard", { user: req.session.user });
});

// Ruta para cerrar sesión
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

