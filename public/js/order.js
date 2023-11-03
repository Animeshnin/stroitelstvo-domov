document.querySelector('#sk-vektor').addEventListener('submit', function(event){
    event.preventDefault()
    let username = document.querySelector('#username').value.trim();
    let phone = document.querySelector('#phone').value.trim();
    let email = document.querySelector('#email').value.trim();
    let address = document.querySelector('#address').value.trim();

    if (username == '' || phone == '' || email == '' || address==''){
        Swal.fire({
            title: 'Ошибка',
            text: 'Введите все поля',
            type: 'info',
            confirmButtonText: 'Ok'
        })
        return false
    }

    fetch('/finish-order',{
        method: 'POST',
        body: JSON.stringify({
            'username' : username,
            'phone': phone,
            'email': email,
            'address':  address,
            'key' : JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json' 
        }
    })
    .then(function(response){
        return response.text();
    })
    .then(function(body){
        if (body == 1){
            Swal.fire({
                title: 'Успешно',
                text: 'Ожидайте звонка',
                type: 'info',
                confirmButtonText: 'Ok'
            })

        }
        else {
            Swal.fire({
                title: 'Проблема с сервером',
                text: 'Error',
                type: 'error',
                confirmButtonText: 'Ok'
            })

        }
    })
})

