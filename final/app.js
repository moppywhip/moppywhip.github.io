var express = require('express');
var routes_general = require('./routes/routes_general.js');
var routes_msg = require('./routes/routes_msg.js');
var routes_wall = require('./routes/routes_wall.js');
var session = require('express-session');

var db = require('./models/database.js');
var app = express();
var path = require("path");
var http = require("http").Server(app);
var serveStatic = require('serve-static');
var path = require('path');
const io = require("socket.io")(http);
var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();



app.use(serveStatic(path.join(__dirname, 'public')));
const sessionMiddleware = session({secret: 'rin'})
app.use(express.urlencoded());
app.use(sessionMiddleware);
const wrap = middleware => (socket, next) => middleware(socket.request,{},next)
//app.use(express.bodyParser());
//app.use(express.static(path.join(__dirname, "public")))
io.on("connection", function(socket){
	
	socket.on("roomChange", obj =>{
		console.log("currently in room: "+obj.prevId);
		console.log("joining: "+obj.id)
		if(obj.prevId!=undefined){
			socket.leave( obj.prevId);
		}
		socket.join(obj.id);
	});
	
	socket.on("addFriend", obj =>{
		
		
		db.lookup("GroupOfMember", "username",obj.friend,['id'], function(err, data){
			if(err){
				console.log(err);
			}else{
				
				data_arr = data[0].id.L
				inp = []
				data_arr.forEach(item => inp.push(item.S));
				inp.push(String(obj.id));
				const params = {
				    Key:{
						"username":obj.friend
					},
					TableName:"GroupOfMember",
					UpdateExpression: "set id = :r",
					ExpressionAttributeValues: {
						":r": inp
					}
				}
				docClient.update(params, function(err, data){
				if(err){
					console.log(err);
					}
			});
					
			}
			
		});
		
		db.lookup("newGroupMembers", "id", obj.id, ["username"], function(err, data){
			if(err){
				console.log(err);
			}else{
				
				data_arr = data[0].username.L
				inp = []
				data_arr.forEach(item => inp.push(item.S));
				inp.push(obj.friend);
				
				const params = {
				    Key:{
						"id":obj.id
					},
					TableName:"newGroupMembers",
					UpdateExpression: "set username = :r",
					ExpressionAttributeValues: {
						":r": inp
					}
				}
				docClient.update(params, function(err, data){
					if(err){
						console.log(err);
						}
				});
					
			}
			
		});
		
		
	
		
	})
	
	/*socket.on("removeMember", obj =>{
		
		db.lookup("GroupOfMember", "username",obj.member,['id'], function(err, data){
			if(err){
				console.log(err);
			}else{
				
				data_arr = data[0].id.L
				inp = []
				data_arr.forEach(item => inp.push(item.S));
				var index = inp.indexOf(obj.id);
				inp.splice(index, 1);
				
				const params = {
				    Key:{
						"username":obj.member
					},
					TableName:"GroupOfMember",
					UpdateExpression: "set id = :r",
					ExpressionAttributeValues: {
						":r": inp
					}
				}
				docClient.update(params, function(err, data){
				if(err){
					console.log(err);
					}
			});
					
			}
			
		});
		
		db.lookup("newGroupMembers", "id", obj.id, ["username"], function(err, data){
			if(err){
				console.log(err);
			}else{
				
				data_arr = data[0].username.L
				inp = []
				data_arr.forEach(item => inp.push(item.S));
				var index = inp.indexOf(obj.member);
				inp.splice(index, 1);
				
				const params = {
				    Key:{
						"id":obj.id
					},
					TableName:"newGroupMembers",
					UpdateExpression: "set username = :r",
					ExpressionAttributeValues: {
						":r": inp
					}
				}
				docClient.update(params, function(err, data){
					if(err){
						console.log(err);
						}
				});
					
			}
			
		});
		
		io.to(obj.id).emit("leaveRoom",obj);
		
		
		
	
		
	});*/
	
	socket.on("chat message", obj => {
		const d = new Date();
		let time = d.getTime();
		//let user = "zuck";
		let user = socket.request.session.userId;
		console.log(user);
		console.log("\n\n\n");
		
		
		var columns = [
			{column: "id", value:obj.sender, type:"S"},
			{column:"from", value:user, type:"S"},
			{column:"message",value:obj.text, type:"S"},
			{column:"timestamp",value:String(time), type:"S"}
		]
		obj.text = "From: "+user+" Message: "+ obj.text;
		
		db.put("newMessage", "id", obj.sender, columns, function(err){
			if(err){
				console.log(err);
			}
		})
		
		
		
		io.to(obj.sender).emit("chat message", obj);
	})
	
	
})

io.use(wrap(sessionMiddleware));
app.get('/', routes_general.get_main);
app.get('/settings', routes_general.get_settings);
app.post('/settings-update', routes_general.post_settings);
app.get('/signup', routes_general.signup);
app.post('/createaccount', routes_general.create_account);
app.get('/login', routes_general.login);
app.post('/checklogin', routes_general.check_login);
app.get("/friends",routes_general.get_friends);
app.post("/removeFriend",routes_general.remove_friends);
app.post("/addFriend",routes_general.add_friends);
app.get("/messages", routes_msg.get_messages);
app.post("/messageGroups", routes_msg.post_message_groups);
app.post("/messageContents", routes_msg.post_message_contents);
app.get("/createPost", routes_wall.create_post);
app.post("/makePost", routes_wall.make_post);
app.post("/makeComment", routes_wall.make_comment);
app.post("/message_Submit", routes_msg.messageSubmit);
app.post("/groupUsers", routes_msg.post_users_groups);
app.get("/getUserFriends/:user", routes_general.get_user_friends);
app.get('/home', routes_wall.get_home);
app.post("/getFriends",routes_msg.my_friends);
app.post("/currMembersOfRoom", routes_msg.currMembers)
http.listen(8080);
console.log("Running on port 8080!");
