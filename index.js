/**
 * CuiQuiz project :: server
 * 
 * Server that handle socket.io requests and responses
 * Made with Node.js + express + socket.io
 */

// For express library
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));  // to parse POST requests

// For socket.io library
const { Server } = require("socket.io");
const io = new Server(server);

// For credentials
const dotenv = require('dotenv').config();

// For session id
var crypto = require('crypto');

// For custom db driver and import
const db = require("./db");


// Some general constant and variables
const TCP_PORT = 3000;
const PUBLIC_PATH = "/public";
const HTML_PATH = "/views";

var CurrentSession = {
  "progression_id": 1,
  "group_id": 0,
  "session_id": 0,
  "quiz_id": 0,
  "quiz_title": "???",
  "quiz_questions_number": 0,
  "quiz_state": 0,
  "question_id": 0,
  "question_position": 1,
  "question_text": "???",
  "question_time" : 60,
  "question_answers": [],
  "clients": [],
  "players": []    
};

// To measure time to answer a question
var start_time;
var end_time;

/**
 * Generate a random session id
 */
function generate_session_id()  {
  return crypto.randomBytes(16).toString("base64");
}


//
// Routes
//
app.get("/", (request, response) => {
  response.sendFile(__dirname + HTML_PATH + "/index.html");
});

app.get("/student", (request, response) => {
  response.sendFile(__dirname + HTML_PATH + "/student.html");
});

app.get("/login", (request, response) => {
  response.sendFile(__dirname + HTML_PATH + "/login.html");
});

app.post("/auth", function(request, response) {
	// Retrieve the password
  let password = request.body.password;
  console.log(" => teacher's password : " + password);

  // Prepare data for response
  CurrentSession = {
    "progression_id": 1,
    "group_id": 0,
    "session_id": 0,
    "quiz_id": 0,
    "quiz_title": "???",
    "quiz_questions_number": 0,
    "quiz_state": 0,
    "question_id": 0,
    "question_position": 1,
    "question_text": "???",
    "question_time" : 60,
    "question_answers": [],
    "clients": [],
    "players": []         
  };

	// Ensure the password exists and is not empty
	if ((password) && (password == process.env.TEACHER_PASSWORD)) {
    CurrentSession["session_token"] = generate_session_id();
    response.sendFile(__dirname + HTML_PATH + "/teacher.html");
  } else {
    CurrentSession["session_token"] = "NOPE";
    //response.sendFile(__dirname + HTML_PATH + "/login.html");
    response.redirect("/login");
  }
});

/*
app.get("/administrator", (request, response) => {
  response.sendFile(__dirname + HTML_PATH + "/administrator.html");
});
*/


