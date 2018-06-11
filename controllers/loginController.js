const bcrypt = require('bcryptjs');
const regex = require('regex');
let User = require('../models/user'); // Bring in Article Model

module.exports = {
	register: function(req, res, next) {
		// check if user and email is unique
		if(checkUnique(req, res, next)) {
			console.log('username and/or email is not unique');
			req.flash('danger', 'username and/or email needs to be unique');
			res.redirect('/users/register');
			return next();
		}

		//begin registering new user
		const fname = req.body.fname;
		const lname = req.body.lname;
		const email = req.body.email;
		const username = req.body.username;
		const password = req.body.password;

		// req.checkBody('fname', 'First name is required').notEmpty();
		// req.checkBody('lname', 'Last name is required').notEmpty();
		// req.checkBody('email', 'Email name is required').notEmpty();
		// req.checkBody('email', 'Email is not valid').isEmail();
		// req.checkBody('username', 'Username is required').notEmpty();
		// req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		let errors = req.validationErrors();

		if(errors) {
			res.render('register', {
				errors: errors
			});
		}
		else {
			let newUser = new User({
				fname: fname,
				lname: lname,
				email: email,
				username: username,
				password: password
			});

			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(newUser.password, salt, (error, hash) => {
					if(error) {
						console.log(error);
					}
					newUser.password = hash;
					newUser.save((err) => {
						if(err) {
							console.log(err);
							return;
						}
						else {
							req.flash('success', 'You are now registered and can log in');
							res.redirect('/users/login');
							return next();
						}
					})
				});
			})
		}
	}
}

/**
 * checks that new user has a unique email and/or username
 * @return true if it is not unique
 * @param req
 * @param res
 * @param next
 */
function checkUnique(req, res, next) {
	User.find({$or:[{username: req.body.username}, {email: req.body.email}]}, (err, user) => {
		if(err) {
			console.log(err);
			return false;
		}

		return true;
	});
}