var express = require('express'),
    app = express(),
    path = require('path'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];
messages = [];

// set view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

// set static path
app.use(express.static(path.join(__dirname, 'public')));

// connect to socket
io.sockets.on('connection', function (socket) {
    // set username
    socket.on('set user', function (data, callback) {
        if (users.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsers();
        }
    });

    function updateUsers() {
        io.sockets.emit('users', users);
    }

    socket.on('send message', function (data) {
        var username = socket.username;
        var msg = data;
        var now = new Date();
        var now_utc = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());

        io.sockets.emit('show message', {
            user: username,
            msg: msg,
            time: now_utc.toTimeString().substring(0, 8)
        });
        var message = {username: username, msg: msg, time: now_utc};
        messages.push(message);
    });

    socket.on('disconnect', function (data) {
        if (!socket.username) return;
        users.splice(users.indexOf(socket.username), 1);
        updateUsers();
    });

});


// index route
app.get('/', function (req, res) {
    res.render('index');
});

server.listen(process.env.PORT || 3000);
console.log('Server Started...');