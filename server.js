require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const mongoURI = 'mongodb+srv://rodrigomtz:BARCA6717@cluster0.stmrl.mongodb.net/';
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => console.error("❌ Error en la conexión a MongoDB:", err));

// Configuración de sesiones
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");

// Middleware para parsear datos del formulario
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get("/", (req, res) => {
  res.render("index");
});

// Ruta para mostrar el formulario de registro
app.get("/register", (req, res) => {
  res.render("register");
});

// Ruta para manejar el registro de usuarios
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send("Todos los campos son obligatorios");
  }
  
  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.send("El usuario ya existe");
  }

  // Hashear la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(password, 10);

  // Guardar usuario en MongoDB
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  res.redirect("/login");
});

// Ruta para mostrar el formulario de login
app.get("/login", (req, res) => {
  res.render("login");
});

// Ruta para manejar el inicio de sesión
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.send("Usuario no encontrado");
  }

  // Comparar la contraseña ingresada con la almacenada
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send("Contraseña incorrecta");
  }

  // Guardar usuario en sesión
  req.session.user = user;
  res.redirect("/dashboard");
});

// Ruta para el dashboard (solo si el usuario está autenticado)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("dashboard", { user: req.session.user });
});

// Ruta para cerrar sesión
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución en http://localhost:${PORT}`);
});
