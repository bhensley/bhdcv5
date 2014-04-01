/*
 * GET about me page.
 */

exports.index = function(req, res){
  res.render('about', { title: 'Who Am I?' });
};