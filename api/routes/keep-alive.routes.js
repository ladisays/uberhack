module.exports = function (app, config) {
	app.route('/keep-alive').get(function (req, res) {
		res.send('I am alive');
	});
};