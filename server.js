const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const Blog = require('./data');



const app = express();
const PORT = process.env.PORT || 8080;

// connect to mongoDB
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://demo-username:demo-password@cluster0.qryj7.mongodb.net/node-demo?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log("Connection error:", err));

const clientPath = `${__dirname}/client/build`; //`${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

/*if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientPath));
}*/

const server = http.createServer(app);

const io = socketio(server);

io.on('connection', (sock) => {
  console.log('Someone connected');
  sock.emit('message', 'Hi, you are connected');

  sock.on('message', (text) => {
    io.emit('message', text);
  });

  async function creating(text, text1, text2) {
    Blog.find({title: text})
      .then((result) =>  {
        if (result.length > 0){
          sock.emit("title-exists");
        }
        else{
          const blog = new Blog({
            title: text,
            price: text1,
            body: text2
          });
    
          blog.save()
              .then((result) => {
                  listing();
                  sock.emit("created");
              })
              .catch((err) => {
                  console.log("ERROR in create: ", err);
              });
        }
      })
      .catch((err) => {
        console.log("Error in finding in create: ", err);
      });
  }

  sock.on('create', (text, text1, text2) => {
    console.log('creating...');
    creating(text, text1, text2);
  });

  async function deleting(text) {
    Blog.find({title: text})
      .then((result) => {
        if (result.length > 0){
          Blog.deleteOne({title: text})
            .then((result) => {
              if (result)
                sock.emit("deleted");
            })
            .catch((err) => {
                console.log("ERROR in delete: ", err);
            });
        }
        else{
          sock.emit("title-dne");
        }
      })
      .catch((err) => {
        console.log("Error in finding in delete: ", err);
      });
  }

  sock.on('delete', (text) => {
      console.log('deleting...');
      deleting(text);
  });

  sock.on('update', (text1, text2) => {
      console.log('updating...');
      deleting(text1);
      creating(text2);
  });

  sock.on('list', function(){
      listing()
  });

  async function listing(){
    Blog.find()
        .then((result) => {
            console.log("got it");
            console.log(result);
            sock.emit('listed', result);
        })
        .catch((err) => {
            console.log("ERROR in list: ", err);
        });
  }

  listing();
  

});


server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, () => {
  console.log('RPS started on ', PORT);
});