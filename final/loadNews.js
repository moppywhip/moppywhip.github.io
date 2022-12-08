var db = require('./models/database.js');
const fs = require('fs')
var AWS = require('aws-sdk')
AWS.config.update({region:'us-east-1'});

var content = fs.readFileSync('/Users/anpans/Programming/G15/java/Adsorption/News_Category_Dataset_v2.json', 'utf8');
var contentSplit = content.split('\n')
var data = []
for (const col of contentSplit) {
	try {
		data.push(JSON.parse(col))
	} catch (err) {
		console.log(col)
	}
}

// Note: only first 1000 were loaded, worried about write capacity/passing spending limit
for (var i = 5; i < 1000; i++) {
	console.log('starting ' + i)
	var date = data[i]['date']
	date = date.replace(/-/g, '')
	var columns = [
	{
		column: 'category',
		value: data[i]['category'],
		type: 'S'
	},
	{
		column: 'headline',
		value: data[i]['headline'],
		type: 'S'
	},
	{
		column: 'authors',
		value: data[i]['authors'],
		type: 'S'
	},
	{
		column: 'link',
		value: data[i]['link'],
		type: 'S'
	},
	{
		column: 'short_description',
		value: data[i]['short_description'],
		type: 'S'
	},
	{
		column: 'publish_date',
		value: date,
		type: 'N'
	}
	];
	
	db.putInt('News', 'articleId', i.toString(), columns, function(err, data) {
		if (err) {
		  	console.log(err)
		} else if (data) {
		  	console.log('good')
		} else {
			console.log('error')
		}
	})
}