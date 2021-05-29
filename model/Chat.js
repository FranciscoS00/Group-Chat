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

function pedidosReadmicao(db,username,callback){
    var filters = { };

    if(username !== undefined) filters.username = username;
    db.collection('saiu').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function pedidosReadmicaoCriador(db,username,callback){
    var filters = { };

    if(username !== undefined) filters.criador = username;
    db.collection('readmitir').find(filters).toArray(function(err,result){
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

function removeSaiu(db,username,nome){
    if(username!==undefined && nome!==undefined) {
        db.collection('saiu').remove({username: username, nome: nome});
    }
}

function sairChat(db,chatAcedido,username,callback){
    if(chatAcedido!==undefined && username!==undefined) {
        db.collection('membrochats').remove({username: username, nome: chatAcedido});
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

function colocarReadmicao(db,username,nome){
    if(username!==undefined && nome!==undefined) {
        var filters = { };
        filters.nome = nome;
        filters.participante = username;
        db.collection('chats').find(filters).toArray(function(err,result){
            if(err) return console.error(err);
            db.collection('readmitir').insertOne({username: username, nome: nome, criador: result[0].criador});
        });

    }
}

function colocarNoChatReadmitir(db,pessoas){
    if(pessoas!==undefined) {
        var filters = { };
        var newStuff=pessoas.split(",");
        var username=newStuff[1].split("]");
        var chat=newStuff[0].split("[");
        filters.nome = chat[1];
        filters.participante=username[0];
        db.collection('chats').find(filters).toArray(function(err,result){
            if(err) return console.error(err);
            db.collection('membrochats').insertOne({username: username[0], nome: chat[1], criador: result[0].criador});
        });

    }
}

function removeReadmitir(db,pessoas){
    if(pessoas!==undefined) {
        var newStuff=pessoas.split(",");
        var username=newStuff[1].split("]");
        var chat=newStuff[0].split("[");
        db.collection('readmitir').remove({username:username[0],nome:chat[1]});
    }
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



function MensagemPertence(db,id,callback){
    var filters = { };

    if(id !== undefined) filters.pertence = id;
    db.collection('mensagens').find(filters).toArray(function(err,result){
        callback(result);
    });
}

function deletemsg(db,id){
    if (id!==undefined){
        var variavelx=parseInt(id);
        db.collection('mensagens').remove({id:variavelx});
    }
}

function mudarNomeChat(db, antigo, novo, callback){
    var filters = {};
    var novoArray = {};
    if(antigo !== undefined) filters.nome = antigo;
    if(novo !== undefined)  novoArray.antigos = novo;
    db.collection('chats').updateOne(filters, {$push: novoArray})
    db.collection('chats').updateOne(filters,{$set: novo} )

}


module.exports = {
    getChat,
    getPendentes,
    pedidosReadmicao,
    removePendentes,
    colocarNoChat,
    pertenceConversa,
    MensagemPertence,
    imagemConversa,
    getMsgId,
    colocarReadmicao,
    pedidosReadmicaoCriador,
    removeSaiu,
    colocarNoChatReadmitir,
    sairChat,
    removeReadmitir,
    deletemsg,
    ChangeUsernameParticipante,
    mudarNomeChat
}