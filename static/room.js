var socketio = io();
sessionStorage.clear()
var memberlist = ''
const lobbyinfo = document.getElementById("lobbyinfo")
socketio.on("connection", (data) => {
    sessionStorage.setItem('name', data.name)
    sessionStorage.setItem('room', data.room)
})
socketio.on("joined", (data) => {
    document.querySelectorAll('.replies').forEach(el => el.remove());
    const roomid = sessionStorage.getItem('room');
    const messages = data.roomdict[roomid].messages
    console.log('yooooyoo')
    memberlist = ""
    roomdict = data.roomdict
    console.log(roomdict)
    for (let i = 0; i < roomdict[roomid]['members'].length; i++) {
        memberlist += ("<br>" + roomdict[roomid]['members'][i])
        lobbyinfo.innerHTML = `${(roomdict[roomid]['membercount'])} Eager Question Askers <br> ${memberlist}`
    }
    const board = document.getElementById("board");
    if (board.querySelectorAll('div').length === 0) {
        console.log(data.roomdict[roomid].messages)
        console.log(data)
        console.log('---')
        const messages = data.roomdict[roomid].messages
        const board = document.getElementById('board')
        for (const message of messages) {
            const div = document.createElement("div");
            div.setAttribute("data-id", message.id);
            div.setAttribute("class", 'message');
            div.setAttribute('id', message.id)
            const formattedtime = new Date(message.time)
            const clocktime = formattedtime.toTimeString().slice(0, 8);
            div.textContent = `${message.name} [${clocktime}]: ${message.question}`;
            board.appendChild(div);
            const replybutton = document.createElement('button')
            replybutton.textContent = 'Reply'
            replybutton.setAttribute('class', 'reply-btn')
            replybutton.setAttribute('onclick', 'openreply()')
            replybutton.setAttribute('data-id', message.id)
            const aibutton = document.createElement('button')
            aibutton.textContent = 'AI ' + String.fromCharCode(0x2728);
            aibutton.setAttribute('class', 'ai-btn')
            aibutton.setAttribute('onclick', 'openai()')
            aibutton.setAttribute('data-id', message.id)
            
            const deletebutton = document.createElement('button')
            deletebutton.textContent = 'Delete'
            deletebutton.setAttribute('class', 'delete-btn')
            deletebutton.setAttribute('onclick', 'opendelete()')
            deletebutton.setAttribute('data-id', message.id)
            
            document.querySelector(`[data-id="${message.id}"]`).appendChild(replybutton)
            document.querySelector(`[data-id="${message.id}"]`).appendChild(aibutton)

            document.querySelector(`[data-id="${message.id}"]`).appendChild(deletebutton)
        }
    }
    messages.forEach(i => {
        if (!i.replies || i.replies.length === 0) {
            console.log('empty')
        } 
        else {
            for (var j = 0; j < i.replies.length; j++) {
                const replydiv = document.createElement("div");
                replydiv.setAttribute('class', 'replies')
                replydiv.textContent = `${i.replies[j].name} : ${i.replies[j].replycontent}`;
                const tag = document.createElement('div')
                tag.setAttribute('class', 'replies')
                if (i.replies[j].replytype === 'feedback') {
                    tag.setAttribute('id', 'feedback')
                    tag.textContent = "Feedback"
                } 
                else if (i.replies[j].replytype === 'further') {
                    tag.setAttribute('id', 'further')
                    tag.textContent = "Further Question"
                }
                else if (i.replies[j].replytype === 'airesponse'){
                    tag.setAttribute('id', 'airesponse')
                    tag.textContent = "AI Answer"

                }
                else if (i.replies[j].replytype === 'strengthen'){
                    tag.setAttribute('id', 'strengthen')
                    tag.textContent = "AI Suggestions for Improving Question"

                }
                replydiv.appendChild(tag);
                parentdiv = document.getElementById(i.replies[j].childof)
                parentdiv.appendChild(replydiv);
            }
        }
    })

    adminvisibility(data)

})

socketio.on("redirecthome", (data) => {
    console.log()
    console.log("Redirecting to", data.url);
    window.location.href = data.url;
});

