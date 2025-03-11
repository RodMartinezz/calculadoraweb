require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave_por_defecto",
    resave: false,
    saveUninitialized: true,
  })
);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("🟢 Conectado a MongoDB"))
  .catch(err => console.error("🔴 Error de conexión:", err));

// Rutas
app.get("/", (req, res) => res.redirect("/login"));
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.send("Las contraseñas no coinciden.");

  const emailExists = await User.findOne({ email });
  if (emailExists) return res.send("Este correo ya está registrado.");

  const hashedPassword = await bcrypt.hash(password, 10);
  await new User({ email, password: hashedPassword }).save();
  res.redirect("/login");
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) return res.send("Credenciales incorrectas.");
  req.session.user = { id: user._id, email: user.email };
  res.redirect("/paginaprincipal");
});

app.get("/paginaprincipal", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("paginaprincipal", { user: req.session.user });
});

app.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/login")));

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
