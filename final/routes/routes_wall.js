var db = require('../models/database.js');
var security = require('../models/cipher.js');
var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

var verifyUser = function(req) {
	var session = req.session;
	if(!session.userId) {
		return false;
	}
	return true;
}

var createPost = function(req, res) {
	if (req.session.userId != null) {
	  if (req.query.error == 1) {
		res.render('createpost.ejs', {error: "There was an error creating the post, please try again."});
	  } else {
		res.render('createpost.ejs', {error: null});
	  }
	} else {
		// add error message
		res.redirect('/')
	}
}

var makePost = function(req, res) {
	if (req.session.userId == null) {
		res.redirect('/')
	} else {
		let user = session.userId;
		const d = new Date();
		//var user = "john";
		let postId = user + d.getTime();
		var postTitle = req.body.postTitle;
		var postContent = req.body.postContent;
		var date = d.getTime().toString();
		console.log(req.body)
		console.log(date)
		console.log(postTitle)
		console.log(postContent)
		console.log(postId)
	  
		var columns = [
		{
			column: 'postDate',
			value: date,
			type: 'N'
		},
		{
			column: 'postTitle',
			value: postTitle,
			type: 'S'
		},
		{
			column: 'postContent',
			value: postContent,
			type: 'S'
		},
		{
			column: 'postUser',
			value: user,
			type: 'S'
		}
		];
		db.put('Posts', 'postId', postId, columns, function(err, data) {
			if (err) {
			  console.log(err)
			  res.redirect('/create_post?error=1')
			} else if (data) {
			  console.log("put post successfully!")
			  res.redirect('/view_posts')
			} else {
			  res.redirect('/create_post?error=1')
			}
		});
	}
}

var makeComment = function(req, res) {
	if(!verifyUser(req)) {
		res.redirect('/');
		return;
	}
	console.log(req.body);
}

var getHome = function(req, res) {
	if(!verifyUser(req)) {
		res.redirect('/');
		return;
	}
	const user = req.session.userId;
	db.lookup("Settings", "username", user, ['firstname', 'lastname', 'friends'], function(err, data){
		if(err){
			console.log("errored out");
			console.log(err);
			res.send("bad");
		} else if(data.length == 0){
			res.send("bad");
		}
		else{

			console.log(data[0].friends);
			//data[0].friends.L.forEach(x => children.push({id: x.S, name: x.S}));
			
			//TODO: replace dummy feed with promises from queries, use ajax?
			res.render('home.ejs',{
				user: req.session.userId,
				firstname: data[0].firstname.S,
				lastname: data[0].lastname.S,
				feed:[
					{
						type: 'post', 
						creator: 'Sad Student', 
						date: '2022-07-15T09:17:00-04:00', 
						likes: 10,
						data: {
							text: 'still doing nets hw :(',
							image: 'data:image/jpeg;base64,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'
						},
						comments: [
							{
								type: 'comment', 
								creator: 'Instructor', 
								date: '2022-07-16T09:17:00-04:00', 
								likes: 1,
								data: {
									text: 'lmao',
									image: 'none'
								},
								comments:[
									{
										type: 'comment', 
										creator: 'Sad Student', 
										date: '2022-08-15T09:17:00-04:00', 
										likes: 8,
										data: {
											text: 'y u do dis to us',
											image: 'none'
										},
										comments:[]
									},
									{
										type: 'comment', 
										creator: 'Angry Student', 
										date: '2022-09-15T09:17:00-04:00', 
										likes: 3,
										data: {
											text: 'bruvv',
											image: 'none'
										},
										comments:[]
									}
								]
							},
							{
								type: 'comment', 
								creator: 'TA', 
								date: '2020-09-15T09:17:00-04:00', 
								likes: 5,
								data: {
									text: 'cope lmao',
									image: 'none'
								},
								comments:[]
							}
						]
					},
					{
						type: 'post', 
						creator: 'elon', 
						date: '2022-07-15T10:17:00-04:00',
						likes: 3, 
						data: {
							text: 'is now interested in phones!',
							image: 'none'
						},
						comments: [
							{
								type: 'comment', 
								creator: 'rajeev', 
								date: '2022-11-15T09:17:00-04:00',
								likes: 2, 
								data: {
									text: 'lmao',
									image: 'none'
								},
								comments:[]
							}
						]
					},
				]
			});
		}
	});
}

var viewPosts = function(req, res) {}

var routes = { 
   
	create_post: createPost, //wall
	make_post: makePost, //wall
	view_posts: viewPosts, //wall
	get_home: getHome, //wall,
	make_comment: makeComment//wall
};
  
module.exports = routes;