function sendQuestion() {
    sQ = document.getElementById("question").value
    if (sQ === "") {
        return
    }
    console.log(sQ)
    const name = sessionStorage.getItem('name')
    const roomid = sessionStorage.getItem('room')
    socketio.emit("inquiry", {
        "question": sQ,
        "user": name,
        'roomid': roomid,
        'time': Date.now()
    })
}
socketio.on('inquiry', (data) => {
    document.querySelectorAll('.message').forEach(el => el.remove());
    const roomid = sessionStorage.getItem('room');
    console.log(data.roomdict[roomid].messages)
    console.log(data)
    console.log('---')
    const messages = data.roomdict[roomid].messages
    const message = messages[messages.length - 1]
    console.log(message)
    const board = document.getElementById("board");
    if (board.querySelectorAll('div').length === 0) {
        console.log(data.roomdict[roomid].messages)
        console.log(data)
        console.log('---')
        const messages = data.roomdict[roomid].messages
        const board = document.getElementById('board')
        for (const message of messages) {
            const div = document.createElement("div");
            div.setAttribute("data-id", message.id);
            div.setAttribute("class", 'message');
            div.setAttribute('id', message.id)
            const formattedtime = new Date(message.time)
            const clocktime = formattedtime.toTimeString().slice(0, 8);
            div.textContent = `${message.name} [${clocktime}]: ${message.question}`;
            board.appendChild(div);
            const replybutton = document.createElement('button')
            replybutton.textContent = 'Reply'
            replybutton.setAttribute('class', 'reply-btn')
            replybutton.setAttribute('onclick', 'openreply()')
            replybutton.setAttribute('data-id', message.id)
            const aibutton = document.createElement('button')
            aibutton.textContent = 'AI ' + String.fromCharCode(0x2728);
            aibutton.setAttribute('class', 'ai-btn')
            aibutton.setAttribute('onclick', 'openai()')
            aibutton.setAttribute('data-id', message.id)
            const deletebutton = document.createElement('button')
            deletebutton.textContent = 'Delete'
            deletebutton.setAttribute('class', 'delete-btn')
            deletebutton.setAttribute('onclick', 'opendelete()')
            deletebutton.setAttribute('data-id', message.id)
            
            document.querySelector(`[data-id="${message.id}"]`).appendChild(replybutton)
            document.querySelector(`[data-id="${message.id}"]`).appendChild(aibutton)

            document.querySelector(`[data-id="${message.id}"]`).appendChild(deletebutton)
        }
    }
    addreplies(messages)
    var numberofreplies = true
    adminvisibility(data)
})

socketio.on('reply', (data) => {
    document.querySelectorAll('.replies').forEach(el => el.remove());
    const roomid = sessionStorage.getItem('room');
    const messages = data.roomdict[roomid].messages
    addreplies(messages)
    adminvisibility(data)

})

function openreply() {
    console.log('reply function called')
    const replymenu = document.getElementById('replymenu')
    replymenu.style.display = (replymenu.style.display === 'block') ? 'none' : 'block';
}

function opendelete() {
    console.log('delete function called')
    const deletemenu = document.getElementById('deleteconfirmation')
    deletemenu.style.display = (deletemenu.style.display === 'block') ? 'none' : 'block';
}

function deletemessage() {
    const deletemenu = document.getElementById('deleteconfirmation')
    current = (localStorage.getItem("currentreply"))
    deletemenu.style.display = 'none';
    socketio.emit("delete", {
        "current": current,
        "user": sessionStorage.getItem('name'),
        "roomid": sessionStorage.getItem('room')
    })
}

