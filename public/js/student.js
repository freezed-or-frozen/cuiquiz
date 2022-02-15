/**
 * CuiQuiz project :: student part
 * 
 * Handle student web page and its socket.io requests/responses
 */

// Global variables
var CurrentSession = {};

// Let's start...
$(document).ready(function(){

  //==========================================================================
  // Step 0 : initialization
  //==========================================================================
  console.log("=> page is ready...");  

  /**
   * Generate an unique ID for the client
   */
  function generate_id()  {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
  }

  // Choose the screen to print in the browser
  $("#choosing").css("display", "block");
  $("#naming").css("display", "none");
  $("#gaming").css("display", "none");
  $("#checking").css("display", "none");
  $("#ending").css("display", "none");
  
  // Create the socket.io
  var socket = io();

  // Handle connection status icon
  socket.on("connect", function(msg){
    console.log("=> socket.io::connect"); 
    $("#connectionStatus").html("<span class=\"badge rounded-pill bg-success text-dark\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-wifi\" viewBox=\"0 0 16 16\"><path d=\"M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z\"/><path d=\"M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091l.016-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z\"/></svg></span>");
  });

  socket.on("disconnect", function(){
    console.log("=> socket.io::disconnect");
    $("#connectionStatus").html("<span class=\"badge rounded-pill bg-danger text-dark\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-wifi-off\" viewBox=\"0 0 16 16\"><path d=\"M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a6.455 6.455 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.532.532 0 0 1-.611.09A5.478 5.478 0 0 0 8 10zm4.905-4.905.747-.747c.59.3 1.153.645 1.685 1.03a.485.485 0 0 1 .047.737.518.518 0 0 1-.668.05 11.493 11.493 0 0 0-1.811-1.07zM9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A1.99 1.99 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75l10.75-10.75z\"/></svg></span>");
  });
  
  // Send server that a new client is connected
  socket.emit("quizzes_participation_request", {"client_id": generate_id()});


  //==========================================================================
  // Step 1 : choosing the quiz to play with
  //==========================================================================

  /**
   * When a new quiz was selected by the teacher, it should appear on player's screen
   */
  socket.on("quizzes_participation_response", function(data) {
    // Print received data details
    console.log("=> socket.io::quizzes_participation_response : " + JSON.stringify(data));      
    
    // Save quiz in global variable
    CurrentSession.quiz = data;

    // Adapt screen
    if (data.quiz_id == 0) {
      $("#quizToPlay").html("No quiz to play for the moment...");
    } else {
      if (data.quiz_state > 0) {
        $("#quizToPlay").html("Sorry, quiz <strong>" + data.quiz_title + "</strong> is already started !");
        socket.disconnect();
      } else {
        // Add a button to participate to the quiz
        let html_button = "";
        html_button += "<button id=\"" + data.quiz_id + "\" type=\"button\" ";
        html_button += "class=\"btn btn-primary playable\">";
        html_button += data.quiz_title
        html_button += " <span class=\"badge badge-light\">" + data.quiz_questions_number + "</span></button>";
        $("#quizToPlay").html(html_button);
      }
    } 
  });

  /**
   * When clicking to choose a quiz
   */
  $(document).on("click", ".playable" ,function (event) {
    // Print details of event
    console.log("=> button::.playable : " + this.id);

    // Send it to the server
    socket.emit("players_list_request"); 
  });


  //==========================================================================
  // Step 2 : each player send its name to play
  //==========================================================================

  /**
   * When we receive the list of the available player's names
   */
  socket.on("players_list_response", function(data) {   
    console.log("=> socket.io::players_list_response : " + JSON.stringify(data));

    // Change the screen to print in the browser       
    $("#choosing").css("display", "none");
    $("#naming").css("display", "block");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "none");
    $("#ending").css("display", "none");

    // Fill an array...
    let availablePlayers = [];
    $.each(data.players, function(key, value) {
      //console.log(key + " --- " + value);
        availablePlayers.push(value.player_name); 
    });
    console.log(availablePlayers)    

    // ... for autocomplete function
    $("#playerNameInput").autocomplete({
        source: availablePlayers
      });
  });

  /**
   * When clicking to send player's name
   */
  $("#playerNameButton").click(function(){
    // Print details of clicked button
    console.log("=> button::playerNameButton : ");

    // Read player's name and send it to the server
    let player_name = $("#playerNameInput").val();
    CurrentSession.player = player_name;
    console.log("  + player name : " + player_name); 
    socket.emit("player_subscribe_request", {"player_name": player_name}); 
    
    // Modify properties and content of the page elements
    $("#playerName").val(player_name);
    $("#playerNameInput").prop("disabled", true);
    $("#playerNameButton").html("Waiting...");
    $("#playerNameButton").prop("disabled", true);
  });
  
  /**
   * When player was allowed to play, which means :
   * - player exists in database
   * - player subscribes only once
   * - quiz is not started
   */
  socket.on("player_subscribe_response", function(data) {
    // Print details of received data  
    console.log("=> socket.io::player_subscribe_response : " + JSON.stringify(data));

    // If no error and the subscription resonse if for us
    if (!data.error) {
      if (data.player.player_name == CurrentSession.player) {
        // Save data if student is allowed to play
        CurrentSession.player = data.player;
        CurrentSession.session = data.session;
        CurrentSession.session_id = data.session.session_id
        console.log("CurrentSession : " + JSON.stringify(CurrentSession));
      } else {
        console.log("  + subscription response not for us");
      }
    } else {
      // Player can type another player name
      CurrentSession.session_id = 0;
      $("#playerName").val("");
      $("#playerNameInput").val("");
      $("#playerNameInput").prop("disabled", false);
      $("#playerNameButton").html("Submit again");
      $("#playerNameButton").prop("disabled", false);
    }    
  });

  /**
   * When a player was kicked
   */
  socket.on("player_remove_response", function(data) {
    // Print details of received data  
    console.log("=> socket.io::player_remove_response : " + JSON.stringify(data));

    // Enabled HTML components to type player name again
    if (data.player_name == CurrentSession.player.player_name) {
      CurrentSession.session_id = 0;
      $("#playerName").val("");
      $("#playerNameInput").val("");
      $("#playerNameInput").prop("disabled", false);
      $("#playerNameButton").html("Submit again");
      $("#playerNameButton").prop("disabled", false);
    }
  });

  /**
   * When the quiz is started by the teacher
   */
/*  
  socket.on("quiz_start", function(data) {
    // Print details of received data  
    console.log("=> socket.io::quiz_start : " + JSON.stringify(data));

    // Check if player is allowed to play
    if (CurrentSession.session_id > 0) {
      // Save data
      CurrentSession.quiz = data;
      console.log("CurrentSession : " + JSON.stringify(CurrentSession));

      // Change the screen to print in the browser
      $("#choosing").css("display", "none");
      $("#naming").css("display", "none");
      $("#gaming").css("display", "block");
      $("#checking").css("display", "none");
      $("#ending").css("display", "none");  
    }      
  });
*/

  //==========================================================================
  // Step 3 : the quiz and its questions
  //==========================================================================

  /**
   * Change all buttons states
   * @param {*} new_state 
   */
  function change_all_buttons_states(new_state) {
    $("#redButton").prop("disabled", new_state);
    $("#blueButton").prop("disabled", new_state);
    $("#yellowButton").prop("disabled", new_state);
    $("#greenButton").prop("disabled", new_state);
  }

  /**
   * When a new question is received
   */
  socket.on("question_details_response", function(data) {
    // Print details of received data  
    console.log("=> socket.io::question_details_response : " + JSON.stringify(data));

    // Check if player is allowed to play
    if (CurrentSession.session_id > 0) {
      // Change the screen to print in the browser
      $("#choosing").css("display", "none");
      $("#naming").css("display", "none");
      $("#gaming").css("display", "block");
      $("#checking").css("display", "none");
      $("#ending").css("display", "none"); 

      // Enable the 4 answer's buttons
      change_all_buttons_states(false);

      // Save question details
      //CurrentSession.quiz_id = data.quiz_id;
      CurrentSession.question = data.question;
      // $("#quizId").val(data.quiz_id);
      // $("#questionId").val(data.question_id);
    } else {
      $("#choosing").css("display", "block");
      $("#naming").css("display", "none");
      $("#gaming").css("display", "none");
      $("#checking").css("display", "none");
      $("#ending").css("display", "none"); 
    }  
  });

  /**
   * Send player's answer to the server
   * @param {*} answer_id 
   */
  function prepare_and_send_answer(answer_position) {
    // Save player's answer
    CurrentSession.last_given_answer = answer_position;

    // Send player's answer to the server
    socket.emit("question_answer_request", {
      "session_id": CurrentSession.session.session_id,
      "question_id": CurrentSession.question.question_id,
      "player_id": CurrentSession.player.player_id,
      "player_name": CurrentSession.player.player_name,
      "answer_position": answer_position
    }); 
  }

  /**
   * When player answers with the RED button (answer0)
   */
  $("#redButton").click(function(){
    prepare_and_send_answer(0);
    change_all_buttons_states(true);
  });

  /**
   * When player answers with the BLUE button (answer1)
   */
  $("#blueButton").click(function(){
    prepare_and_send_answer(1);
    change_all_buttons_states(true);
  });

  /**
   * When player answers with the YELLOW button (answer2)
   */
  $("#yellowButton").click(function(){
    prepare_and_send_answer(2);
    change_all_buttons_states(true);
  });

  /**
   * When player answers with the GREEN button (answer3)
   */
  $("#greenButton").click(function(){
    prepare_and_send_answer(3);
    change_all_buttons_states(true);
  });

  /**
   * When the question is finished and we receive the results
   */  
  socket.on("question_end_response", function(data) {
    // Print details of received data  
    console.log("=> socket.io::question_end_response : " + JSON.stringify(data));

    // Check if player is allowed to play
    if (CurrentSession.session_id > 0) {

      // Prepare the card response
      if (CurrentSession.last_given_answer == data.good_answer.answer_position) {
        $("#questionAnswer").removeClass();
        $("#questionAnswer").addClass("card text-white bg-success mb-3");
        $("#commentAnswer").html("Well done ! :)");
      } else {
        $("#questionAnswer").removeClass();
        $("#questionAnswer").addClass("card text-white bg-danger mb-3");
        $("#commentAnswer").html("Sorry... :(");
      }
      $("#goodAnswer").html(data.good_answer.answer_text);    

      // Change the screen to print in the browser
      $("#choosing").css("display", "none");
      $("#naming").css("display", "none");
      $("#gaming").css("display", "none");
      $("#checking").css("display", "block");
      $("#ending").css("display", "none"); 
    }   
  });
});