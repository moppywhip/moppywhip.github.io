toggleTheme = function(){
    document.body.classList.toggle("dark-mode");
}

let button = document.getElementById("toggleButton");

button.onclick = toggleTheme;