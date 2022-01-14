const sock = io();

const writeEvent = (text) => {
    // <ul> element
    const parent = document.querySelector('#events');
  
    // <li> element
    const el = document.createElement('li');
    el.innerHTML = text;
  
    parent.appendChild(el);
};
  
const onFormSubmitted = (e) => {
    e.preventDefault();
  
    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';
  
    sock.emit('message', text);
};
  
writeEvent('Welcome to RPS');
  
  
sock.on('message', writeEvent);
  
document
    .querySelector('#chat-form')
    .addEventListener('submit', onFormSubmitted);


const create = (e) => {
    e.preventDefault();
    writeEvent("Creating...");
    const input = document.querySelector('#create-chat');
    const text = input.value;
    input.value = '';

    sock.emit('create', text);
}
document
    .querySelector('#create-form')
    .addEventListener('submit', create);
//document.querySelector('#create').addEventListener('click', create);

//sock.on("created", writeEvent);

const del = (e) => {
    e.preventDefault();
    writeEvent("Deleting...");
    const input = document.querySelector('#delete-chat');
    const text = input.value;
    input.value = '';

    sock.emit('delete', text);
}
document
    .querySelector('#delete-form')
    .addEventListener('submit', del);
//document.querySelector('#delete').addEventListener('click', del);

//sock.on("deleted", writeEvent);

const update = (e) => {
    e.preventDefault();
    writeEvent("Updating...");
    const input1 = document.querySelector('#update-chat1');
    const text1 = input1.value;
    input1.value = '';
    
    const input2 = document.querySelector('#update-chat2');
    const text2 = input2.value;
    input2.value = '';

    sock.emit('update', text1, text2);
}
document
    .querySelector('#update-form')
    .addEventListener('submit', update);
//document.querySelector('#update').addEventListener('click', update);

const list = (e) => {
    writeEvent("Listing...");
    sock.emit('list');
}
document.querySelector('#list').addEventListener('click', list);

sock.on('listed', (data) => {
    if(data.length > 0){
        data.forEach(datum => {
            writeEvent(datum.title);
        })
    }
})

