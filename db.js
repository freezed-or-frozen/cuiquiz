/**
 * CuiQuiz project :: database
 * 
 * Module to access CuiQuiz data from a SQLite database
 * Mainly used by index.js
 */

// Require for SQLite3 database
var sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Open SQLite database
const db_name = path.join(__dirname, "data", "cuiquiz.sqlite");
//console.error("  path : " + db_name);
var db = new sqlite3.Database("./data/cuiquiz.sqlite", (error) => {
  if (error) {    
    console.error(" => ERROR : " + error.message);    
  }
  console.log(" => Connected to the cuiquiz database.");
});


function get_all_progressions(callback) {
  db.all(`
    SELECT Progression.progression_id, Progression.progression_name, Progression.progression_description, 'Group'.group_name
    FROM Progression
    INNER JOIN 'Group' ON Progression.group_id_fk = 'Group'.group_id;`,
    [], (error, rows) => {
    callback(error, rows);
  });	
}

function get_one_progression(progression_id, callback) {
  db.get(`
    SELECT * 
    FROM Progression
    WHERE Progression.progression_id = ?;`,
    [progression_id], (error, rows) => {
    callback(error, rows);
  });	
}

function get_all_quizzes(callback) {
  db.all(`
    SELECT * 
    FROM Quiz;`,
    [], (error, rows) => {
      callback(error, rows);
  });	
}

function get_one_quiz(quiz_id, callback) {
  db.get(`
    SELECT Quiz.quiz_id, Quiz.quiz_title, COUNT(question_id) AS questions_number
    FROM Quiz
    INNER JOIN Question ON Quiz.quiz_id = Question.quiz_id_fk 
    WHERE Quiz.quiz_id = ?
    AND Question.quiz_id_fk = ?;`,
    [quiz_id, quiz_id], (error, rows) => {
    callback(error, rows);
  });	
}

