require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const { exec } = require("child_process");
const User = require("./models/User");
const Sugerencia = require("./models/Sugerencia");

const app = express();
const PORT = process.env.PORT || 3000;

// =============================
// Configuración de la aplicación
// =============================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/calculadora', express.static(path.join(__dirname, 'easycalculator-web')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave_por_defecto",
    resave: false,
    saveUninitialized: true,
  })
);

// =============================
// Conexión a MongoDB
// =============================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("🟢 Conectado a MongoDB"))
  .catch(err => console.error("🔴 Error de conexión:", err));

// =============================
// Middleware de autenticación
// =============================
const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  next();
};

// =============================
// Rutas para el sistema
// =============================

// Página de inicio redirige a Login
app.get("/", (req, res) => res.redirect("/login"));

// Donde guarda los datos de Sugerencias
app.post("/sugerencias", async (req, res) => {
  const { email, opinion, gusta } = req.body;
  
  const nuevaSugerencia = new Sugerencia({
    email,
    opinion,
    gusta: gusta === "Sí"
  });

  await nuevaSugerencia.save();
  res.redirect("/sugerencias");
});

app.get("/sugerencias", async (req, res) => {
  const sugerencias = await Sugerencia.find().sort({ fecha: -1 });
  res.render("sugerencias", { sugerencias, user: req.session.user });
});

// =============================
// Rutas de Autenticación
// =============================
// Registro de usuarios
app.get("/register", (req, res) => res.render("register", { error: null }));
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  
  if (password !== confirmPassword) {
    return res.render("register", { error: "Las contraseñas no coinciden." });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.render("register", { error: "Este correo ya está registrado." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await new User({ email, password: hashedPassword }).save();
  res.redirect("/login");
});

// Login de usuarios
app.get("/login", (req, res) => res.render("login", { error: null }));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Credenciales incorrectas." });
  }

  req.session.user = { id: user._id, email: user.email };
  res.redirect("/paginaprincipal");
});

// Cerrar sesión
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// =============================
// Rutas para las páginas
// =============================

// Página principal
app.get("/paginaprincipal", requireAuth, (req, res) => {
  res.render("paginaprincipal", { user: req.session.user });
});

// Perfil
app.get("/perfil", requireAuth, (req, res) => {
  res.render("perfil", { user: req.session.user });
});

// Historial
app.get("/historial", requireAuth, (req, res) => {
  res.render("historial", { user: req.session.user });
});

// Sugerencias (Configuración)
app.get("/sugerencias", requireAuth, (req, res) => {
  res.render("sugerencias", { user: req.session.user });
});

// =============================
// Calculadora Web
// =============================
app.get("/calculadora", requireAuth, (req, res) => {
  // Opción 1: Servir directamente el archivo HTML
  res.sendFile(path.join(__dirname, 'easycalculator-web', 'index.html'));
  
  // Opción 2: O usar una vista EJS que envuelva la calculadora
  // res.render('calculadora', { user: req.session.user });
});

// =============================
// Ruta para la calculadora en Java (opcional)
// =============================
app.get("/calcular", requireAuth, (req, res) => {
  exec("java calculadora.java", (error, stdout, stderr) => {
    if (error) {
      console.error(`🔴 Error al ejecutar la calculadora: ${stderr}`);
      return res.status(500).json({ error: "Error al ejecutar la calculadora" });
    }
    res.json({ result: stdout });
  });
});

// =============================
// Iniciar el Servidor
// =============================
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));