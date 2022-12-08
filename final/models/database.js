var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var db = new AWS.DynamoDB();

var general_DB_lookup = function(searchTable, searchKey, searchTerm, queryTerms, callback) {
	console.log('Looking up: ' + searchTerm); 

  var params = {
      KeyConditions: {
	//this assumes all keys we are going to use are strings
        [searchKey]: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ { S: searchTerm } ]
        }
      },
      TableName: searchTable,
      AttributesToGet: queryTerms
  };

  db.query(params, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      callback(err, data.Items);
    }
  });
}

/*
columns of the form [{
	column: string,
	type: char,
	value: any
}] where column is the column name, type is the type of the input (needed for list shenanigans), and value is the desired value
*/
var general_DB_put = function(tableName, key, keyword, columns, callback) {
  var params = {
      Item: {
		//this assumes all keys we are going to use are strings
        [key]: {
          S: keyword
        }
      },
      TableName: tableName,
      ReturnValues: 'NONE'
  };
  
  columns.forEach(function(x){
	params.Item[x.column] = {[x.type]:x.value};
  });
  
  db.putItem(params, function(err, data){
    if (err)
      callback(err)
    else
      callback(null, 'Success')
  });
};

var general_DB_putInt = function(tableName, key, keyword, columns, callback) {
  var params = {
      Item: {
		//this assumes all keys we are going to use are integers
        [key]: {
          N: keyword
        }
      },
      TableName: tableName,
      ReturnValues: 'NONE'
  };
  
  columns.forEach(function(x){
	params.Item[x.column] = {[x.type]:x.value};
  });
  
  db.putItem(params, function(err, data){
    if (err)
      callback(err)
    else
      callback(null, 'Success')
  });
};

var general_DB_scan = function(tableName, columns, callback) {
	var params = {
		AttributesToGet: columns,
		TableName: tableName
	};
	db.scan(params, function(err, data){
		if(err)
			callback(err, null)
		else
			callback(null, data)
	})
};

var general_DB_delete = function(tableName, key, keyword, callback) {
	var params = {
      Key: {
	//this assumes all keys we are going to use are strings
	      [key]:{
			S:keyword
		}
	  },

      TableName: tableName
  };
	db.deleteItem(params, function(err, data){
		if(err)
			callback(err, null)
		else
			callback(null, data)
	});
};



// TODO Your own functions for accessing the DynamoDB tables should go here

/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

// TODO Don't forget to add any new functions to this class, so app.js can call them. (The name before the colon is the name you'd use for the function in app.js; the name after the colon is the name the method has here, in this file.)

var database = { 
  lookup: general_DB_lookup,
  put: general_DB_put,
  scan: general_DB_scan,
  delete: general_DB_delete,
  putInt: general_DB_putInt
}

module.exports = database;