const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const Blog = require('./data');
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");




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


const server = http.createServer(app);

const io = socketio(server);

io.on('connection', (sock) => {
  console.log('Someone connected');
  sock.emit('message', 'Hi, you are connected');

  sock.on('message', (text) => {
    io.emit('message', text);
  });

  async function creation(text, text1, text2){
    const blog = new Blog({
      title: text,
      price: text1,
      description: text2
    });

    await blog.save()
      .then((result) => {
          listing();
          sock.emit("created");
      })
      .catch((err) => {
          console.log("ERROR in create: ", err);
      });
  }

  async function creating(text, text1, text2) {
    await Blog.find({title: text})
      .then((result) =>  {
        if (result.length > 0){
          sock.emit("title-exists");
        }
        else{
          creation(text, text1, text2);
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

  async function deletion(text1){
    await Blog.deleteOne({title: text1})
    .catch((err) => {
      console.log("Error in deleting in update: ", err);
    });
  }

  async function deleting(text) {
    Blog.find({title: text})
      .then((result) => {
        if (result.length > 0){
          deletion(text);
          listing();
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

  

  sock.on('update', (text1, text2, text3, text4) => {
      console.log('updating...');
      Blog.find({title: text1})
        .then((result) => {
          if(result.length > 0){
            Blog.find({title: text2})
            .then((result2) => {
              if (result2.length > 0){
                sock.emit('title-exists');
              }
              else{
                if (text2 == ""){
                  text2 = result[0].title;
                }
                if (text3 == ""){
                  text3 = result[0].price;
                }
                if (text4 == ""){
                  text4 = result[0].description;
                }
                deletion(text1);
                creation(text2, text3, text4);
              }
            })
            .else((err) => {
              console.log("Error in updating: ", err);
            })
          }
          else {
            sock.emit('title-dne');
          }
        })
        .catch((err) => {
          console.log("Error in updating: ", err)
        });
  });

  sock.on('list', function(){
      listing();
  });

  async function setCSV() {
    await Blog.find({}).lean().exec((err, data) => {
      if (err) throw err;
      const csvFields = ['title', 'price', 'description'];
      const json2csvParser = new Json2csvParser({csvFields});
      const csvData = json2csvParser.parse(data);
      fs.writeFileSync("./client/build/mongodb_to_csv_file.csv", csvData, function(error) {
        if (error) throw error;
        console.log("Successfully write to csv file");
      });
    });
  }

  async function listing(){
    await Blog.find()
      .then((result) => {
        if (result.length > 0){
          setCSV();
        }
        else {
          fs.writeFileSync("./client/build/mongodb_to_csv_file.csv", "", function(){console.log("cleared csv file")});
        }
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