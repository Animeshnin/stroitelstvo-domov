let cart = {}

// LocalStorage     позволяет  сохранять данные на клиентской стороне,

if(localStorage.getItem('cart')){
    cart = JSON.parse(localStorage.getItem('cart'))
    ajaxGetGoodsInfo();
}

superButton = document.querySelectorAll('.add-to-cart').forEach(function(element){
     element.addEventListener('click', function(){
        //  извлекается значение атрибута data-goods_id
        let goodsId = this.dataset.goods_id
        if (cart[goodsId]){
            cart[goodsId]++;
        } 
        else{
            cart[goodsId] = 1
        }
        console.log(cart);
        ajaxGetGoodsInfo()
     });
})

function ajaxGetGoodsInfo(){
    updateLocalStorageCart();
    //  выполняется запрос к серверу 
    fetch('/get-goods-info',{
        method: 'POST',
        body: JSON.stringify({key: Object.keys(cart)}),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(function(response){
        // возвращает текст ответа
        return response.text();
    })
    .then(function(body){
        console.log(body)
        showCart(JSON.parse(body))
    })
}

function showCart(data){
    let out = '<table class="table table-striped table-cart"><tbody>';
    let total = 0;
    for (let key in cart){
        out += `<tr><td><a href="/goods?id=${key}">${data[key]['name']}<a/></tr>`
        out += `<td>${data[key]['cost']}`
        out +=`</td>`
    }
    out +='</tbody></table>';
    document.querySelector('#cart-nav').innerHTML = out
}

function updateLocalStorageCart(){
    localStorage.setItem('cart', JSON.stringify(cart))
}
