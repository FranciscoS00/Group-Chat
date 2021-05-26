const app = require("express")();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;

const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var alert = require('alert')
var UserController = require('./controllers/UserController')
var ChatController = require('./controllers/ChatController')

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;

const sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://G11:VpJZUb2O9NtUV7Va@clusterdbw.1dbjr.mongodb.net/G11?authSource=admin&replicaSet=atlas-bek8xj-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true', {useNewUrlParser: true, useUnifiedTopology: true});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected!');
});

//Set the schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    imagem: String
});

const chatSchema = new mongoose.Schema({
    criador: String,
    regra: Array,
    participante: Array,
    data: Date,
    nome: String
});

const msgSchema = new mongoose.Schema({
    username: String,
    conteudo: String,
    data: Date,
    pertence: String
});

const pendSchema = new mongoose.Schema({
    username: String,
    nome: String
})

const membroSchema = new mongoose.Schema({
    username: String,
    nome: String,
    criador: String
})

//Set the behaviour
userSchema.methods.verifyPassword = function (password) {
    return password === this.password;
}

//Compile the schema into a model
const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Msg = mongoose.model('mensagens', msgSchema);
const Pendente = mongoose.model('pendente',pendSchema);
const MembroChat = mongoose.model('membroChat',membroSchema);

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
    });
}));

app.get("/", (req, res) => {
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
        console.log(`user is authenticated, session is ${req.session.id}`);
    } else {
        console.log("unknown user");
    }
    res.render(isAuthenticated ? "index.ejs" : "login.ejs");
});

app.get("/chatroom", ensureLoggedIn('/'), (req,res) => {

    res.render('chatroom.ejs');

});

app.get("/register", ensureLoggedOut('/'), (req, res) => {
    res.render("registo.ejs");
});

app.get("/criarChat", ensureLoggedIn('/'), (req, res) => {

    res.render("criarChat.ejs");
});

app.get("/pedidos", ensureLoggedIn('/'), (req,res) => {
    res.render("pedidos.ejs");
})

app.get("/aceder", ensureLoggedIn('/'), (req,res) => {
    res.render("chats.ejs");
});


app.post("/login",passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    })
);

app.post("/register", upload.single('imagemPerfil') ,function(req,res){

    //New User in the DB
    UserController.UsernameTaken(db, req, function(result) {
        if(result.length !==0) {
            res.redirect('register')
            alert("O username introduzido já está em uso!");
        }else {
            if (req.file === undefined) {
                const instance = new User({username: req.body.username, password: req.body.password, imagem: null,});
                instance.save(function (err, instance) {
                    if (err) return console.error(err);

                    //Let's redirect to the login post which has auth
                    res.redirect(307, '/login');
                });
            } else {
                const instance = new User({
                    username: req.body.username,
                    password: req.body.password,
                    imagem: req.file.filename,
                });
                instance.save(function (err, instance) {
                    if (err) return console.error(err);

                    //Let's redirect to the login post which has auth
                    res.redirect(307, '/login');
                });
            }
        }
    })
});

app.post("/logout", (req, res) => {
    console.log(`logout ${req.session.id}`);
    const socketId = req.session.socketId;
    if (socketId && io.of("/").sockets.get(socketId)) {
        console.log(`forcefully closing socket ${socketId}`);
        io.of("/").sockets.get(socketId).disconnect(true);
    }
    req.logout();
    res.cookie("connect.sid", "", { expires: new Date() });
    res.redirect("/");
});

app.post("/criarChat", function(req, res) {
    ChatController.ChatTaken(db,req,function (result){
        if(result.length!==0) {
            res.redirect('/criarChat');
            alert("Esse nome de chat já existe");
        }
        else{
            var date = new Date();
            if(req.body.chatname==="")
                var chatDB = '{ "nome":"' + date + '", "data":"' + date + '", "criador":"' + req.body.username + '", "participante":[ "';
            else
                var chatDB = '{ "nome":"' + req.body.chatname + '", "data":"' + date + '", "criador":"' + req.body.username + '", "participante":[ "';
            for(var i=0;i<req.body.numeroElementos;i++) {
                if(req.body.numeroElementos==1)
                    chatDB = chatDB + req.body.elementosChat;
                else{
                    chatDB = chatDB + req.body.elementosChat[i];
                    if (i + 1 < req.body.numeroElementos)
                        chatDB = chatDB + '", "';
                }
            }
            chatDB = chatDB + '" ], "regra":[ "';

            for(var i=0;i<req.body.numeroRegras;i++){
                if(req.body.numeroRegras==1)
                    chatDB = chatDB + req.body.regras;
                else{
                    chatDB = chatDB + req.body.regras[i];
                    if(i+1<req.body.numeroRegras)
                        chatDB = chatDB + '", "';
                }
            }
            chatDB = chatDB + '" ]}';
            console.log(chatDB.substring(153,185));
            const instance = new Chat(JSON.parse(chatDB));
            instance.save(function (err, instance) {
                if (err) return console.error(err);

                for(i=0;i<req.body.numeroElementos;i++){
                    if (req.body.numeroElementos==1)
                        var saveDB = new Pendente({
                            username: req.body.elementosChat,
                            nome: req.body.chatname,
                        })
                    else
                        var saveDB = new Pendente({
                            username: req.body.elementosChat[i],
                            nome: req.body.chatname,
                        })
                    saveDB.save(function(err,saveDB){
                        if (err) return console.error(err);
                    })
                }

                var saveDB = new MembroChat({
                    username: req.body.username,
                    nome: req.body.chatname,
                    criador: req.body.username,
                })
                saveDB.save(function(err,saveDB){
                    if (err) return console.error(err);
                })
                //Let's redirect to the login post which has auth
                res.redirect(307, '/login');
            });
        }
    });

});

app.post("/chatroom", ensureLoggedIn('/'), (req,res) => {

    res.render('chatroom.ejs');

});

app.post("/pedidos", function (req,res){
    if(req.body.resposta === "aceitar"){
        ChatController.Aceitar(db,req);
        res.redirect(307, '/login');
    }
    else{
        ChatController.Rejeitar(db,req);
        res.redirect(307, '/login');
    }
})

passport.serializeUser((user, cb) => {
    console.log(`serializeUser ${user.id}`);
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    console.log(`deserializeUser ${id}`);
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

const io = require('socket.io')(server);

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error('unauthorized'))
    }
});

io.on('connect', (socket) => {
    console.log(`new connection ${socket.id}`);
    socket.on('whoami', (cb) => {
        cb(socket.request.user.username);
    });

    socket.on('pendentes', (cb) => {
        ChatController.Pendentes(db,socket,function (result){
            cb(result);
        })
    });

    socket.on('aceder', (cb) => {
        ChatController.ChatsDisponiveis(db,socket,function (result){
            cb(result);
        })
    });

    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    //Chat
    socket.on("join", function(){
        console.log(socket.request.user.username+" joined server");
        io.emit("update", socket.request.user.username + " has joined the server.");
        ChatController.MensagensChat(db,"principal",function (result){
            var mensagem = result;
        })
    });


    socket.on('chat message',function(msg) {
        console.log('message: ' + msg);
        var mensagem = {msg: msg, id: socket.request.user.username};
        let saveMSG = new Msg({
            username: socket.request.user.username,
            conteudo: msg,
            data: Date.now(),
            pertence: "principal"
        })
        saveMSG.save(function (err, instance) {
            if (err) return console.error(err);
            io.emit('chat message', mensagem);
        })
    });

});

server.listen(port, () => {
    console.log(`application is running at: http://localhost:${port}`);
});
