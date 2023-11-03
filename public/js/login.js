const inputs = document.querySelectorAll('.input');

function focusFunc(){
    let parent = this.parentNode.parentNode;
    parent.classList.add('focus')
}

function blurFunc(){
    let parent = this.parentNode.parentNode;
    if (this.value == ""){
        parent.classList.remove('focus')
    }
    
}

inputs.forEach(input =>{
    input.addEventListener('focus',focusFunc)
    input.addEventListener('blur',blurFunc)
})


function sendLogin(){
    fetch('/login',{
        method: 'POST',
        body: JSON.stringify({
            'login' : document.querySelector('#login').value,
            'password': document.querySelector('#password').value,
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        } 
})
}


document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()
    sendLogin()
})