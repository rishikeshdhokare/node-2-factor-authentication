var authy = require('authy')('your-auth-key');

var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'Hey there!' });   
});

router.get('/register', function(req, res) {
	console.log('New register request...');

	var isSuccessful = false;

	var email = req.param('email');
	var phone = req.param('phone');
	var countryCode = req.param('countryCode');
	
	authy.register_user(email, phone, countryCode, function (regErr, regRes) {
    	console.log('In Registration...');
    	if (regErr) {
       		console.log(regErr);
       		res.send('There was some error registering the user.');
    	} else if (regRes) {
    		console.log(regRes);
    		authy.request_sms(regRes.user.id, function (smsErr, smsRes) {
    			console.log('Requesting SMS...');
    			if (smsErr) {
    				console.log(smsErr);
    				res.send('There was some error sending OTP to cell phone.');
    			} else if (smsRes) {
    				console.log(smsRes);
    				res.send('OTP Sent to the cell phone.');
    			}
			});
    	}
   	});
});

router.get('/verify', function(req, res) {
	console.log('New verify request...');

	var id = req.param('id');
	var token = req.param('token');

	authy.verify(id, token, function (verifyErr, verifyRes) {
		console.log('In Verification...');
		if (verifyErr) {
			console.log(verifyErr);
			res.send('OTP verification failed.');
		} else if (verifyRes) {
			console.log(verifyRes);
			res.send('OTP Verified.');	
		}
	});
});

app.use('/api', router);

app.listen(port);

console.log('Server started on port - ' + port);
