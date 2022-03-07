const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/iniciar-sesion',
    failureFlash:true,
    badRequestMessage:'Ambos campos son oblogatorios'
});

//Funcion para revisar si el usuario esta loggeado
exports.usuarioAutenticado = (req,res,next)=>{
    //si el usuario esta autenticado, adelante
    if(req.isAuthenticated()){
        return next();
    }
    //sino esta autenticado redirigir al formulario
    return res.redirect('/iniciar-sesion');
}

//Funcion para cerrar sesion
exports.cerrarSesion = (req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/iniciar-sesion'); //al cerrar sesion nos lleva al login
    })
}

//Funcion para generar un token si el usuario es valido
exports.enviarToken = async(req,res)=>{
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({
        where:{
            email:req.body.email
        }
    });

    //si no existe el usuario
    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.render('reestablecer',{
            nombrePagina:'Reestablecer tu Contrasena',
            mensajes:req.flash()
        })
    }

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000;
    //console.log(token);

    //guardarlos en la bd
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //enviar el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject:'Password Reset',
        resetUrl,
        archivo:'reestablecer-password'
    });

    //terminar la ejecucion
    req.flash('correcto','Se envio un mensaje a tu correo');
    res.redirect('/iniciar-sesion');

}

exports.validarToken = async(req,res)=>{
    const usuario = await Usuarios.findOne({
        where:{
            token:req.params.token
        }
    });

    //si no encuentra al usuario
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/reestablecer');
    }

    //formulario para generar el password
    res.render('resetPassword',{
        nombrePagina:'Reestablecer Contrasena'
    });
}

//cambia el password por uno nuevo
exports.actualizarPassword = async (req,res)=>{

    //verifica el token valido pero tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where:{
            token:req.params.token,
            expiracion:{
                [Op.gte]:Date.now()
            }
        }
    });

    //verificamos si el usuario existe
    //console.log(usuario);
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/reestablecer');
    }

    //hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;

    //guardamos el nuevo password

    await usuario.save();
    req.flash('correcto','Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');

}