var models = require('../models/models.js');

// GET /quizes
exports.index = function (req, res) {

	var num_quizes;
	var num_comments = 0;
	var avg_comments_by_quiz;
	var num_quizes_without_comments;
	var num_quizes_with_comments = 0;	
	
	models.Quiz.findAll({include: [{ model: models.Comment }]}).then(function(quizes) {
		
		//Extraemos información de cada pregunta
		for (var i = 0; i < quizes.length; i++) {
			var quiz = quizes[i];
			if (quiz.Comments.length > 0) {
				num_quizes_with_comments++;
				num_comments += quiz.Comments.length;
			}	
		}
		
		// numero de preguntas
		num_quizes = quizes.length;
		console.log('Numero de preguntas: ' + num_quizes);
		
		// numero de comentarios totales
		console.log('Numero de comentarios totales: ' + num_comments);
		
		// numero medio de comentarios por pregunta
		avg_comments_by_quiz = num_comments/num_quizes;
		console.log('Numero medio de comentarios por pregunta: ' + avg_comments_by_quiz);
		
		// numero de preguntas sin comentarios
		num_quizes_without_comments = num_comments - num_quizes_with_comments;
		console.log('Numero de preguntas SIN comentarios: ' + num_quizes_without_comments);
		
		// numero de preguntas con comentarios
		console.log('Numero de preguntas CON comentarios: ' + num_quizes_with_comments);
		
		// Renderizamos la información estadística
		res.render('quizes/statistics', {
											num_quizes					: num_quizes, 
											num_comments				: num_comments,
											avg_comments_by_quiz		: avg_comments_by_quiz, 
											num_quizes_without_comments	: num_quizes_without_comments,
											num_quizes_with_comments	: num_quizes_with_comments,
											errors 						: []
										});
		
	}).catch(function(error) { console.log(error); });

};