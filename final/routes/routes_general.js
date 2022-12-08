var db = require('../models/database.js');
var security = require('../models/cipher.js');
var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

//helper function to verify session
//TODO: change this depending on how login session is set up
var verifyUser = function(req) {
	var session = req.session;
	if(!session.userId) {
		return false;
	}
	return true;
}

var getMain = function(req, res) {
	session = req.session;
    res.render("main.ejs");
};

var signup = function(req, res) {
  if (req.query.error == 1) {
	res.render('signup.ejs', {error: "There was an error signing up, please try again."});
  } else if (req.query.error == 2) {
	res.render('signup.ejs', {error: "That username already exists, please enter a different one."});
  } else {
	res.render('signup.ejs', {error: null});
  }
}

var createAccount = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var birthday = req.body.birthday;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  // interests, affiliation, friends initiated later
  if (username.replace(/\s+/g, '') == '' || password.replace(/\s+/g, '') == '' || email.replace(/\s+/g, '') == '' || birthday.replace(/\s+/g, '') == '' || firstname.replace(/\s+/g, '') == '' || lastname.replace(/\s+/g, '') == '') {
	res.redirect('/signup?error=1')
  } else {
	  // check if already exists
	  db.lookup('Settings', 'username', username, [], function(err, data) {
		if (data) {
			// already exists
			res.redirect('/signup?error=2')
		} else {
			var columns = [
			{
				column: 'password',
				value: password,
				type: 'S'
			},
			{
				column: 'email',
				value: email,
				type: 'S'
			},
			{
				column: 'birthday',
				value: birthday,
				type: 'S'
			},
			{
				column: 'affiliation',
				value: "test",
				type: 'S'
			},
			/*TODO: add list processing for interests later with ui
			{ 
				column: 'interests',
				value: req.body.interests,
				type: 'S'
			},*/
			{
				column: 'interests',
				value: [],
				type: 'L'
			},
			{
				column: 'friends',
				value: [],
				type: 'L'
			},
			{
				column: 'firstname',
				value: firstname,
				type: 'S'
			},
			{
				column: 'lastname',
				value: lastname,
				type: 'S'
			}
			];
			db.put('Settings', 'username', username, columns, function(err, data) {
		    if (err) {
			  console.log(err)
			  res.redirect('/signup?error=1')
		    } else if (data) {
			  console.log("signed up successfully")
			  session = req.session;
			  session.userId = req.body.username;
			  res.redirect('/home');
			  console.log(req.session);
			  // Redirect to appropriate page
		    } else {
			  res.redirect('/signup?error=1')
		    }
		  });
		}
	  });

  }
};

var login = function(req, res) {
  session = req.session;
  if (req.query.error == 1) {
	res.render('login.ejs', {error: "The username and/or password is not valid."});
  } else if (req.query.error == 2) {
	res.render('login.ejs', {error: "You must log in before accessing that page!"});
  } else {
	res.render('login.ejs', {error: null});
  }
};

// check if login is valid
var checkLogin = function(req, res) {
  username = req.body.username;
  password = req.body.password;
  if (username == "" || password == "") {
	res.redirect('/login?error=1')
  } else {
	  db.lookup('Settings', 'username', username, ['password'], function(err, data) {
	    if (err || data.length == 0) {
		  console.log(err)
		  res.redirect('/login?error=1')
	    } else if (data) {
		  console.log(data[0]['password']['S'])
		  if (data[0]['password']['S'] == password) {
			  session = req.session;
			  session.userId = req.body.username;
			  console.log("logged in successfully")
			  res.redirect('/home')
	      } else {
		    console.log("username exists but password mismatch")
			res.redirect('/login?error=1')
		  }
	    } else {
			res.redirect('/login?error=1')
	    }
	  });
  }
};

