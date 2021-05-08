var express = require('express');
var bodyParser = require('body-parser');
var mongoConfigs = require('./model/mongoConfigs');
var url = require('url');
var ejs = require('ejs');
var UserController = require('./controllers/UserController');
var chatController = require('./controllers/chatController');
var alert = require('alert');
const multer = require('multer');
const process=require('process');


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
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(urlencodedParser);
app.set('view engine', 'ejs');

mongoConfigs.connect(function(err){
    if(!err){
        app.listen(80,function(){
            console.log("Express web server listening on port 80");
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
    //console.log(req.query.username);
    res.render('./logged');
});

app.get('/criarConversa', function(req, res){
    //console.log(req.query.username);
    res.render('./criarConversa');
});

app.get('/conversa', function(req, res){
    //console.log(req.query.username);
    res.render('./conversa');
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
            res.redirect('/logged?username='+result[0].username);
            /*guardar a informação de que user se trata*/
        }else{
            res.redirect('/login');
            alert("As credenciais introduzidas não existem, verifique o username e a password");
        }
    });
});

io.on(
    'connection',
    (socket) => {
        console.log('connect');

        socket.on('option', (args) => {
            if (args[0] === 'criar') {
                var user = args[1].substring(28, args[1].length);
                socket.emit('redirect', '/criarConversa' + user);
            }
            if (args[0] === 'conversa') {
                var user = args[1].substring(28, args[1].length);
                socket.emit('redirect', '/conversa' + user);
            }
            if (args[0] === 'pedido') {
                console.log('yup thats right');
            }
            if (args[0] === 'readmitir') {
                console.log('yup thats right');
            }
        });

        socket.on('criarConversa', (args) => {
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var fullDate = "" + day + "/" + month + "/" + year;
            var members = args[1];
            chatController.chatNameTaken(fullDate, args[0], function (result) {
                if (result.length !== 0) {
                    var user = args[3].substring(35, args[3].length);
                    socket.emit('redirect', '/criarConversa' + user);
                    alert("O nome do chat já existe, utilize outro!");
                } else {
                    var nChat;
                    if (args[0] !== "") nChat = args[0];
                    else nChat = fullDate;
                    var chatMembros = '{ "Chat":"' + nChat + '", "data":"' + fullDate;
                    var x = 0;
                    var lastOcurence = "";
                    for (var i = 0; i < members.length || i === 0; i++) {
                        if ((members[i] === '\n' || i === members.length - 1) && lastOcurence !== "") {
                            if (i === members.length - 1) lastOcurence = lastOcurence + members[i];
                            chatController.addMemberChat(nChat, lastOcurence, function (err, result) {
                                console.log(result)
                                if (!err) {
                                } else {
                                    console.log("Erro!");
                                }
                            });
                            chatMembros = chatMembros + '", "m' + x + '":"' + lastOcurence;

                            lastOcurence = "";
                            x++;
                        }else lastOcurence = lastOcurence + members[i];
                        if (i + 1 >= members.length) {
                            chatController.addLiderChat(nChat, args[3].substring(45, args[3].length), function (err, result) {
                                console.log(result)
                                if (!err) {
                                } else {
                                    console.log("Erro!");
                                }
                            });
                            chatController.aceitarRejeitarPedido(nChat, args[3].substring(45, args[3].length), true, function (err, result) {
                                console.log(result)
                                if (!err) {
                                } else {
                                    console.log("Erro!");
                                }
                            });
                            chatMembros = chatMembros + '", "m' + x + '":"' + args[3].substring(45, args[3].length);
                        }
                    }


                    chatController.addChat(chatMembros, args[2], function (err, result) {
                        var user = args[3].substring(35, args[3].length);
                        if (!err) {
                            socket.emit('redirect', '/logged' + user);
                            alert("O seu chat foi criado com sucesso");
                        } else {
                            console.log("Erro!");
                        }
                    });
                }
            });
        });

        socket.on('carregarConversas', (args) => {
            var user = args.substring(40, args.length);
            chatController.membroChat(user, function (result) {
                if (result.length !== 0) {
                    var chats = [];
                    for (var i=0;i<result.length;i++)
                        chats[i]=result[i].Chat;
                    socket.emit('aCarregar', chats);
                }
                else{
                    alert("Não estás a participar de nenhuma conversa!");
                }
            });
        });

        socket.on('carregarConversa', (args) => {
            var user = args[0].substring(40, args[0].length);
            chatController.membroChat(user, function (result) {
                if (result.length !== 0) {
                    var tituloChat=result[args[1]].Chat;
                    chatController.mensagensChat(tituloChat,function(mensagens){
                       socket.emit('mensagensRecebidas',mensagens);
                    });
                }
                else{
                    alert("Ocorreu um erro atualize a pagina web!");
                }

            });
        });

        socket.on('adicionarMensagem', (args) => {
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var fullDate = "" + day + "/" + month + "/" + year;
            var user = args[0].substring(40, args[0].length);
            chatController.membroChat(user, function (result) {
                if (result.length !== 0) {
                    var id=0;
                    while(true){
                        var quit=false;
                        chatController.findID(id,function(mensagens){
                            if(mensagens.length!==0){
                                id++;
                            }
                            else quit=true;
                        });
                        if (quit===true) break;
                    }

                    chatController.addMensagem(result[args[2]].Chat,fullDate,user,id,args[1],function (err, result) {
                        console.log(result)
                        if (!err) {
                        } else {
                            console.log("Erro!");
                        }
                    });
                    chatController.mensagensChat(tituloChat,function(mensagens){
                        socket.emit('mensagensRecebidas',mensagens);
                    });
                }
                else{
                    alert("Ocorreu um erro atualize a pagina web!");
                }

            });
        });
    });

server.listen(3000, () => {
    console.log('listening on *:3000');
});