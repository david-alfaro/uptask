const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req,res) =>{
    //res.send('funciona');
    res.render('crearCuenta',{
        nombrePagina:'Crear cuenta en Uptask'
    });
}

exports.formIniciarSesion = (req,res) =>{
    const {error} = res.locals.mensajes;
    //res.send('funciona');
    res.render('iniciarSesion',{
        nombrePagina:'Iniciar Sesion en Uptask',
        error
    });
}

exports.crearCuenta = async (req,res)=>{
    //res.send('enviaste el formulario');
    //leer los datos
    //console.log(req.body);
    const {email,password} = req.body;

    try {
        //crear el usuario
        await Usuarios.create({
            email,
            password
        });
        //crear una URL de confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;


        //crear el objeto de usuario
        const usuario = {
            email
        }


        //enviar email
        await enviarEmail.enviar({
            usuario,
            subject:'Confirma tu cuenta UpTask',
            confirmarUrl,
            archivo:'confirmar-cuenta'
        });



        //redirigir al usuario
        req.flash('correcto','Enviamos un correo, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error',error.errors.map(error=>error.message))
        res.render('crearCuenta',{
            mensajes:req.flash(),
            nombrePagina:'Crear cuenta en Uptask',
            email,
            password
        })
    }
    
    
}

exports.formRestablecerPassword = (req,res) =>{
    res.render('reestablecer',{
        nombrePagina:'Reestablecer Contrasena'
    });
}

//cambia el estado de una cuenta
exports.confirmarCuenta = async(req,res)=>{
    //res.json(req.params.correo);
    const usuario = await Usuarios.findOne({
        where:{
            email:req.params.correo
        }
    });
    //si no existe el usuario
    if(!usuario){
        req.flash('error','No valido');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto','Cuenta activa');
    res.redirect('/iniciar-sesion');
}