function sendreply() {
    console.log('sumbitted')
    const replymenu = document.getElementById('replymenu')
    replymenu.style.display = 'none';
    const replytype = document.querySelector('input[name="replytype"]:checked').value
    const replycontent = document.getElementById('replybox').value
    const name = sessionStorage.getItem('name')
    const roomid = sessionStorage.getItem('room')
    socketio.emit("reply", {
        "childof": (localStorage.getItem("currentreply")),
        "replycontent": replycontent,
        "replytype": replytype,
        "user": name,
        'roomid': roomid,
        'time': Date.now()
    })
}
document.addEventListener('click', function(event) {
    if (event.target.matches('button[data-id]')) {
        const dataid = event.target.getAttribute("data-id")
        console.log(dataid)
        localStorage.setItem("currentreply", dataid)
    }
    const replymenu = document.getElementById('replymenu')
    const replyBtns = document.querySelectorAll('.reply-btn')
    const clickedInsideBtn = Array.from(replyBtns).some(btn => btn.contains(event.target));
    if (!clickedInsideBtn && !replymenu.contains(event.target)) {
        console.log('hidden')
        replymenu.style.display = 'none';
    }
    const deletemenu = document.getElementById('deleteconfirmation')
    const deleteBtns = document.querySelectorAll('.delete-btn')
    const clickedInsideBtn1 = Array.from(deleteBtns).some(btn => btn.contains(event.target));
    if (!clickedInsideBtn1 && !deletemenu.contains(event.target)) {
        console.log('hidden')
        deletemenu.style.display = 'none';
    }
    const aimenu = document.getElementById('aimenu')
    const aiBTNS = document.querySelectorAll('.ai-btn')
    const clickedInsideBtn2 = Array.from(aiBTNS).some(btn => btn.contains(event.target));
    if (!clickedInsideBtn2 && !aimenu.contains(event.target)) {
        console.log('hidden')
        
        aimenu.style.display = 'none';
    }
   
});

function adminvisibility(data){
    console.log('adminvis')
    console.log(data)
    const roomid = sessionStorage.getItem('room');
    if (data.roomdict[roomid]['admin'] == sessionStorage.getItem('name')) {
    sessionStorage.setItem('admin', true)
    console.log('admin')
    const messages = data.roomdict[roomid].messages
    document.querySelectorAll('.delete-btn').forEach(el => {
        el.style.display = 'block'
    })
} else {
    const messages = data.roomdict[roomid].messages
    document.querySelectorAll('.replies').forEach(el => {
        el.style.display = (el.style.display === 'none')
    })
}
}

function addreplies(messages){

    messages.forEach(i => {
        if (!i.replies || i.replies.length === 0) {
            console.log('empty')
        } else {
            for (var j = 0; j < i.replies.length; j++) {
                const replydiv = document.createElement("div");
                replydiv.setAttribute('class', 'replies')
                replydiv.textContent = `${i.replies[j].name} : ${i.replies[j].replycontent}`;
                const tag = document.createElement('div')
                tag.setAttribute('class', 'replies')
                if (i.replies[j].replytype === 'feedback') {
                    tag.setAttribute('id', 'feedback')
                    tag.textContent = "Feedback"
                } 
                else if (i.replies[j].replytype === 'further') {
                    tag.setAttribute('id', 'further')
                    tag.textContent = "Further Question"
                }
                else if (i.replies[j].replytype === 'airesponse'){
                    tag.setAttribute('id', 'airesponse')
                    tag.textContent = "AI Answer"

                }
                else if (i.replies[j].replytype === 'strengthen'){
                    tag.setAttribute('id', 'strengthen')
                    tag.textContent = "AI Suggestions for Improving Question"

                }
                replydiv.appendChild(tag);
                parentdiv = document.getElementById(i.replies[j].childof)
                parentdiv.appendChild(replydiv);
            }
        }
    })
}

function aisumbit(){
    const aimenu = document.getElementById('aimenu')
    aimenu.style.display = 'none';
    console.log('aisubmit')
    //hide ai??
    const aitype = document.querySelector('input[name="aitype"]:checked').value
    if (aitype == null){
        return
    }
    var aicontext = document.getElementById('aicontext').value
    if (aicontext == null || aicontext == ''){
        aicontext = 'no context'

    }
    const name = sessionStorage.getItem('name')
    const roomid = sessionStorage.getItem('room')
    socketio.emit("ai", {
        "childof": (localStorage.getItem("currentreply")),
        "aitype": aitype,
        "aicontext": aicontext,
        "user": name,
        'roomid': roomid,
        'time': Date.now()
    })

}

function openai(){
    console.log('ai open function called')
    const aimenu = document.getElementById('aimenu')
    aimenu.style.display = (aimenu.style.display === 'block') ? 'none' : 'block';

    console.log('openai')
}