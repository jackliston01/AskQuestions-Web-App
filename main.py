from flask import Flask, request, session, redirect, url_for, render_template
import os, random, time
from flask_socketio import join_room, leave_room, SocketIO, send, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "vansucks"
socketio = SocketIO(app)
roomdict = {}
def genroomid(length):
    chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] #31 items
    roomid = ""
    for i in range(length):
        roomid += random.choice(chars)
    return roomid
    



@app.route('/', methods=['GET', 'POST'])
def home():
    session.clear()
    if request.method == "POST":
        name = request.form.get("name")
        roomnum = request.form.get("roomnum")
        createroom = request.form.get("createroom", False)
        joinroom = request.form.get("joinroom", False)
    
        if not name or len(name)>20:
            print("bad")
            return render_template('home.html', name=name, error = "Enter a valid name (20 chars max.):" )
        if createroom != False:
            while True:
                newroom = genroomid(5)
                if newroom in roomdict:
                    continue
                else:
                    break
            session["name"] = name
            session["room"] = newroom
            
            roomdict[newroom] = {'messages': [], 'admin': name, 'members': [], 'membercount': 0, 'totalmessages': 0}
            print(roomdict)

            return redirect(url_for("room"))

        if (joinroom != False and not roomnum):
            
            return render_template('home.html', name=name, error = "Enter a room numer" )
        elif  roomnum not in roomdict:
            return render_template('home.html', name=name, error = "Not a valid room number" )
        if name in roomdict[roomnum]['members']:
                return render_template('home.html', name="", error = "Name already taken" )
        else:
            session["name"] = name
            session["room"] = roomnum
            print(session.get('room'))
            print(roomdict)
        
            return redirect(url_for("room"))


    return render_template('home.html', name="" )

@app.route('/room')
def room():
    if not session.get("room"):
        session.clear()
        return redirect(url_for("home"))
    
    name = session.get("name")
    room = session.get("room")
    print(name, room)

    return render_template('room.html', name=name, roomid=room, admin=roomdict[room]['admin'])
@socketio.on("connect")
def connect(auth):
    if not session.get("room"):
        session.clear()
        emit('redirecthome', {'url': "/"} )
        return
    room = session.get("room")
    name = session.get("name")
    if not room or not name:
        session.clear()
        print('error, room or name not found')
        emit('redirecthome', {'url': "/"} )
        return
    if room not in roomdict:
        leave_room(room)
        session.clear()
        print('error, room not found')
        emit('redirecthome', {'url': "/"} )
        return
    emit("joined", {'roomdict': roomdict}, to=room)

    print(room, name)
    join_room(room)
    if session.get("name") not in roomdict[session.get('room')]['members']:
        roomdict[room]['members'].append(name)
        roomdict[room]['membercount'] += 1
        print(roomdict)
    emit("connection", {"name": name, "room": room}, room=request.sid)
    emit("joined", {'roomdict': roomdict}, to=room)

    return
@socketio.on("inquiry")
def inquiry(data):
    print(data)
    if data['roomid'] not in roomdict:
        leave_room(data.roomid)
        session.clear()
        emit('redirecthome', {'url': "/"} )
        return
    room = data['roomid']
    print(data['question'])
    id = (f'{(session.get('name')).replace(' ', '').lower()}{data['time']}')
    roomdict[room]['messages'].append({'name': session.get('name'), 'question': data['question'], 'time': data['time'], 'id': id, 'replies': [] })
    roomdict[room]['totalmessages'] += 1
    print(roomdict[room])
    emit('inquiry', {'roomdict': roomdict}, to=data['roomid'])

@socketio.on("reply")
def reply(data):
    

    print(data)
    room = data['roomid']
    for i in range(len(roomdict[room]['messages'])):
        if roomdict[room]['messages'][i]['id'] == data['childof']:
            roomdict[room]['messages'][i]['replies'].append({'name': data['user'], 'replycontent': data['replycontent'], 'replytype': data['replytype'], 'time': data['time'], 'childof': data['childof'] })
            break
    print('000')
    print(roomdict)
    print('000')
    emit('reply', {'roomdict': roomdict}, to=data['roomid'])






if __name__ == '__main__':
    socketio.run(app, debug=True)