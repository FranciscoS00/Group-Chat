var express = require('express');
var bodyParser = require('body-parser');
var mongoConfigs = require('./model/mongoConfigs');
var url = require('url');
var ejs = require('ejs');
var UserController = require('./controllers/UserController');
var alert = require('alert');
const multer = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage })

var urlencodedParser = bodyParser.urlencoded({extended:false});
var app = express();

app.use(urlencodedParser);
app.set('view engine', 'ejs');

mongoConfigs.connect(function(err){
    if(!err){
        app.listen(3000,function(){
            console.log("Express web server listening on port 3000");
        });
    }
});

app.get('/', function(req, res){
    res.render('./index');
});

app.get('/registo', function(req, res){
    res.render('./registo');
});

app.get('/login', function(req, res){
    res.render('./login');
});

app.get('/logged', function(req, res){
    res.render('./logged');
});

app.post('/registo/input', upload.single('image'), function(req,res) {
    UserController.UsernameTaken(req, function (result) {
        if (result.length !== 0 ) {
            res.redirect('/registo')
            alert("O username introduzido já existe, utilize outro!");
        } else {
            UserController.addUser(req, function (err, result) {
                console.log(result)
                if (!err) {
                    res.redirect('/');
                } else {
                    console.log("Erro!");
                }
            });
        }
    });
});

app.post('/login', function(req, res){
    UserController.UserExists(req, function(result){
        if(result.length !== 0){
            res.redirect('/logged');
            /*mandar para a pagina de logged in e guardar a informação de que user se trata*/
        }else{
            res.redirect('/login');
            alert("As credenciais introduzidas não existem, verifique o username e a password");
        }
    });
});