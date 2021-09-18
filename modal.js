var modal = document.getElementById("myModal");
var btn = document.getElementById("btnFiltros");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('keypress', (event) => {
    var name = event.key;
    var code = event.code;
    if (name === 'Escape') {
        modal.style.display = "none";
    }
}, false);