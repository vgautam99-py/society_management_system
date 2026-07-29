// const http = require('http') ;


// const server= http.createServer((req,res)=>{
//     res.end('hello')
// })
// //inbuilt events 
// server.on('request',(req )=>{
// console.log(req.url , req.method)
// })

// //inbuilt events
// server.on('connection',()=>{
//     console.log('tcp connection established')
// })
// server.listen(5000,()=>{
//     console.log('server is up')
// })

// //when you do something events automatically emit , if you have listerner attached to that event then you do some work using that listerner



// // createuser 

// // event.emit('newUser',newUser) 

// // clientInformatio
// // event.on('newUser' , (data)=>{

// // })

const EventEmitter = require('events');

const event  = new EventEmitter();

//emit main khud event ko trigger => //on listern karunga ;

event.on('typing', (user)=>{
    console.log(`${user} is typing...`)
})

event.emit('typing' ,'ritesh') ; 

//NOTE rest api  client req => connection ==> res connection closed ;

//NOTE websocket   => 
//NOTE webhook

//rest api 
// polling razorpay success https://backend.com/sucessPayment

//stateless / veriosning //
// get /api/v1/products ; //fetch
// post /api/v1/products  //entry
// delete /api/v1/products/:id/reviews
// patch /api/v1/products/:id 
// get /api/v1/products/:id 
// post data delte , update get register


//commong patterns => vistor => room userId