var addFriend = function(req, res){
	//var userID = "zuck";
	var userID = req.session.userId;
	db.lookup("Settings", "username", userID, ['friends'], function(err, data){
		if (err) {
			console.log("errored out");
			console.log(err);
		} else {
			var foundfriend = false;
			const friendsList = data[0].friends.L;
			
			
			db.lookup("Settings","username",req.body.newfriend, ['friends'], function(err, data) {
				console.log("reaching verification");
				if (err) {
					console.log("error checking if friend exists");
					res.redirect("/friends");
					return;
				}
				if (data[0]==undefined) {
					console.log("friend does not exit(?)");
					res.redirect("/friends?error=1");
					return;
				} else {
					
					var inp = [];
			friendsList.forEach(item =>{
				inp.push(item.S);
			});
			inp.push(req.body.newfriend);
			const params = {
			        Key:{
				"username":userID
				},
				TableName:"Settings",
				UpdateExpression: "set friends = :r",
				ExpressionAttributeValues: {
					":r": inp
				}
			}
			
			docClient.update(params, function(err, data){
				if(err){
					console.log(err);
					res.redirect("/friends");
				} else {
					res.redirect("/friends");
				}
			});
			
			db.lookup("Settings","username",req.body.newfriend, ['friends'], function(err, data_inner){
						if(err){
					console.log("errored out");
					console.log(err);} else{
						const friendsList_inner = data_inner[0].friends.L;
						var inp = [];
					friendsList_inner.forEach(item =>{
						inp.push(item.S);
					});
					inp.push(userID);
					const params = {
					    Key:{
							"username":req.body.newfriend
						},
						TableName:"Settings",
						UpdateExpression: "set friends = :r",
						ExpressionAttributeValues: {
							":r": inp
						}
					}
					docClient.update(params, function(err, data){
						if(err){console.log(err)}
						
					});
					
						}
					}
				
			);
				}	
			});
		
			
			
		}
	});
}

var removeFriend  = function(req, res){
	//var userID = "zuck";
	var userID = req.session.userId;
	db.lookup("Settings", "username", userID, ['friends'], function(err, data){
		if(err){
			console.log("errored out");
			console.log(err);
		} else{
			const friendsList = data[0].friends.L;
				
			var inp = [];
			friendsList.forEach(item =>{
				inp.push(item.S);
			});
			
			var index = inp.indexOf(req.body.username);
			inp.splice(index, 1);	
			const params = {
			    Key:{
					"username":userID
				},
				TableName:"Settings",
				UpdateExpression: "set friends = :r",
				ExpressionAttributeValues: {
					":r": inp
				}
			}
			docClient.update(params, function(err, data){
				if(err){
					console.log(err);
					res.redirect("/friends");
				} else{
					res.redirect("/friends");
				}
			});
			
			db.lookup("Settings","username",req.body.username, ['friends'], function(err, data_inner){
					if(err){
				console.log("errored out");
				console.log(err);} else{
					const friendsList_inner = data_inner[0].friends.L;
					var inp = [];
				friendsList_inner.forEach(item =>{
					inp.push(item.S);
				});
				var index = inp.indexOf(userID);
				inp.splice(index, 1);	
				const params = {
				    Key:{
						"username":req.body.username
					},
					TableName:"Settings",
					UpdateExpression: "set friends = :r",
					ExpressionAttributeValues: {
						":r": inp
					}
				}
				docClient.update(params, function(err, data){
					if(err){console.log(err)}
					
				});
				
			}
				
				}
			);
			
			
		}
	});
	//res.redirect("/friends");
}

var getFriends = function(req, res) {
	if(!verifyUser(req)) {
		res.redirect('/');
		return;
	}
	
	const userID = req.session.userId;
	//const userID = "zuck";
	db.lookup("Settings", "username", userID, ['firstname','lastname','friends'], function(err, data){
		if(err){
			console.log(err);
			
		} else{
			var err = undefined;
			if(req.query.error==1){
				err = "friend does not exist!";
			}
			const dataitem = data[0];
			res.render("friends.ejs", {
				user: userID, 
				firstname:data[0].firstname.S, 
				lastname:data[0].lastname.S, 
				friends: dataitem.friends.L, err: err
			});
		}
	});
	
	
};



