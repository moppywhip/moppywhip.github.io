// s1 outfit
let s1 = document.getElementById("s1")/* get #s1 outfit */

/* the process: */
s1.onclick = function() {
	document.getElementById("body").style.display = "none";
	//1. hide #body (set display to none)
	// 2. call the function you created to hide all the outfits 
	//(remember: get the list of .outfit elements and use a for loop to hide each outfit)

	var Elements = document.getElementsByClassName('outfit');

	
	for (var i = 0; i < Elements.length; i++) {
		
		var id = Elements[i].id;
		
		document.getElementById(id).style.display = "none";
	}

	/* 3. show #o1 outfit (set display to block)*/

	document.getElementById("o1").style.display = "block";
};

// s2 outfit
/* get #s2 outfit */
/* repeat process */

let s2 = document.getElementById("s2")


s2.onclick = function() {
	document.getElementById("body").style.display = "none";
	
	var Elements = document.getElementsByClassName('outfit');

	
	for (var i = 0; i < Elements.length; i++) {
		
		var id = Elements[i].id;
		
		document.getElementById(id).style.display = "none";
	}


	document.getElementById("o2").style.display = "block";
};

// s3 outfit
/* get #s3 outfit */
/* repeat process */


let s3 = document.getElementById("s3")


s3.onclick = function() {
	document.getElementById("body").style.display = "none";
	
	var Elements = document.getElementsByClassName('outfit');

	
	for (var i = 0; i < Elements.length; i++) {
		
		var id = Elements[i].id;
		
		document.getElementById(id).style.display = "none";
	}


	document.getElementById("o3").style.display = "block";
};

// s4 outfit
/* get #s4 outfit */
/* repeat process */

let s4 = document.getElementById("s4")


s4.onclick = function() {
	document.getElementById("body").style.display = "none";
	
	var Elements = document.getElementsByClassName('outfit');

	
	for (var i = 0; i < Elements.length; i++) {
		
		var id = Elements[i].id;
		
		document.getElementById(id).style.display = "none";
	}


	document.getElementById("o4").style.display = "block";
};

// s5 outfit
/* get #s5 outfit */
/* repeat process */

let s5 = document.getElementById("s5")


s5.onclick = function() {
	document.getElementById("body").style.display = "none";
	
	var Elements = document.getElementsByClassName('outfit');

	
	for (var i = 0; i < Elements.length; i++) {
		
		var id = Elements[i].id;
		
		document.getElementById(id).style.display = "none";
	}


	document.getElementById("o5").style.display = "block";
};

let strip =document.getElementById("strip-button")
strip.onclick = function() {
	/* call the function you created to hide all the outfits */
	/* show #body */

	var Elements = document.getElementsByClassName('outfit');

	
	for (var i = 0; i < Elements.length; i++) {
		
		var id = Elements[i].id;
		
		document.getElementById(id).style.display = "none";
	}

	document.getElementById("body").style.display = "block";


};