function get_all_questions(quiz_id, callback) {
  db.all(`
    SELECT * 
    FROM Question
    WHERE quiz_id_fk = ?;`,
    [quiz_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_one_question(question_id, callback) {
  db.get(`
    SELECT * 
    FROM Question
    WHERE question_id = ?;`,
    [question_id], (error, rows) => {
    callback(error, rows);
  });	
}

function get_all_answers(question_id, callback) {
  db.all(`
    SELECT * 
    FROM Answer
    WHERE question_id_fk = ?;`,
    [question_id], (error, rows) => {
      callback(error, rows);
  });	
}

function add_player_response(session_id, player_id, question_id, answer_id, time_to_answer, callback) {
  db.run(`
    INSERT INTO Participation (session_id_fk, player_id_fk, question_id_fk, answer_id_fk, participation_date, participation_time_to_answer)
    VALUES (?, ?, ?, ?, datetime('now'), ?);`,
    [session_id, player_id, question_id, answer_id, time_to_answer], (error, rows) => {
      callback(error, rows);
  });	
}

function get_all_players(callback) {
  db.all(`
    SELECT * 
    FROM Player;`,
    [], (error, rows) => {
      callback(error, rows);
  });	
}

function get_players_from_group(group_id, callback) {
  db.all(`
    SELECT * 
    FROM Player
    WHERE Player.group_id_fk = ?;`,
    [group_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_player_id(player_name, callback) {
  db.get(`
    SELECT * 
    FROM Player
    WHERE player_name LIKE ?;`,
    [player_name], (error, rows) => {
      callback(error, rows);
  });	
}

function get_stats_for_question_id(question_id, callback) {
  db.all(`
    SELECT * 
    FROM Player
    WHERE player_name LIKE ?;`,
    [question_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_players_who_gives_answer(session_id, question_id, answer_position, callback) {
  db.all(`
    SELECT Player.player_name 
    FROM Player
    INNER JOIN Participation ON Player.player_id = Participation.player_id_fk
    INNER JOIN Answer ON Participation.answer_id_fk = Answer.answer_id
    INNER JOIN Session ON Session.session_id = Participation.session_id_fk
    WHERE Participation.question_id_fk = ?
    AND Answer.answer_position = ?
    AND Participation.session_id_fk = ?;`,
    [question_id, answer_position, session_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_players_answers(session_id, question_id, callback) {
  db.all(`
    SELECT Player.player_name, Answer.answer_position, Answer.answer_is_correct, Participation.participation_time_to_answer
    FROM Participation
    INNER JOIN Player ON Participation.player_id_fk = Player.player_id
    INNER JOIN Answer ON Participation.answer_id_fk = Answer.answer_id 
    WHERE Participation.session_id_fk = ?
    AND Participation.question_id_fk = ?;`,
    [session_id, question_id], (error, rows) => {
      callback(error, rows);
  });	
}
/*
// Second version
SELECT Player.player_name, Answer.answer_position, Answer.answer_is_correct, Participation.participation_time_to_answer
FROM Participation
INNER JOIN Player ON Participation.player_id_fk = Player.player_id
INNER JOIN Answer ON Participation.answer_id_fk = Answer.answer_id 
WHERE Participation.session_id_fk = 100
AND Participation.question_id_fk = 1;
*/

function get_leaderboard_for_question(session_id, question_id, callback) {
  db.all(`
    SELECT 	Player.player_name,
            SUM(
                CASE
                    WHEN Participation.answer_id_fk = Answer.answer_id AND Answer.answer_is_correct = 1
                    THEN ((1000*(Question.question_time - Participation.participation_time_to_answer))/Question.question_time)
                    ELSE 0
                END
            ) AS player_score
    FROM Player
    INNER JOIN Participation ON Player.player_id = Participation.player_id_fk
    INNER JOIN Answer ON Participation.answer_id_fk = Answer.answer_id
    INNER JOIN Question ON Participation.question_id_fk = question_id
    WHERE Participation.session_id_fk = ?
    AND Participation.question_id_fk = ?
    GROUP BY Player.player_name
    ORDER BY player_score DESC;`,
    [session_id, question_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_leaderboard_for_session(session_id, callback) {
  db.all(`
    SELECT 	Player.player_name,
            SUM(
                CASE
                    WHEN Participation.answer_id_fk = Answer.answer_id AND Answer.answer_is_correct = 1
                    THEN ((1000*(Question.question_time - Participation.participation_time_to_answer))/Question.question_time)
                    ELSE 0
                END
            ) AS player_score
    FROM Player
    INNER JOIN Participation ON Player.player_id = Participation.player_id_fk
    INNER JOIN Answer ON Participation.answer_id_fk = Answer.answer_id
    INNER JOIN Question ON Participation.question_id_fk = question_id
    WHERE Participation.session_id_fk = ?
    GROUP BY Player.player_name
    ORDER BY player_score DESC;`,
    [session_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_leaderboard_for_progression(progression_id, callback) {
  db.all(`
    SELECT 	Player.player_name,
            SUM(
              CASE
                WHEN Participation.answer_id_fk = Answer.answer_id AND Answer.answer_is_correct = 1
                THEN ((1000*(Question.question_time - Participation.participation_time_to_answer))/Question.question_time)
                ELSE 0
              END
            ) AS player_score
    FROM Player
    INNER JOIN Participation ON Player.player_id = Participation.player_id_fk
    INNER JOIN Answer ON Participation.answer_id_fk = Answer.answer_id
    INNER JOIN Question ON Participation.question_id_fk = question_id
    INNER JOIN Session ON Session.session_id = Participation.session_id_fk
    INNER JOIN Progression On Progression.progression_id = Session.progression_id_fk
    WHERE Progression.progression_id = ?
    GROUP BY Player.player_name
    ORDER BY player_score DESC;`,
    [progression_id], (error, rows) => {
      callback(error, rows);
  });	
}

function add_new_session(quiz_id, progression_id, callback) {
  db.run(`
    INSERT INTO Session (session_date, quiz_id_fk, progression_id_fk)
    VALUES (datetime('now'), ?, ?);`,
    [quiz_id, progression_id], function(error, row) {
      console.log("this.lastID => " + this.lastID);
      callback(error, this.lastID);
  });	
}

function get_last_session(callback) {
  db.get(`
    SELECT * 
    FROM Session
    ORDER BY session_id DESC
    LIMIT 1;`,
    [], (error, rows) => {
      callback(error, rows);
  });	
}

function get_all_sessions(callback) {
  db.all(`
    SELECT * 
    FROM Session
    ORDER BY session_date DESC;`,
    [], (error, rows) => {
      callback(error, rows);
  });	
}

function get_good_answer_for_question(question_id, callback) {
  db.get(`
    SELECT Answer.answer_position, Answer.answer_text
    FROM Answer 
    INNER JOIN Question ON Answer.question_id_fk = Question.question_id
    WHERE Answer.answer_is_correct = 1
    AND Answer.question_id_fk = ?;`,
    [question_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_answer_id_from_position(question_id, answer_position, callback) {
  db.get(`
    SELECT Answer.answer_id
    FROM Answer
    INNER JOIN Question ON Answer.question_id_fk = Question.question_id
    WHERE Question.question_id = ?
    AND Answer.answer_position = ?;`,
    [question_id, answer_position], (error, rows) => {
      callback(error, rows);
  });	
}

function get_answer_position_from_id(question_id, answer_id, callback) {
  db.get(`
    SELECT Answer.answer_position
    FROM Answer
    INNER JOIN Question ON Answer.question_id_fk = Question.question_id
    WHERE Answer.question_id_fk = ?
    AND Answer.answer_id = ?;`,
    [question_id, answer_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_first_question_id_of_quiz(quiz_id, callback) {
  db.get(`
    SELECT question_id
    FROM Question
    WHERE quiz_id_fk = ?
    ORDER BY question_id ASC
    LIMIT 1;`,
    [quiz_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_last_question_id_of_quiz(quiz_id, callback) {
  db.get(`
    SELECT question_id
    FROM Question
    WHERE quiz_id_fk = ?
    ORDER BY question_id DESC
    LIMIT 1;`,
    [quiz_id], (error, rows) => {
      callback(error, rows);
  });	
}

function get_question_id_from_position(quiz_id, question_position, callback) {
  db.get(`
    SELECT *
    FROM Question
    WHERE quiz_id_fk = ?
    AND question_position = ?;`,
    [quiz_id, question_position], (error, rows) => {
      callback(error, rows);
  });	
}

function add_new_quiz_from_json(json_quiz, callback) {
  
}

function add_new_quiz(quiz_title, quiz_description, callback) {
  db.run(`
    INSERT INTO Quiz (quiz_title, quiz_description)
    VALUES (?, ?);`,
    [quiz_title, quiz_description], function(error, row) {      
      callback(error, this.lastID);
  });	
}

function add_new_question(question_position, question_text, question_time, quiz_id, callback) {
  db.run(`
    INSERT INTO Question (question_position, question_text, question_time, quiz_id_fk)
    VALUES (?, ?, ?, ?);`,
    [question_position, question_text, question_time, quiz_id], function(error, row) {      
      callback(error, this.lastID);
  });	
}

function add_new_answer(answer_text, answer_is_correct, answer_position, question_id, callback) {
  db.run(`
    INSERT INTO Answer (answer_text, answer_is_correct, answer_position, question_id_fk)
    VALUES (?, ?, ?, ?);`,
    [answer_text, answer_is_correct, answer_position, question_id], function(error, row) {      
      callback(error, this.lastID);
  });	
}

function delete_quiz(quiz_id, callback) {
  db.run(`
    DELETE FROM Quiz
    WHERE Quiz.quiz_id = ?;`,
    [quiz_id], function(error, row) {      
      callback(error, this.lastID);
  });	
}

function delete_session(session_id, callback) {
  db.run(`
    DELETE FROM Participation
    WHERE Participation.session_id_fk = ?;`,
    [session_id], function(error, row) {
      db.run(`
        DELETE FROM Session
        WHERE Session.session_id = ?;`,
        [session_id], function(error, row) {      
          callback(error, this.lastID);
      });      
  });	
}

function delete_all_sessions_for_progression(progression_id, callback) {
  db.run(`
    DELETE FROM Participation
    WHERE Participation.session_id_fk IN (
      SELECT Session.session_id
      FROM Session
      WHERE progression_id_fk = ?);`,
    [progression_id], function(error, row) {
      db.run(`
        DELETE FROM Session
        WHERE Session.session_id IN (
          SELECT Session.session_id
          FROM Session
          WHERE progression_id_fk = ?);`,
        [progression_id], function(error, row) {      
          callback(error, this.lastID);
      });      
  });	
}

/*
SELECT	CASE 
			WHEN 0 = 0
			THEN 	SELECT question_id 
					FROM Question 
					WHERE quiz_id_fk = 1
					AND question_position = 0
			WHEN EXISTS(	SELECT
		END AS next_question_id
FROM Question
WHERE quiz_id_fk = 1;
*/
/*
// Close database
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log(" => Close the database connection.");
});
*/

// Module's functions exported
module.exports = {
  get_all_progressions,
  get_one_progression,
  get_all_quizzes,
  get_one_quiz,
  get_all_questions,
  get_one_question,
  get_all_answers,
  add_player_response,
  get_all_players,
  get_players_from_group,
  get_player_id,
  get_stats_for_question_id,
  get_players_who_gives_answer,
  get_players_answers,
  get_leaderboard_for_question,
  get_leaderboard_for_session,
  get_leaderboard_for_progression,
  add_new_session,
  get_last_session,
  get_good_answer_for_question,
  get_answer_id_from_position,
  get_answer_position_from_id,
  get_first_question_id_of_quiz,
  get_last_question_id_of_quiz,
  get_question_id_from_position,

  add_new_quiz_from_json,
  add_new_quiz,
  add_new_question,
  add_new_answer,
  delete_quiz,
  delete_session,
  get_all_sessions,
  delete_all_sessions_for_progression
}