//Importing modules
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid/v4');

//Creating router
const router = express.Router();

//Database connection and models
const { mongoose } = require('./../db/mongoose.js');
const { User } = require('./../models/user.js');
const { Question } = require('./../models/question.js');

//feedques endpoint
router.get('/feedques', (req, res) => {
	//Checking if the session variable user and cookie exist
	//If they do then the user is logged in
	if(req.session.user && req.cookies.user_sid) {
		Question.find({
			status: 'active',
			'creator.email': {
				$ne: req.session.user.email
			}
		}, (err, allAnswers) => {
			let answerList;
			let returnList = new Array();
			User.findOne({
				email: req.session.user.email
			}).then(async (user) => {
				answerList = user.answers;
				returnList = await allAnswers.filter((current) => {
					let check = true;
					//Try using every() method
					answerList.forEach((cur) => {
						if(cur.questionID === current.questionID) {
							check = false;
						}
					});
					return check;
				});
				res.status(200).send(returnList);
			}).catch((err) => {
				res.status(500).send('Error');
			});
		})
	} else {
		//If not send a Forbidden message with status code 400
		res.status(400).send("Forbidden");
	}
});

//myques endpoint
router.get('/myques', (req, res) => {
	//Checking if the session variable user and cookie exist
	//If they do then the user is logged in
	if(req.session.user && req.cookies.user_sid) {
		//Finding the questions with the email of the user
		Question.find({
			'creator.email': req.session.user.email
		}, (err, arr) => {
			//Sending the array
			res.status(200).send(arr);
		});
	} else {
		//If not send a Forbidden message with status code 400
		res.status(400).send("Forbidden");
	}
});

//myans endpoint
router.get('/myans', (req, res) => {
	//Checking if the session variable user and cookie exist
	//If they do then the user is logged in
	if(req.session.user && req.cookies.user_sid) {
		/*Finding the user in the database with the email of the session variable user to get the 
		answers array*/
		/*Can use the session variable to get the array but the app will need an updated array if
		the user has just submitted a question, the session variable will have the copy from when the user 
		would have logged in*/
		User.findOne({
			email: req.session.user.email
		}).then((user) => {
			//Storing the array in a variable
			const answerObjs = user.answers;
			/*Creating an array to store objects that will include the question and the answer submitted by 
			the user*/
			let answers = new Array();
			let counter = 0;
			answerObjs.forEach((curAnswerObj) => {
				//Finding each question
				Question.findOne({
					questionID: curAnswerObj.questionID
				}).then((question) => {
					//Storing the data
					answers[counter++] = {
						question: question,
						answer: curAnswerObj.answer
					};
				}).catch((err) => {
					//If there is an error in finding the questions then an error is sent
					//This will be changed later on along with some UI improvements(message modals)
					res.status(500).send("Error in finding answers");
				});
			});

			//Sending the answers array with status 200
			res.status(200).send(answers);
		}).catch((err) => {
			//If the user is not found in the databse(unlikely) then an error is sent
			res.status(500).send('Could not find user in database');
		});
	} else {
		//If not send a forbidden message with status code 400
		res.status(400).send("Forbidden");
	}
});

//Exporting router variable
module.exports = {
	router
}