//
// Socket.io messages
//
io.on("connection", (socket) => {
  //==========================================================================
  // Step 0 : connecting and authenticating teacher
  //==========================================================================

  /**
   * When a client (student or teacher) is connected
   */
  console.log(" => new client connection : " + socket.id);

  /**
   * When a client is disconnected
   */
  socket.on("disconnect", (reason) => {
    console.log(` => client disconnects ${socket.id} due to ${reason}`);
  });

  /**
   * When a teacher try to authenticate
   */
  socket.on("teacher_password_request", (data) => {

    // Print request details
    console.log(" => teacher_password_request : " + JSON.stringify(data) );

    // Prepare data for response
    CurrentSession = {
      "progression_id": 1,
      "group_id": 0,
      "session_id": 0,
      "quiz_id": 0,
      "quiz_title": "???",
      "quiz_questions_number": 0,
      "quiz_state": 0,
      "question_id": 0,
      "question_position": 1,
      "question_text": "???",
      "question_time" : 60,
      "question_answers": [],
      "clients": [],
      "players": []         
    };

    // Check if it is the good password
    if (data.teacher_password == process.env.TEACHER_PASSWORD) {
      CurrentSession["session_token"] = socket.id;
    } else {
      CurrentSession["session_token"] = "NOPE";
    }

    // Send our response    
    socket.emit("teacher_password_response", CurrentSession);
    console.log(CurrentSession);
  });
  

  //==========================================================================
  // Step 1 : choosing a quiz to play
  //==========================================================================

  /**
   * When a teacher needs the progressions list
   */
  socket.on("progressions_list_request", (data) => {
    // Print request details
    console.log(" => progressions_list_request : " + JSON.stringify(data) );
    
    // Get quizzes list and return thru socket.io      
    let response = {};
    db.get_all_progressions( (error, data) => {
      response["error"] = error;
      response["progressions"] = data;      
      console.log(response);
      socket.emit("progressions_list_response", response);
    });   
  });

  /**
   * When a teacher needs the quizzes list
   */
  socket.on("quizzes_list_request", (data) => {
    // Print request details
    console.log(" => quizzes_list_request : " + JSON.stringify(data) );
    
    // Save progression_id
    CurrentSession["progression_id"] = data.progression_id;

    // Get quizzes list and return thru socket.io      
    let response = {};
    db.get_all_quizzes( (error, data) => {
      response["error"] = error;
      response["quizzes"] = data;      
      console.log(response);
      socket.emit("quizzes_list_response", response);
    });   
  });

  /**
   * When a teacher has chosen a quiz and wants to create a new session
   */
  socket.on("quizzes_selection_request", (data) => {
    // Print request details
    console.log(" => quizzes_selection_request : " + JSON.stringify(data) );
    
    // Save progression_id
    CurrentSession["quiz_id"] = data.quiz_id;

    // Create a new session
    db.add_new_session(data.quiz_id, data.progression_id, (error, last_id) => {
      CurrentSession["session_id"] = last_id;

      db.get_one_progression(data.progression_id, (error, progression) => {
        CurrentSession["group_id"] = progression.group_id_fk;

        db.get_one_quiz(data.quiz_id, (error, quiz) => {
          CurrentSession["quiz_title"] = quiz.quiz_title;
          CurrentSession["quiz_questions_number"] = quiz.questions_number;
          //current_session["quiz_state"] = 0;

          console.log(CurrentSession);
          socket.emit("quizzes_selection_response", CurrentSession);
          socket.broadcast.emit("quizzes_participation_response", CurrentSession);
        });
      });
    });   
  }); 
  
  /**
   * When a student wants to participate to a quiz
   */
  socket.on("quizzes_participation_request", (data) => {
    // Print request details
    console.log(" => quizzes_participation_request : " + JSON.stringify(data) );
    
    // If the quiz is not already started
    if (CurrentSession["quiz_state"] == 0) {
      // Save client_id in players array
      CurrentSession["clients"].push(data.client_id);      
    }
    
    // Send current session data    
    socket.emit("quizzes_participation_response", CurrentSession);
  });


  //==========================================================================
  // Step 2 : get players names
  //==========================================================================

  /**
   * When a student wants to participate to a quiz
   */
/*  
  socket.on("player_connected_request", (data) => {
    // Print request details
    console.log(" => player_connected_request : " + JSON.stringify(data) );

    // Send current session data
    let response = {"player_name": "anonymous"};    
    socket.broadcast.emit("new_anonymous_player", response);
  });
*/

  /**
   * When a student need the players names of the group to autocomplete its name
   */
  socket.on("players_list_request", (data) => {
    // Print request details
    console.log(" => players_list_request : " + JSON.stringify(data) );
    console.log(CurrentSession);
    
    // If the quiz is not already started
    if (CurrentSession["quiz_state"] == 0) {    

      // Get players names in group and return to student for autocomplete input      
      let response = {};
      db.get_players_from_group(CurrentSession["group_id"], (error, data) => {
        response["error"] = error;
        response["players"] = data;      
        console.log(response);
        socket.emit("players_list_response", response);
      });   
    }
  });

  /**
   * When a student send its name to server
   */
  socket.on("player_subscribe_request", (data) => {
    // Print request details
    console.log(" => player_send_name : " + JSON.stringify(data) );

    let response = {};

    // Check if the quiz is not already started
    if (CurrentSession["quiz_state"] > 0) {   
      response["error"] = "Quiz is already started";
      console.log(response);
      socket.emit("player_subscribe_response", response);
      socket.broadcast.emit("player_subscribe_response", response);      
    }

    // Check if the player has already subscribed
    else if (CurrentSession["players"].indexOf(data.player_name) >= 0) {
      response["error"] = "Player (" + data.player_name + ") already added";
      console.log(response);
      socket.emit("player_subscribe_response", response);
      socket.broadcast.emit("player_subscribe_response", response);
    } 
    
    // If no error, let's add the player to the game
    else {
      // Add player name in the current session
      CurrentSession["players"].push(data.player_name);
      console.log(CurrentSession);

      // Check if players exists              
      db.get_player_id(data.player_name, (error, player) => {
        response["error"] = error;
        response["player"] = player;
        response["session"] = CurrentSession;
        
        // Send response
        console.log(response);
        socket.emit("player_subscribe_response", response);
        socket.broadcast.emit("player_subscribe_response", response);
      });   
    }    
  });

  /**
   * When a teacher remove a player from a session
   */
  socket.on("player_remove_request", (data) => {
    // Print request details
    console.log(" => player_remove_request : " + JSON.stringify(data) );

    // Remove player from the current session
    let player_id = CurrentSession["players"].indexOf(data.player_name);
    if (player_id > -1) {
      CurrentSession["players"].splice(player_id, 1);
    }
    console.log(CurrentSession);

    // Send student its old name    
    socket.broadcast.emit("player_remove_response", data);
  });

  /**
   * When a student wants to participate to a quiz 
   */
/*
  socket.on("quiz_start", (data) => {
    // Print request details
    console.log(" => quiz_start : " + JSON.stringify(data) );

    // Change quiz state
    current_session["quiz_state"] = 1;

    // Send current session data    
    socket.broadcast.emit("question_send_content", current_session);
  });
*/

  //==========================================================================
  // Step 3 : handle questions and answers
  //==========================================================================

  /**
   * When the teacher wants to get the next question
   */
  socket.on("question_details_request", (data) => {
    // Print request details
    console.log(" => question_details_request : " + JSON.stringify(data) );
    
    // Change quiz state
    CurrentSession["quiz_state"] = 1;

    // Get the next question if exists
    let response = {};
    db.get_question_id_from_position(
      CurrentSession["quiz_id"],
      CurrentSession["question_position"],
      (error, question) => {
        console.log("  + question : " + JSON.stringify(question) );

        // If there is a question left in the quiz...
        if (question) {
          console.log(" => quiz is not finished, let's go for a(nother) question");
          response["error"] = error;
          response["question"] = question;      
          CurrentSession["question_id"] = question.question_id

          // Get all answers for this question
          db.get_all_answers(CurrentSession["question_id"], (error, answers) => {
            response["error"] = error;
            let prepared_answers = [null, null, null, null];
            answers.forEach(answer => {
              prepared_answers[ answer["answer_position"] ] = answer["answer_text"]
            });          
            response["answers"] = prepared_answers;    
            console.log(response);
            socket.emit("question_details_response", response);
            socket.broadcast.emit("question_details_response", response);
            CurrentSession["question_position"] += 1;
            start_time = new Date();
          });
        } else {
          console.log(" => quiz is finished, let's go to progression leaderboard directly");
          CurrentSession["quiz_state"] = 2;
          socket.emit("quiz_is_finished", response);
          socket.broadcast.emit("quiz_is_finished", response);
          console.log(" => quiz is finished2, let's go to progression leaderboard directly");
        } 
    });
  });

  /**
   * When a student send its answer
   */
  socket.on("question_answer_request", (data) => {
    // Print request details
    console.log(" => question_answer_request : " + JSON.stringify(data) );
    
    // Measure student's time to answer the question
    end_time = new Date();
    let time_to_answer = (end_time - start_time) / 1000.0;

    let response = {};
    db.get_answer_id_from_position(data.question_id, data.answer_position, (error, answer) => {
      response["error"] = error;      

      // Add player's answer in the database
      db.add_player_response(
        data.session_id,
        data.player_id,
        data.question_id,
        answer.answer_id,
        time_to_answer,
        (error, answer) => {
          response["error"] = error;
          console.log(response);
          socket.broadcast.emit("question_answer_response", response);
      });
    });
  });

  /**
   * When the timer or the teacher tells that the question is finished
   */
  socket.on("question_end_request", (data) => {
    // Print request details
    console.log(" => question_end_request : " + JSON.stringify(data) );
    
    let response = {};
    /*
    let stats = {
      "answer0": [],
      "answer1": [],
      "answer2": [],
      "answer3": []
    };
    for (let i=0; i<4; i++) {
      db.get_players_who_gives_answer(
        current_session["session_id"],
        current_session["question_id"],
        i,
        (error, results) => {
          response["error"] = error;      
          key = "answer" + i;
          stats[key] = results;
      });
    }
    */
    // Get all answers for all players for this question
    db.get_players_answers(
      CurrentSession["session_id"],
      CurrentSession["question_id"],      
      (error, answers) => {
        response["error"] = error;      
        response["answers_by_players"] = answers;
    });
    
    // Get the good answer for this question
    db.get_good_answer_for_question(CurrentSession["question_id"], (error, good_answer) => {
      response["error"] = error;
      response["good_answer"] = good_answer;      
      console.log(response);
      socket.emit("question_end_response", response);
      socket.broadcast.emit("question_end_response", response);
    });
  });
  
  /**
   * When teacher wants to print the leaderboard
   */
  socket.on("quiz_leaderboard_request", (data) => {
    // Print request details
    console.log(" => quiz_leaderboard_request : " + JSON.stringify(data) );
    
    let response = {};
    db.get_leaderboard_for_session(CurrentSession["session_id"], (error, leaderboard) => {
      response["error"] = error;      
      response["leaderboard"] = leaderboard;      
      console.log(response);
      console.log(CurrentSession);

      socket.emit("quiz_leaderboard_response", response);
      socket.broadcast.emit("quiz_leaderboard_response", response);
      /*
      if (current_session["quiz_state"] == 1) {   // Go to next question
        socket.emit("quiz_leaderboard_response", response);
        socket.broadcast.emit("quiz_leaderboard_response", response);
      } else {                                    // Go to Podium
        socket.emit("quiz_podium_request", response);
        socket.broadcast.emit("quiz_podium_request", response);
      }*/
    });
  });
  
  /**
   * When the quiz is finished print the podium (TODO)
   */
  socket.on("progression_leaderboard_request", (data) => {
    // Print request details
    console.log(" => progression_leaderboard_request : " + JSON.stringify(data) );

    // Get leaderboard for the whole progression and its sessions
    let response = {};
    db.get_leaderboard_for_progression(CurrentSession["progression_id"], (error, leaderboard) => {
      response["error"] = error;
      response["leaderboard"] = leaderboard;      
      console.log(response);
      socket.emit("progression_leaderboard_response", response);
      socket.broadcast.emit("progression_leaderboard_response", response);
    });
  });


  //==========================================================================
  // Administration zone
  //==========================================================================

  /**
   * When an administrator try to authenticate
   */
  socket.on("admin_password_request", (data) => {

    // Print request details
    console.log(" => admin_password_request : " + JSON.stringify(data) );

    // Check if it is the good password
    if (data.administrator_password == process.env.TEACHER_PASSWORD) {
      CurrentSession["session_token"] = socket.id;
    } else {
      CurrentSession["session_token"] = "NOPE";
    }

    // Send our response    
    socket.emit("admin_password_response", CurrentSession);
    console.log(CurrentSession);
  });

  /**
   * When a teacher needs the progressions list
   */
  socket.on("admin_progressions_list_request", (data) => {
    // Print request details
    console.log(" => admin_progressions_list_request : " + JSON.stringify(data) );
    
    // Get quizzes list and return thru socket.io      
    let response = {};
    db.get_all_progressions( (error, data) => {
      response["error"] = error;
      response["progressions"] = data;      
      console.log(response);
      socket.emit("admin_progressions_list_response", response);
    });   
  });

  /**
   * When an administrator wants to print the leaderboard of a progression
   */
  socket.on("admin_progression_leaderboard_request", (data) => {
    // Print request details
    console.log(" => admin_progression_leaderboard_request : " + JSON.stringify(data) );

    // Get leaderboard for the whole progression and its sessions
    let response = {};
    db.get_leaderboard_for_progression(data.progression_id, (error, leaderboard) => {
      response["error"] = error;
      response["leaderboard"] = leaderboard;      
      console.log(response);
      socket.emit("admin_progression_leaderboard_response", response);
    });
  });

  /**
   * When an administrator needs the sessions list
   */
  socket.on("admin_sessions_list_request", (data) => {
    // Print request details
    console.log(" => admin_sessions_list_request : " + JSON.stringify(data) );
    
    // Get sessions list and return thru socket.io      
    let response = {};
    db.get_all_sessions( (error, data) => {
      response["error"] = error;
      response["sessions"] = data;      
      console.log(response);
      socket.emit("admin_sessions_list_response", response);
    });   
  });

  /**
   * When an administrator wants to delete a session
   */
  socket.on("admin_sessions_delete_request", (data) => {
    // Print request details
    console.log(" => admin_session_delete_request : " + JSON.stringify(data) );
    
    // Delete session
    let response = {};
    db.delete_session(data.session_id, (error, session_id) => {
      response["error"] = error;
      response["sessions"] = data;      
      console.log(response);
      socket.emit("admin_sessions_delete_request", response);
    });  
  });

  /**
   * When a teacher needs the quizzes list
   */
  socket.on("admin_quizzes_list_request", (data) => {
    // Print request details
    console.log(" => admin_quizzes_list_request : " + JSON.stringify(data) );
    
    // Save progression_id
    CurrentSession["progression_id"] = data.progression_id;

    // Get quizzes list and return thru socket.io      
    let response = {};
    db.get_all_quizzes( (error, data) => {
      response["error"] = error;
      response["quizzes"] = data;      
      console.log(response);
      socket.emit("admin_quizzes_list_response", response);
    });   
  });


  //==========================================================================
  // Just for testing purpose
  //==========================================================================
  /**
   * When we want to test the question print on teacher page
   */
  socket.on("question_details_request_test", (data) => {
    // Print request details
    console.log(" => question_details_request_test : " + JSON.stringify(data) );
       
    // Get the next question if exists
    let response = {};
    db.get_question_id_from_position(
      data.quiz_id,
      data.question_position,
      (error, question) => {
        console.log("  + question : " + JSON.stringify(question) );

        // If there is a question left in the quiz...
        if (question) {
          console.log(" => quiz is not finished, let's go for a(nother) question");
          response["error"] = error;
          response["question"] = question;      
          CurrentSession["question_id"] = question.question_id

          // Get all answers for this question
          db.get_all_answers(CurrentSession["question_id"], (error, answers) => {
            response["error"] = error;
            let prepared_answers = [null, null, null, null];
            answers.forEach(answer => {
              prepared_answers[ answer["answer_position"] ] = answer["answer_text"]
            });          
            response["answers"] = prepared_answers;    
            console.log(response);
            socket.emit("question_details_response", response);
            socket.broadcast.emit("question_details_response", response);
            CurrentSession["question_position"] += 1;
            start_time = new Date();
          });
        } else {
          console.log(" => quiz is finished, let's go to progression leaderboard directly");
          CurrentSession["quiz_state"] = 2;
          socket.emit("quiz_is_finished", response);
          socket.broadcast.emit("quiz_is_finished", response);
          console.log(" => quiz is finished2, let's go to progression leaderboard directly");
        } 
    });
  });
});




// Node.js server listen
server.listen(TCP_PORT, () => {
  console.log("***************************");
  console.log("*** CuiQuiz server v0.1 ***");
  console.log("***************************");
  console.log(" => server listening on *:" + TCP_PORT);
});