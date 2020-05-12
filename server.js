const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser') 
const speakeasy = require('speakeasy')
const QRCode = require('qrcode');
const cors = require('cors');


const port = process.env.PORT || 3000


// app.use(cors);

// // BodyParser setup
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(express.json()) 
// When we run the server our public file will also be ran
const publicDirectoryPath = path.join(__dirname, './public')
app.use(express.static(publicDirectoryPath))


// Two factor Auth

// // Generate a secret key.
// var secret = speakeasy.generateSecret({length: 20});
// // Access using secret.ascii, secret.hex, or secret.base32.


// // Example for storing the secret key somewhere (varies by implementation):
// let two_factor_temp_secret = secret.base32;

// // Get the data URL of the authenticator URL
// QRCode.toDataURL(secret.otpauth_url, function(err, data_url) {
//     console.log(data_url);
   
//     // Display this data URL to the user in an <img> tag
//     // Example:
//     write('<img src="' + data_url + '">');
//   });



//Generate a secret key First.
var secret = speakeasy.generateSecret({ length: 20 });

console.log('secret.base32 : ' + secret.base32);



app.get('/add_url', function (req, res) {

    //using speakeasy generate one time token.
    var token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
    });

    console.log('token : ' + token);

    
    QRCode.toDataURL(secret.otpauth_url, function (err, data_url) {
        //console.log(data_url);

        // Display this data URL to the user in an <img> tag 
        // Example: 
        res.end('<!DOCTYPE html>\
        <html lang="en">\
        <head>\
            <meta charset="UTF-8">\
            <meta name="viewport" content="width=device-width, initial-scale=1.0">\
            <meta http-equiv="X-UA-Compatible" content="ie=edge">\
            <title>2FA example</title>\
        </head>\
        <body>\
            <img src="'+data_url+'" alt="Mountain View">\
            <div class="col-lg-2 col-sm-3 col-xs-6"> OTP : '+token+' </div>\
        </body>\
        </html>');
    });
});



//Verify OTP
app.post('/verify/', function(req, res) {
	var token = req.body.token; // for testing I am just sending token to front-end. send this token with /verify POST request
    // Verify a given token 
    console.log("Got following : " + token)
	var tokenValidates = speakeasy.totp.verify({
		secret: secret.base32,
		encoding: 'base32',
		token: token,  //token is what created in get('/') request
		window: 0
	});
	res.send(tokenValidates);
	// Returns true if the token matches 
});


app.get('/api', (req, res) => res.send('Hello World!'))


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))