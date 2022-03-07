const express = require("express");
const routes = require('./routes');
const path = require('path');
const bodyParser = require("body-parser");
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

require('dotenv').config({path:'variables.env'});

//helpers con algunas funciones
const helpers = require('./helpers');

//crear la conexion a BD
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');


db.sync()
    .then(()=>console.log('Conectador al servidor'))
    .catch((err)=>console.log(err));

//crear una app de express
const app = express();

//donde cargar los archivos estaticos
app.use(express.static('public'));

//habilitar pug
app.set('view engine','pug');

app.use(bodyParser.urlencoded({extended:true}));

//Agregamps express validator a toda la aplicacion
//app.use(expressValidator());



//Agregar carpeta de vistas
app.set('views',path.join(__dirname,'./views'));

//agregar flash messages
app.use(flash());

app.use(cookieParser());

//sesiones permiten navegar entre paginas sin volvernos a autenticar
app.use(session({
    secret:'supersecreto',
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

//pasar var dumpo a la aplicacion
app.use((req,res,next)=>{
    //console.log(req.user);
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
});

//Habilitar body-parser para leer datos del formulario


app.use('/',routes());

//Servidor y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port,host, ()=>{
    console.log('El servidor esta funcionando');
});

//require('./handlers/email');//esto es para probar que funciona
//en mailtrap se ve una visualizacion del correo a mandar