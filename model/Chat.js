var mongoConfigs = require('./mongoConfigs');

function addChat(chatMembros,regras,callback){
    var db = mongoConfigs.getDB();
    var lastOcurence="";
    var x=0;
    for(var i = 0;i < regras.length;i++){
        if ((regras[i]==='\n' || i === regras.length - 1) && lastOcurence !== "") {
            if (i === regras.length - 1) lastOcurence = lastOcurence + regras[i];
            chatMembros=chatMembros + '", "r' + x + '":"' + lastOcurence;
            lastOcurence = "";
            x++;
        }
        else{
            lastOcurence = lastOcurence + regras[i];
        }
    }
    chatMembros = chatMembros + '" }';
    var bodyJson = JSON.parse(chatMembros);
    db.collection('chat').insert(bodyJson,function(err,result){
        callback(err,result);
    });
}

function addLiderChat(nomeChat,lider,callback){
    var db = mongoConfigs.getDB();
    db.collection('lider').insertOne({Chat:nomeChat,username:lider},function(err,result){
        callback(err,result);
    });
}

function membroChat(user,callback){
    var db = mongoConfigs.getDB();

    var filters = { };

    if(user !== undefined) filters.username = user;

    db.collection('pessoasNoChat').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function findID(numero,callback){ //adiciona um lider a um chat
    var db = mongoConfigs.getDB();

    var filters = { };

    if(numero !== undefined) filters.id = numero;

    db.collection('mensagens').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function mensagensChat(titulo,callback){
    var db = mongoConfigs.getDB();

    var filters = { };

    if(titulo !== undefined) filters.chat = titulo;

    db.collection('mensagens').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function addMemberChat(nomeChat,membro,callback){
    var db = mongoConfigs.getDB();
    db.collection('pendentes').insertOne({Chat:nomeChat,username:membro},function(err,result){
        callback(err,result);
    });
}

function chatNameTaken(fullDate,titulo,callback){
    var db = mongoConfigs.getDB();
    var nChat;
    if (titulo!=="") nChat=titulo;
    else nChat=fullDate;
    var filters = { };

    if(nChat !== undefined) filters.Chat = nChat;
    db.collection('chat').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function aceitarRejeitarPedido(nomeChat,username,opcao, callback){
    var db = mongoConfigs.getDB();

    if(opcao==true){
        db.collection('pessoasNoChat').insertOne({Chat:nomeChat,username:username},function(err,result){
            callback(err,result);
        });
    }
}

function removerPendentes(nomeChat,username, callback) {
    var db = mongoConfigs.getDB();
    db.collection('pendentes').deleteOne({Chat: nomeChat, username: username}, function (err, result) {
        callback(err, result);
    });
}

function alterarNome(nomeChat,novoNome,data){
    var db = mongoConfigs.getDB();
    db.collection('chat').insertOne({novoNome:novoNome,nomeAntigo:nomeChat,data:data},function(err,result){
        callback(err,result);
    });
}

function readmitir(Chat,User,Lider){
    var db = mongoConfigs.getDB();
    db.collection('readmitir').insertOne({Chat:Chat,username:User,Lider:Lider},function(err,result){
        callback(err,result);
    });
}

function aceitarRejeitarReadmicao(Chat,username,lider,opcao){
    var db = mongoConfigs.getDB();
    db.collection('readmitir').deleteOne({Chat:Chat,username:username,Lider:lider},function(err,result){
        callback(err,result);
    });
    if(opcao==true){
        db.collection('pessoasNoChat').insertOne({Chat:nomeChat,username:username},function(err,result){
            callback(err,result);
        });
    }
}

function sairChat(Chat,username){
    var db = mongoConfigs.getDB();
    db.collection('pessoasNoChat').deleteOne({Chat:Chat,username:username},function(err,result){
        callback(err,result);
    });
}

function addMensagem(titulo,data,user,id,mensagem,callback){
    var db = mongoConfigs.getDB();
    db.collection('mensagem').insertOne({user:user,data:data,mensagem:mensagem,chat:titulo,id:id},function(err,result){
        callback(err,result);
    });
}

module.exports = {
    addChat,
    addMensagem,
    sairChat,
    chatNameTaken,
    aceitarRejeitarReadmicao,
    readmitir,
    mensagensChat,
    removerPendentes,
    findID,
    alterarNome,
    aceitarRejeitarPedido,
    addLiderChat,
    membroChat,
    addMemberChat
};