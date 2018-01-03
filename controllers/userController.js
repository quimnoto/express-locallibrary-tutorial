const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var User = require('../models/user');

var async = require('async');
var debug = require('debug')('user');


// Display list of all Authors
exports.user_list = function(req, res, next) {

  User.find()
    .sort([['username', 'ascending']])
    .exec(function (err, list_users) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('user_list', { title: 'Users List', author_list: list_users });
    });

};

// Display detail page for a specific Author
exports.user_detail = function(req, res, next) {
  async.parallel({
      user: function(callback) {
          User.findById(req.params.id)
            .exec(callback)
      }
  }, function(err, results) {
      if (err) { return next(err); } // Error in API usage.
      if (results.author==null) { // No results.
          var err = new Error('User not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      res.render('user_detail', { title: 'User Detail', user: results.user} );
  });

};

// Display Author create form on GET
exports.user_create_get = function(req, res) {
  res.render('user_form', { title: 'Create User'});
};

// Handle Author create on POST
exports.user_create_post = [

    // Validate fields
    body('email').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('username').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('password', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('passwordConf', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validationResult(req);

        // Create an Author object with escaped and trimmed data.
       var user = new User{
          email: req.body.email,
          username: req.body.username,
          password: req.body.password,
          passwordConf: req.body.passwordConf,
        }

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('user_form', { title: 'Create User', user: user, errors: errors.array()});
            return;
        }
        else {
          // Data from form is valid.
          user.save(function (err) {
              if (err) {
                debug('create error:' + err);
                return next(err);
              }
                 // Successful - redirect to new author record.
                 res.redirect(user.url);
              });
        }
    }
];

// Display Author delete form on GET
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
