const Sequelize = require('sequelize');
const db = require('../config/db');
const Proyectos = require('../models/Proyectos');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    email:{
        type:Sequelize.STRING(100),
        allowNull:false,
        validate:{
            isEmail:{
                msg:'Agrega un correo valido'
            },
            notEmpty:{
                msg:'El email no puede ir vacio'
            }
        },
        unique:{
            args:true,
            msg:'Usuario ya existe'
        }
    },
    password:{
        type:Sequelize.STRING(60),
        allowNull:true,
        validate:{
            notEmpty:{
                msg:'El password no puede ir vacio'
            }
        }
    },
    activo:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    token:Sequelize.STRING,
    expiracion:Sequelize.DATE
},{
    hooks:{
        beforeCreate(usuario){
            //console.log('Creando usuario');
            //console.log(usuario);
            usuario.password = bcrypt.hashSync(usuario.password,bcrypt.genSaltSync(10));

        }
    }
});

//Metodos personalizados
Usuarios.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}

Usuarios.hasMany(Proyectos);

module.exports = Usuarios;

