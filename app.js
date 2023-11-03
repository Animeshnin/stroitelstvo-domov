// подключают необходимые модули EXPRESS

let express = require('express');
let app = express();

let mysql = require('mysql');
// подключаем статику не статику. Public(имя папки где хранится статика) это общепринятое название как index
app.use(express.static('public'))
app.set('view engine', 'pug');
// подключаем движ вывода

app.use(express.json())

// подключаем sql модулб

// настраиваем модуль

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'market',
  password: 'root'
}); 




app.listen(3000, function(){
  console.log('node express work on 3000');

}); 


app.get('/',function(req,res){
  res.render('housesite')
})

app.get('/catalog', function(req,res){
  con.query("SELECT * FROM category",
function(error,result){ 
  if (error) throw error;
  console.log(result)
  let category = {};
  // данные из результата запроса result добавляются в объект category в формате, где ключами являются значения столбца id из базы данных и значениями являются строки из соответствующих записей.
  for (let i = 0; i < result.length; i++){
    category[result[i]['id']] = result[i]
  }
  let description = {};
 
  console.log(category)
  // передается объект содержащий данные из базы данных (перекодированные в JSON), который будет доступен в представлении в переменной category.
  res.render('catalog',{
    category:  JSON.parse(JSON.stringify(category))
  })
}
) 
})

app.get('/cat', function (req, res) {
  console.log(req.query.id);
  let catId = req.query.id;

  let cat = new Promise(function (resolve, reject) {
    // Создается объект cat 
    con.query(
      'SELECT * FROM category WHERE id=' + req.query.id,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });
  let goods = new Promise(function (resolve, reject) {
    con.query(
      'SELECT * FROM goods WHERE category=' + req.query.id,
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      });
  });

  Promise.all([cat, goods]).then(function (value) {
    console.log(value[0]);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1])),
      
    });
  })})

app.get('/goods', function(req,res){
  console.log(req.query.id)
  con.query('SELECT * FROM goods WHERE id='+req.query.id, function(err, result, fields){
    if (err) throw err;
    res.render('goods', {goods: JSON.parse(JSON.stringify(result))})
  });
})
// // У нас есть возможность работать с приложением app, это соответвстенно свойство get. Если к приложению через браузер обращаемся с помощью get
// // мы отлавливаем запрос 

app.get('/order', function(req,res){
    res.render('order')
})


// обработчика для HTTP POST-запросов на маршрут
app.post('/get-goods-info', function(req, res){
  console.log(req.body.key)
  con.query('SELECT id, name, cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function(error, result, fields) {
    if (error) throw error;
    console.log(result)
    let goods = {};
    for (let i = 0; i < result.length; i++){
      goods[result[i]['id']] = result[i]
    }
    res.json(goods)
  })
});

app.post('/finish-order', function(req, res){
  console.log(req.body)
  if (req.body.key.length !=0){
    let key = Object.keys(req.body.key)
    con.query('SELECT id, name, cost FROM goods WHERE id IN ('+key.join(',')+')', function(error, result, fields){
      if (error) throw error;
      console.log(result)
      saveOrder(req.body, result);
      res.send('1')      
    })}
  else{
  res.send('0')
  }
})

function saveOrder(data, result){
  // data - информация о пользовател
  // result Сведение о товаре
  let sql;
  sql = "INSERT INTO user_info (user_name, user_phone, user_email, address) VALUES ('"+data.username+"','"+data.phone+"','"+data.email+"','"+data.address+"')";
  con.query(sql, function(error, resultQuery){
    if (error) throw error;
    console.log('1 user info saved')
    console.log(resultQuery)
    let userId = resultQuery.insertId;
    date = new Date() / 1000;
    let currentDate = new Date();

    let day = currentDate.getDate().toString().padStart(2, '0');
    let month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Месяцы в JavaScript начинаются с 0, поэтому добавляем 1.
    let year = currentDate.getFullYear();
    let hours = currentDate.getHours().toString().padStart(2, '0');
    let minutes = currentDate.getMinutes().toString().padStart(2, '0');
    let seconds = currentDate.getSeconds().toString().padStart(2, '0');

    let formattedDateTime = `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;

console.log(formattedDateTime);
    for (let i = 0; i < result.length; i++){
      sql = "INSERT INTO shop_oreder(date, user_id, goods_id, goods_cost, goods_amount) VALUES (" + date + "," + userId + "," + result[i]['id'] + "," + result[i]['cost'] + "," +data.key[result[i]['id']] + data.key[result[i]['id']] + ")";
      con.query(sql, function (error, resultQuery){
        if (error) throw error;
        console.log("1 goods saved")
      })
    }
  })

}

app.get('/login', function(req,res){
  res.render('login')
})

app.get('/admin', function(req,res){
  res.render('admin')
})

app.get('/admin-order', function(req,res){
  con.query(`SELECT 
  shop_oreder.id as id, 
  shop_oreder.user_id as user_id, 
    shop_oreder.goods_id as goods_id, 
    shop_oreder.goods_cost as goods_cost, 
    from_unixtime(date, "%Y-%m-%d %H:%m") as human_date, 
    user_info.user_name as user, 
    user_info.user_phone as phone, 
    user_info.address as address 
FROM  
  shop_oreder 
  LEFT JOIN user_info ON shop_oreder.user_id = user_info.id ORDER BY id DESC`, function(err, result, fields){
    if (err) throw err;
    res.render('admin-order', {oreder: JSON.parse(JSON.stringify(result))})
  });
})



app.post('/login', function(req,res){
  console.log(req.body)
  console.log(req.body.login)
  console.log(req.body.password)
  con.query(
    'SELECT * FROM users WHERE login="' + req.body.login + '"and password="'+req.body.password+'"',
    function (error, result) {
      if (error) reject(error);
      if (result.length == 0){
        console.log('error user not found')
     
      }
      else{
        result = (JSON.parse(JSON.stringify(result)))
        if (error) reject(error);
        res.redirect('/admin')
      }
      //console.log(result[0]['id'])
    });
});

