const chat = require('../model/Chat');

function addChat(chatMembros,regras,callback){ //adiciona ao chat
    chat.addChat(chatMembros,regras,callback);
}

function membroChat(chatMembros,callback){ //verifica se e membro do chat
    chat.membroChat(chatMembros,callback);
}

function addMemberChat(nomeChat,membros,data,callback){ //adiciona um membro ao chat
    chat.addMemberChat(nomeChat,membros,data,callback);
}

function addLiderChat(nomeChat,lider,callback){ //adiciona um lider a um chat
    chat.addLiderChat(nomeChat,lider,callback);
}

function findID(numero,callback){ //adiciona um lider a um chat
    chat.findID(numero,callback);
}

function chatNameTaken(fullDate,titulo,callback){ //verifica se o nome do chat ja existe
    chat.chatNameTaken(fullDate,titulo,callback);
}

function aceitarRejeitarPedido(nomeChat,username,opcao, callback){ //aceita ou rejeita o pedido para entrar num chat
    chat.aceitarRejeitarPedido(nomeChat,username,opcao, callback);
}

function removerPendentes(nomeChat,user,callback) { //remove um elemento pendente
    chat.removerPendentes(nomeChat,user,callback);
}

function alterarNome(nomeChat,novoNome,data){
    chat.alterarNome(nomeChat,novoNome,data);
}

function readmitir(Chat,User,Lider){
    chat.readmitir(Chat,User,Lider);
}

function aceitarRejeitarReadmicao(Chat,username,lider,opcao){
    chat.aceitarRejeitarReadmicao(Chat,username,lider,opcao);
}

function sairChat(Chat,username){
    chat.sairChat(Chat,username);
}

function mensagensChat(titulo,callback){ //ve quais mensagens foram enviadas num chat
    chat.mensagensChat(titulo,callback);
}

function addMensagem(titulo,data,user,id,mensagem,callback){ //adiciona uma mensagem a um chat
    chat.addMensagem(titulo,data,user,id,mensagem,callback);
}

module.exports = {
    addChat,
    chatNameTaken,
    addMensagem,
    sairChat,
    aceitarRejeitarReadmicao,
    readmitir,
    mensagensChat,
    removerPendentes,
    addMemberChat,
    addLiderChat,
    membroChat,
    alterarNome,
    findID,
    aceitarRejeitarPedido
};