const Chat = require('../model/Chat');

function ChatTaken(db, req, callback){ //retorna todos os chats da base de dados na collection chats com o nome em chatname
    Chat.getChat(db, req.body.chatname, callback);
}

function Pendentes(db,socket,callback){ //retorna todos os chats da base de dados na collection pendentes com o username na socket
    Chat.getPendentes(db,socket.request.user.username,callback);
}

function Aceitar(db,req){ //remover o user da base de dados com o nome e username e colocar em membroChats
    if(Array.isArray(req.body.chatsPendentes)){
        for(var i=0;i<req.body.chatsPendentes.length;i++){
            Chat.colocarNoChat(db,req.body.username,req.body.chatsPendentes[i]);
        }
    }
    else
        Chat.colocarNoChat(db,req.body.username,req.body.chatsPendentes);
    Rejeitar(db,req);
}

function Rejeitar(db,req){ //remover o user da base de dados com o nome e username
    if(Array.isArray(req.body.chatsPendentes)){
        for(var i=0;i<req.body.chatsPendentes.length;i++){
            Chat.removePendentes(db,req.body.username,req.body.chatsPendentes[i]);
        }
    }
    else
        Chat.removePendentes(db,req.body.username,req.body.chatsPendentes);
}

function ChatsDisponiveis(db, socket, callback){
    Chat.pertenceConversa(db, socket.request.user.username, callback);
}

module.exports = {
    ChatTaken,
    Pendentes,
    Aceitar,
    Rejeitar,
    ChatsDisponiveis
};