var mongoConfigs = require('./mongoConfigs');

function getChat(db, chatname, callback){
    var filters = { };

    if(chatname !== undefined) filters.nome = chatname;
    db.collection('chats').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function getPendentes(db,username,callback){
    var filters = { };

    if(username !== undefined) filters.username = username;
    db.collection('pendentes').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function pertenceConversa(db, username, callback){
    var filters = {};
    if(username !== undefined) filters.username = username;
    db.collection('membrochats').find(filters).toArray(function(err, result){
        callback(result);
    });
}

function removePendentes(db,username,nome){
    if(username!==undefined && nome!==undefined) {
        db.collection('pendentes').remove({username: username, nome: nome});
    }
}

function sairChat(db,chatAcedido,username,callback){
    if(chatAcedido!==undefined && username!==undefined) {
        db.collection('membroschats').remove({username: username, nome: chatAcedido});
        db.collection('saiu').insertOne({username: username, nome: chatAcedido},(error,result)=>{
            callback(error);
        });
    }
}

function getMsgId(db,id ,callback){
    var filters = { };
    if(id !== undefined) filters.id = id;
    db.collection('mensagens').find(filters).toArray((err,result)=>{
        callback(result)
    });
}

function imagemConversa(db, imagem, callback){
    var filters = {};
    if(imagem !== undefined) filters.username = imagem;
    db.collection('users').find(filters).toArray(function(err, result){
        callback(result);
    });
}

function colocarNoChat(db,username,nome){
    if(username!==undefined && nome!==undefined) {
        var filters = { };
        filters.nome = nome;
        db.collection('chats').find(filters).toArray(function(err,result){
            if(err) return console.error(err);
            db.collection('membrochats').insertOne({username: username, nome: nome, criador: result[0].criador});
        });

    }
}

function MensagemPertence(db,id,callback){
    var filters = { };

    if(id !== undefined) filters.pertence = id;
    db.collection('mensagens').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function ChangeUsernameParticipante(db, username, newUsername, callback){
    var filters = {};
    var filtroCriador = {};
    var filtroMensagens = {};
    var filtroPendentes = {};
    var filtroMembroUsername = {};
    var filtroMembroCriador = {};
    var novo = {};
    var novoCriador = {};
    var novoMensagens = {};
    var novoPendentes = {};
    var novoMembroUsername = {};
    var novoMembroCriador = {};
    if(username !== undefined && newUsername !== undefined){
        filters.participante = username;
        filtroCriador.criador = username;
        filtroMensagens.username = username;
        filtroPendentes.username = username;
        filtroMembroUsername.username = username;
        filtroMembroCriador.criador = username;
        novo.participante = newUsername;
        novoCriador.criador = newUsername;
        novoMensagens.username = newUsername;
        novoPendentes.username = newUsername;
        novoMembroUsername.username = newUsername;
        novoMembroCriador.criador = newUsername;
    }
    //participantes no chat
    db.collection('chats').updateMany(filters, {$push: novo})
    db.collection('chats').updateMany(filters, {$pull: filters})
    //criador do chat
    db.collection('chats').updateMany(filtroCriador, {$set: novoCriador})
    //quem mandou a msg
    db.collection('mensagens').updateMany(filtroMensagens, {$set: novoMensagens})
    //pendentes
    db.collection('pendentes').updateMany(filtroPendentes, {$set: novoPendentes})
    //membro chats
    db.collection('membrochats').updateMany(filtroMembroCriador, {$set: novoMembroCriador})
    db.collection('membrochats').updateMany(filtroMembroUsername, {$set: novoMembroUsername})

}


module.exports = {
    getChat,
    getPendentes,
    removePendentes,
    colocarNoChat,
    pertenceConversa,
    MensagemPertence,
    imagemConversa,
    getMsgId,
    sairChat,
    ChangeUsernameParticipante
}