//renders settings page
var getSettings = function(req, res) {
	if(!verifyUser(req)) {
		res.redirect('/');
		return;
	}
	
	const user = req.session.userId;
	
	db.lookup('Settings', 'username', user, ['affiliation', 'birthday', 'email', 'firstname', 'lastname', 'interests'], function(err,data) {
		if(err || data.length == 0) {
			if(err) console.log(err);
			if(data.length == 0) console.log("no associated username found for: "+foo);
			res.redirect("/");
		}
		else {
			const dataitem = data[0];
			res.render("settings.ejs", {
				username: user, 
				email: dataitem.email.S, 
				birthday: dataitem.birthday.S, 
				affiliation: dataitem.affiliation.S, 
				interests: dataitem.interests.L,
				firstname: dataitem.firstname.S, 
				lastname: dataitem.lastname.S
			});
		}
	});
	
	//placeholder lookup
	
	/*
	const foo = 'zuck';
	db.lookup('Settings', 'username', foo, ['affiliation', 'birthday', 'email', 'firstname', 'lastname', 'interests'], function(err,data) {
		if(err || data.length == 0) {
			if(err) console.log(err);
			if(data.length == 0) console.log("no associated username found for: "+foo);
			res.redirect("/");
		}
		else {
			var dataitem = data[0];
			res.render("settings.ejs", {
				username: foo, 
				email: dataitem.email.S, 
				birthday: dataitem.birthday.S, 
				affiliation: dataitem.affiliation.S, 
				interests: dataitem.interests.L,
				firstname: dataitem.firstname.S, 
				lastname: dataitem.lastname.S
			});
		}
	});*/
}

//function to process changes to settings by post request
var postSettings = function(req, res) {
	if(req.session.userId == null) {
		res.redirect('/');
		return;
	}
	const foo = 'zuck';
	
	//TODO: remove interests from lookup list once properly implemented
	db.lookup('Settings', 'username', foo, ['password', 'interests', 'friends'], function(err,data) {
		var columns = [
			{
				column: 'email',
				value: req.body.email,
				type: 'S'
			},
			{
				column: 'birthday',
				value: req.body.birthday,
				type: 'S'
			},
			{
				column: 'affiliation',
				value: req.body.affiliation,
				type: 'S'
			},
			/*TODO: add list processing for interests later with ui
			{ 
				column: 'interests',
				value: req.body.interests,
				type: 'S'
			},*/
			{
				column: 'interests',
				value: data[0].interests.L,
				type: 'L'
			},
			{
				column: 'friends',
				value: data[0].friends.L,
				type: 'L'
			},
			{
				column: 'firstname',
				value: req.body.firstname,
				type: 'S'
			},
			{
				column: 'lastname',
				value: req.body.lastname,
				type: 'S'
			}
		];
		
		if (req.body.oldpassword === "" && req.body.newpassword === "") {
			//console.log("not changing pw");
			columns.push({
				column: 'password',
				value: data[0].password.S,
				type: 'S'
			});
			db.put('Settings', 'username', foo, columns, function(err){
				if (err) {
					console.log(err);
					res.redirect('/');
				}
				else {
					res.redirect('/settings');
				}
			});
		}
		//change to password
		else {
			//console.log("changing pw");
			if(req.body.oldpassword === security.decrypt(data[0].password.S)){
				//TODO: add processing for new password here
				columns.push({
					column: 'password',
					value: security.encrypt(req.body.newpassword),
					type: 'S'
				});
				db.put('Settings', 'username', foo, columns, function(err){
					if (err) {
						console.log(err);
						res.redirect('/');
					}
					else {
						res.redirect('/settings');
					}
				});
			}
			else {
				res.redirect('/settings');
			}
		}
	});
	//no change to password
}

var getUserFriends = function(req, res) {
	var userID = req.params.user;
	db.lookup("Settings", "username", userID, ['friends', 'firstname', 'lastname'], function(err, data){
		if(err){
			console.log("errored out");
			console.log(err);
			res.send("bad");
		} else if(data.length == 0){
			res.send("bad");
		}
		else{
			console.log(data[0].friends);
			var children = []; data[0].friends.L.forEach(x => children.push({id: x.S, name: x.S}));
			var json = {
				"id": userID,
				"name": data[0].firstname.S + ' '+ data[0].lastname.S,
				"children": children,
	        	"data": []
	    	};
	    	res.send(json);
		}
	});
	
}


var routes = { 
    get_main: getMain,  //general
    signup: signup, //general
    create_account: createAccount, //general
    login: login, //general
    check_login: checkLogin, //general
    get_settings: getSettings, //general
    post_settings: postSettings, //general
    get_friends: getFriends, //general
    remove_friends: removeFriend, //general
    add_friends:addFriend, //general
	get_user_friends: getUserFriends, //general
};


module.exports = routes;


