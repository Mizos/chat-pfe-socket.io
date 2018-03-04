const express = require('express');
const http = require('http');
const socket = require('socket.io');
const {Users} = require('./users');
const {mongoose} = require('./db/mongoose');
const {User,Message,Room} = require('./db/models');


//server
const app =express();
const server = http.createServer(app);
const io = socket(server);
const port = process.env.PORT|3000;
let users= new Users();

app.get('/',(req,res)=>{
  res.send({server:'Online'});
})

//sockets
io.on('connection',(client)=>{

  client.on('join',(params)=>{
    client.join(params.room);
    users.removeUser(client.id);
    users.addUser(client.id,params.name,params.room);

    io.to(params.room).emit('updateList',users.getUsers(params.room));
    
    client.broadcast.to(params.room).emit('getMsg',{createdAt:+new Date(),text:`${params.name} has joined`,from:'Admin'});
  });

  client.on('sendMsg',(text)=>{
    let user = users.getUser(client.id);
    if(user){
      let message= new Message({text,from:user.name,room:user.room,createdAt:+new Date()});
      message.save().then((doc)=>{
        io.to(user.room).emit('getMsg',doc);
      });
    }
  });

  client.on('sendOldMsg',params=>{
    
    Message.find({room:params.room}).then(msgs=>{
      io.to(params.room).emit('getOldMsg', msgs);
    })
  
  })

  client.on('disconnect',(socket)=>{
    let user=users.removeUser(client.id);
    if(user){
      io.to(user.room).emit('updateList', users.getUsers(user.room));
      io.to(user.room).emit('getMsg',{createdAt:+new Date(),text:`${user.name} has Left`,from:'Admin'} );  
    }
  });

})

server.listen(port,()=>{
  console.log('Server started on port ',port);
})