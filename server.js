const app = require("express")();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;

const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

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
    password: String,
    participantes: String,
    data: Date,
    nome: String
});

const msgSchema = new mongoose.Schema({
    username: String,
    conteudo: String,
    data: Date,
    id: Number
});

//Set the behaviour
userSchema.methods.verifyPassword = function (password) {
    return password === this.password;
}

//Compile the schema into a model
const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Msg = mongoose.model('Msg', msgSchema);

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));

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

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/",
    })
);

app.post("/register", upload.single('imagemPerfil') ,function(req,res){

    //New User in the DB
    if(req.file===undefined){
        const instance = new User({ username: req.body.username, password: req.body.password, imagem: null, });
        instance.save(function (err, instance) {
            if (err) return console.error(err);

            //Let's redirect to the login post which has auth
            res.redirect(307, '/login');
        });
    }
    else{
        const instance = new User({ username: req.body.username, password: req.body.password, imagem: req.file.filename, });
        instance.save(function (err, instance) {
            if (err) return console.error(err);

            //Let's redirect to the login post which has auth
            res.redirect(307, '/login');
        });
    }

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

    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    //Chat
    socket.on("join", function(){
        console.log(socket.request.user.username+" joined server");
        io.emit("update", socket.request.user.username + " has joined the server.");
    });


    socket.on('chat message',function(msg){
        console.log('message: '+msg);
        var mensagem = {msg:msg, id:socket.request.user.username};
        io.emit('chat message', mensagem);
    })

});

server.listen(port, () => {
    console.log(`application is running at: http://localhost:${port}`);
});
