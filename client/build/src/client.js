const sock = io();



const create = (e) => {
    e.preventDefault();
    const input = document.querySelector('#create-chat');
    const text = input.value.trim();
    input.value = '';

    const input1 = document.querySelector('#create-price');
    const text1 = input1.value;
    input1.value = '';

    const input2 = document.querySelector('#create-description');
    const text2 = input2.value.trim();
    input2.value = '';

    if ((text == "") || (text1 == "") || (text2 == "")){
        alert("all fields are required to be filled in");
    }
    else{
        sock.emit('create', text, text1, text2);
    }
}
document
    .querySelector('#create-form')
    .addEventListener('submit', create);


const del = (e) => {
    e.preventDefault();
    const input = document.querySelector('#delete-chat');
    const text = input.value.trim();
    input.value = '';

    sock.emit('delete', text);
}
document
    .querySelector('#delete-form')
    .addEventListener('submit', del);

const update = (e) => {
    e.preventDefault();
    const input1 = document.querySelector('#update-chat1');
    const text1 = input1.value.trim();
    input1.value = '';
    
    const input2 = document.querySelector('#update-chat2');
    const text2 = input2.value.trim();
    input2.value = '';

    const input3 = document.querySelector('#update-price');
    const text3 = input3.value;
    input3.value = '';

    const input4 = document.querySelector('#update-description');
    const text4 = input4.value.trim();
    input4.value = '';

    if ((text2 == "") && (text3 == "") && (text4 == "")){
        alert("Please add a new information to update");
    }
    else{
        sock.emit('update', text1, text2, text3, text4);
    }
}
document
    .querySelector('#update-form')
    .addEventListener('submit', update);

sock.on('listed', (data) => {
    if (data.length > 0){
        var table = document.createElement("table");
        var tBody = document.createElement("tbody");

        var tr1 = document.createElement("tr");

        var th1 = document.createElement("th");
        var thText1 = document.createTextNode("Title");
        th1.appendChild(thText1);

        var th2 = document.createElement("th");
        var thText2 = document.createTextNode("Price");
        th2.appendChild(thText2);

        var th3 = document.createElement("th");
        var thText3 = document.createTextNode("Description");
        th3.appendChild(thText3);

        tr1.appendChild(th1);
        tr1.appendChild(th2);
        tr1.appendChild(th3);
        tBody.appendChild(tr1);


        data.forEach(datum => {
            var tr = document.createElement("tr");

            var td1 = document.createElement("td");
            var tdText1 = document.createTextNode(datum.title);
            td1.appendChild(tdText1);

            var td2 = document.createElement("td");
            var tdText2 = document.createTextNode(datum.price);
            td2.appendChild(tdText2);

            var td3 = document.createElement("td");
            var tdText3 = document.createTextNode(datum.description);
            td3.appendChild(tdText3);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tBody.appendChild(tr);
        });

        table.appendChild(tBody);

        const parent = document.querySelector('#tables');
        parent.innerHTML = "";

        parent.appendChild(table);
    }
    else {
        const parent = document.querySelector('#tables');
        parent.innerHTML = "";
    }
    
});

const csv = (e) => {
    sock.emit('csv');
}
document.querySelector('#csv').addEventListener('click', csv);

sock.on('title-exists', () => {
    alert("The title that you wish to create already exists");
});

sock.on('created', () => {
    alert("successfully created");
});

sock.on('deleted', () => {
    alert("successfully deleted");
});

sock.on('title-dne', () => {
    alert("the title does not exist");
});




