/*
 * GET home, about and contact pages.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Bobby Hensley dot Com', page: 'home' });
};

exports.about = function(req, res){
  res.render('about', { title: 'Who Am I?', page: 'about' });
};

exports.contact = function(req, res){
  res.render('contact', { title: 'Contact Me', page: 'contact' });
};