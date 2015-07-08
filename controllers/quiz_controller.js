var models = require('../models/models.js');
var app = require('../app.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function (req, res, next, quizId) {
	console.log('quizId: ' + quizId);
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]	
	}).then(function (quiz) {
		if (quiz) {
			console.log('AUTOLOAD        ' + quiz.Comments.length);
			req.quiz = quiz;
			next();
		} else { next( new Error('No existe quizId=' + quizId)); }
	}
	).catch(function(error) {next(error);});
};

// GET /quizes
exports.index = function (req, res) {
	var pattern_all = '%';
	
	var search = '';
	if (req.query.search) {
		search = '%' + req.query.search.replace(' ','%') + '%';
	} else {
		search = pattern_all;
	}
	
	models.Quiz.findAll({where: ["pregunta like ?", search]}).then(function(quizes) {
		var errors = [];
		console.log('LLEGAMOS AKI');
		if (app.session_expires === true) {
			console.log('quizes -> sesion expirada');
			console.log('session_expires: ' + app.session_expires);
			errors = [{"message": "Sesión caducada"}];
			app.session_expires = false;
		} else {
			console.log('quizes -> sesion no expirada');
			console.log('session_expires: ' + app.session_expires);
		}
		res.render('quizes/index', {quizes: quizes, errors: errors});
	}).catch(function(error) { next(error); });

};

// GET	/quizes/:id
exports.show = function (req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:id/answer
exports.answer = function (req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] }); 
};

// GET /quizes/new
exports.new = function (req, res) {
	//crea objeto quiz
	var quiz = models.Quiz.build(
		{ pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema" }
	);
	
	res.render('quizes/new', { quiz: quiz, temas: models.Categories, errors: [] });
};

// GET /quizes/create
exports.create = function (req, res) {
	var quiz = models.Quiz.build ( req.body.quiz );
	
	quiz.validate().then(function(err) {
		if (err) {
			res.render('quizes/new', {quiz: quiz, temas: models.Categories, errors: err.errors});	
		} else {
			// guarda en DB los campos pregunta y respuesta de quiz
			quiz.save({fields: ["pregunta", "respuesta", "tema"]})
			.then(function() {res.redirect('/quizes')});
				// res.redirect: redicrección HTTP a lista de preguntas
		}
	});
};

// GET /quizes/:id/edit
exports.edit = function (req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz

	res.render('quizes/edit', { quiz: quiz, temas: models.Categories, errors: [] });
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;
	console.log('UPDATE: ' + req.quiz.tema);
	
	req.quiz.validate().then(function(err) {
		if (err) {
			res.render('quizes/edit', {quiz: req.quiz, temas: models.Categories ,errors: err.errors});
		} else {
			// save: guarda campos pregunta y respuesta en DB
			req.quiz.save({fields: ["pregunta", "respuesta", "tema"]})
			.then(function(){ res.redirect('/quizes');}); 
				// Redirección HTTP a lista de preguntas (URL relativo)
		}
	});
};

// DELETE /quizes/:id
exports.destroy = function (req, res) {
	req.quiz.destroy().then(function() {
		res.redirect('/quizes');
	}).catch(function(error){next(error)});	
};

// GET /author
exports.author = function (req, res) {
	res.render('author', {autor: 'Adrián Queipo Pardo', errors: []});
};