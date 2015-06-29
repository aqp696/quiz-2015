var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function (req, res, next, quizId) {
	models.Quiz.find(quizId).then(function (quiz) {
		if (quiz) {
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
		res.render('quizes/index', {quizes: quizes, errors: []});
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
		{ pregunta: "Pregunta", respuesta: "Respuesta" }
	);
	
	res.render('quizes/new', { quiz: quiz, errors: [] });
};

// GET /quizes/create
exports.create = function (req, res) {
	var quiz = models.quiz.build ( req.body.quiz );
	
	quiz.validate().then(function(err) {
		if (err) {
			res.render('quizesK/new', {quiz: quiz, errors: err.errors});	
		} else {
			// guarda en DB los campos pregunta y respuesta de quiz
			quiz.save({fields: ["pregunta", "respuesta"]})
			.then(function() {res.redirect('/quizes')});
				// res.redirect: redicrección HTTP a lista de preguntas
		}
	});
};

// GET /quizes/:id/edit
exports.edit = function (req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz
	
	res.render('quizes/edit', { quiz: quiz, errors: [] });
}

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	
	req.quiz.validate().then(function(err) {
		if (err) {
			res.render('quizes/edit', {quiz: rez.quiz, errors: err.errors});
		} else {
			// save: guarda campos pregunta y respuesta en DB
			req.quiz.save.({fields: ["pregunta","respuesta"]})
			.then(function(){ res.redirect('/quizes');}); 
				// Redirección HTTP a lista de preguntas (URL relativo)
		}
	});
};

// GET /author
exports.author = function (req, res) {
	res.render('author', {autor: 'Adrián Queipo Pardo'});
};