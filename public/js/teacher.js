/**
 * CuiQuiz project :: teacher part
 * 
 * Handle teacher web page and its socket.io requests/responses
 */

// Global variables
var CurrentSession = {};

// Let's start...
$(document).ready(function(){

  // Page is loaded and ready
  console.log("=> page is ready...");  

  // Choose the screen to print in the browser
  $("#authenticating").css("display", "block");
  $("#choosing").css("display", "none");
  $("#naming").css("display", "none");
  $("#gaming").css("display", "none");
  $("#checking").css("display", "none");
  $("#sorting").css("display", "none");
  $("#thanking").css("display", "none");
  $("#ending").css("display", "none");
  
  // Creation of socket.io object
  var socket = io();

  socket.on("connect", function(msg){
    console.log("=> socket.io::connect"); 
    $("#connectionStatus").html("<span class=\"badge rounded-pill bg-success text-dark\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-wifi\" viewBox=\"0 0 16 16\"><path d=\"M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z\"/><path d=\"M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091l.016-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z\"/></svg></span>");
  });
  socket.on("disconnect", function(){
    console.log("=> socket.io::disconnect");
    $("#connectionStatus").html("<span class=\"badge rounded-pill bg-danger text-dark\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-wifi-off\" viewBox=\"0 0 16 16\"><path d=\"M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a6.455 6.455 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.532.532 0 0 1-.611.09A5.478 5.478 0 0 0 8 10zm4.905-4.905.747-.747c.59.3 1.153.645 1.685 1.03a.485.485 0 0 1 .047.737.518.518 0 0 1-.668.05 11.493 11.493 0 0 0-1.811-1.07zM9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A1.99 1.99 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75l10.75-10.75z\"/></svg></span>");
  });
  
  // Initialize global variables
  CurrentSession.players = [];


  //==========================================================================
  // Step 0 : starting
  //==========================================================================
  
  /**
   * When teacher click to send its password
   */
  $("#progressionButton").click(function(){
    // Teacher wants to get the progression list
    socket.emit("progressions_list_request", {"token": "..."});
  });
  
  //==========================================================================
  // Step 1 : choosing the progression, the quiz
  //==========================================================================

  /**
   * When a the list of progression arrive, we build a table 
   */
  socket.on("progressions_list_response", function(data) { 
    // Print details of received data      
    console.log("=> socket.io::progressions_list_response : " + JSON.stringify(data));      
    
    // Choose the screen to print in the browser
    $("#authenticating").css("display", "none");
    $("#choosing").css("display", "block");
    $("#naming").css("display", "none");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "none");
    $("#sorting").css("display", "none");
    $("#thanking").css("display", "none");
    $("#ending").css("display", "none");

    // Build tables's lines (1 quiz = 1 line)
    $.each(data.progressions, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + value.progression_id + "</td>";
      html_table_line += "<td>" + value.progression_name + "</td>";
      html_table_line += "<td>" + value.progression_description + "</td>";
      html_table_line += "<td>" + value.group_name + "</td>";
      html_table_line += "<td><button id=\"" + value.progression_id + "\" type=\"button\" ";
      html_table_line += "class=\"btn btn-success selectable\">";
      html_table_line += "Choose</button>";
      html_table_line += "<button id=\"" + value.progression_id + "\" type=\"button\" ";
      html_table_line += "class=\"btn btn-primary printable\">";
      html_table_line += "Results</button></td>";
      html_table_line += "</tr>";
      $("#progressionsTable").append(html_table_line);
    });
  });

  /**
   * When clicking to choose a progression to print results
   */
  $(document).on("click", ".printable" ,function (event) {      
    // Print details of event
    console.log("=> button::.printable : " + this.id);        

    // Send selected quiz_id thru socket.io
    socket.emit("progression_leaderboard_request", {"progression_id": this.id});
  });

  /**
   * When clicking to choose a progression to play into
   */
  $(document).on("click", ".selectable" ,function (event) {      
    // Print details of event
    console.log("=> button::.selectable : " + this.id);        

    // Save the quiz_id
    CurrentSession.progression_id = this.id;

    // Send selected quiz_id thru socket.io
    //socket.emit("progressions_selection_request", {"progression_id": this.id});
    socket.emit("quizzes_list_request", {"progression_id": this.id});
  });

  /**
   * When a the list of quizzes arrive, we build a table 
   */
  socket.on("quizzes_list_response", function(data) { 
    // Print details of received data      
    console.log("=> socket.io::quizzes_list_response : " + JSON.stringify(data));      
    
    // Build tables's lines (1 quiz = 1 line)
    $.each(data.quizzes, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + value.quiz_id + "</td>";
      html_table_line += "<td>" + value.quiz_title + "</td>";
      html_table_line += "<td><button id=\"" + value.quiz_id + "\" type=\"button\" ";
      html_table_line += "class=\"btn btn-primary playable\">";
      html_table_line += "New session</button></td>";
      html_table_line += "</tr>";
      $("#quizzesTable").append(html_table_line);
    });
  });

  /**
   * When clicking to start to play a quiz => new session should be created
   */
  $(document).on("click", ".playable" ,function (event) {      
    // Print details of event
    console.log("=> button::.playable : " + this.id);        

    // Save the quiz_id
    CurrentSession.quiz_id = this.id;

    // Send selected quiz_id thru socket.io
    let request = {
      "progression_id": CurrentSession.progression_id,
      "quiz_id": CurrentSession.quiz_id
    }
    socket.emit("quizzes_selection_request", request);
  });

  /**
   * When a new session is created, we change screen to wait for players to connect
   */
  socket.on("quizzes_selection_response", function(data) {  
    // Print details of received data    
    console.log("=> socket.io::quizzes_selection_response : " + JSON.stringify(data));

    // Save the quiz_id
    CurrentSession.session_id = data.session_id;
    
    // Print the quiz title
    $("#quizTitle").html(data.quiz_title);

    // Change the screen to print in the browser
    $("#choosing").css("display", "none");
    $("#naming").css("display", "block");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "none");
    $("#sorting").css("display", "none");
    $("#thanking").css("display", "none");
    $("#ending").css("display", "none");
  });

  
  //==========================================================================
  // Step 2 : wait for players names
  //==========================================================================

  /**
   * When a new player send its name to play
   */
  socket.on("player_subscribe_response", function(data) { 
    // Print details of received data     
    console.log("=> socket.io::player_subscribe_response : " + JSON.stringify(data));

    // If no error during player subscription
    if (!data.error) {
      // Add a button with player's name to kick him/her if needed
      let html_button = "";
      html_button += "<button id=\"" + data.player.player_name + "\" type=\"button\" ";
      html_button += "class=\"btn btn-primary removable\">";
      html_button += data.player.player_name + "</button>&nbsp;";
      $("#players").append(html_button);

      // Add the new player to global variables
      CurrentSession.players.push(data);
      console.log("CurrentSession : " + JSON.stringify(CurrentSession));

      // Update players number
      $("#playersNumber").html(CurrentSession.players.length);
    }    
  });

  /**
   * When clicking the button to kick a player
   */
  $(document).on("click", ".removable" ,function (event) {
    // Print event details
    console.log("=> button::.removable : " + this.id);

    // Remove the button
    this.remove();

    // Remove the player from global variable array
    const index = CurrentSession.players.indexOf(this.id);
    if (index > -1) {
      CurrentSession.players.splice(index, 1);
    }

    // Send player_id to server 
    socket.emit("player_remove_request", {"player_name": this.id});
  });

  /**
   * When clicking the button to start the quiz
   */
  $("#quizStart").click(function(){
    console.log("=> button::#quizStart) : ");  

    // Tell server that we need the next question of the quiz
    socket.emit("question_details_request");    
  });


  //==========================================================================
  // Step 3 : quiz and its questions
  //==========================================================================
  
  /**
   * Update the timer
   */
  function update_timer() {
    CurrentSession.timer_value -= 1;    

    if (CurrentSession.timer_value > 0) {
      $("#questionTimer").html(CurrentSession.timer_value);
      CurrentSession.timer_object = setTimeout(function() {
        update_timer();
      }, 1000);
    } else {
      if (CurrentSession.timer_state == true) {
        // Tell server that the question is finished
        socket.emit("question_time_end");  
      }
    }
  }

  /**
   * When a new question arrived
   */
  socket.on("question_details_response", function(data) {
    // Print details of received data    
    console.log("=> socket.io::question_details_response : " + JSON.stringify(data));

    // Initialize answers number to 0
    CurrentSession.answers_number = 0;

    // Choose the screen to print in the browser
    $("#choosing").css("display", "none");
    $("#naming").css("display", "none");
    $("#gaming").css("display", "block");
    $("#checking").css("display", "none");
    $("#sorting").css("display", "none");
    $("#thanking").css("display", "none");
    $("#ending").css("display", "none");

    // Print question content
    $("#questionText").html(data.question.question_text);
    $("#questionAnswer0").html(data.answers[0]);
    $("#questionAnswer1").html(data.answers[1]);
    $("#questionAnswer2").html(data.answers[2]);
    $("#questionAnswer3").html(data.answers[3]);

    // Hightlight color syntax
    document.querySelectorAll("pre code").forEach((block) => {      
      hljs.highlightElement(block);
      hljs.lineNumbersBlock(block);
    });

    // Start the timer
    CurrentSession.timer_state = true;
    CurrentSession.timer_value = data.question.question_time;
    CurrentSession.timer_object = setTimeout(function() {
      update_timer();
    }, 1000);
  });
  
  
  /**
   * When a player answered a question
   */
  socket.on("question_answer_response", function(data) {
    // Print details of received data    
    console.log("=> socket.io::question_answer_response : " + JSON.stringify(data));

    // Increment, save and print the new value
    CurrentSession.answers_number += 1;
    $("#answersNumber").html(CurrentSession.answers_number);
  });

  /**
   * When clicking to end the question before time is up
   */
  $("#endBeforeTimeUp").click(function(){
    // Print button details
    console.log("=> button::#endBeforeTimeUp) : ");  
    CurrentSession.timer_state = false;

    // Tell server that the question is finished
    socket.emit("question_end_request");    
  });

  /**
   * When questions stats results are received
   */
  socket.on("question_end_response", function(data) {
    // Print details of received data   
    console.log("=> socket.io::question_end_response : " + JSON.stringify(data));

    // Choose the screen to print in the browser
    $("#choosing").css("display", "none");
    $("#naming").css("display", "none");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "block");
    $("#sorting").css("display", "none");
    $("#thanking").css("display", "none");
    $("#ending").css("display", "none");

    // Prepare the data
    let stats = [0, 0, 0, 0];
    data.answers_by_players.forEach(answer => {
      stats[answer.answer_position] += 1;
    });
    console.log("stats : " + JSON.stringify(stats));
    
    // Prepare the title of the chart
    let chart_title = "GOOD ANSWER : " + data.good_answer.answer_text + " (" + data.good_answer.answer_position + ")";

    // Create and print the chart
    const ctx = $('#chartAnswers');
    if (typeof CurrentSession.chart != "undefined") {
      CurrentSession.chart.destroy();
    }        
    CurrentSession.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Red", "Blue", "Yellow", "Green"],
        datasets: [{
          label: "",
          data: stats,
          /*data: [
            data.answers_by_players.answer0.length,
            data.answers_by_players.answer1.length,
            data.answers_by_players.answer2.length,
            data.answers_by_players.answer3.length
          ],*/
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        // TODO : add students names in tooltips
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: chart_title
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  });

  /**
   * Tell the server that we need the next question
   */  
  $("#getLeaderboard").click(function(){
    // Print button details
    console.log("=> button::#getLeaderboard) : ");  

    // Tell server that we need the leaderboard
    socket.emit("quiz_leaderboard_request");    
  });

  /**
   * Tell the server that we need the next question
   */  
  $("#nextQuestion").click(function(){
    // Print button details
    console.log("=> button::#nextQuestion) : ");  

    // Tell server that we need the next question
    socket.emit("question_details_request");    
  });

  /**
   * When question leaderboard results are received
   */
  socket.on("quiz_leaderboard_response", function(data) {
    // Print details of received data  
    console.log("=> socket.io::quiz_leaderboard_response : " + JSON.stringify(data));

    // Choose the screen to print in the browser
    $("#choosing").css("display", "none");
    $("#naming").css("display", "none");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "none");
    $("#sorting").css("display", "block");
    $("#thanking").css("display", "none");
    $("#ending").css("display", "none");

    // Remove the lines of the last leaderboard
    $("#playersTable").empty();

    // Construct the leaderboard table line by line
    let rank = 1;
    $.each(data.leaderboard, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + rank + "</td>";
      html_table_line += "<td>" + value.player_name + "</td>";
      html_table_line += "<td>" + Math.round(value.player_score) + "</td>";
      html_table_line += "</tr>";
      $("#playersTable").append(html_table_line);
      rank++;
    });
  });

  /**
   * When progression leaderboard results are received
   */
  socket.on("quiz_is_finished", function(data) {
    // Print details of received data  
    console.log("=> socket.io::quiz_is_finished : " + JSON.stringify(data));

    // Choose the screen to print in the browser
    $("#choosing").css("display", "none");
    $("#naming").css("display", "none");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "none");
    $("#sorting").css("display", "none");
    $("#thanking").css("display", "block");
    $("#ending").css("display", "none");
  });

  /**
   * Tell the server that we need the leaderboard for the whole progression
   */  
  $("#getProgressionLeaderboard").click(function(){
    // Print button details
    console.log("=> button::#getProgressionLeaderboard) : ");  

    // Tell server that we need the progression leaderboard
    socket.emit("progression_leaderboard_request");    
  });

  /**
   * When progression leaderboard results are received
   */
  socket.on("progression_leaderboard_response", function(data) {
    // Print details of received data  
    console.log("=> socket.io::progression_leaderboard_response : " + JSON.stringify(data));

    // Choose the screen to print in the browser
    $("#choosing").css("display", "none");
    $("#naming").css("display", "none");
    $("#gaming").css("display", "none");
    $("#checking").css("display", "none");
    $("#sorting").css("display", "none");
    $("#thanking").css("display", "none");
    $("#ending").css("display", "block");

    // Remove the lines of the last leaderboard
    $("#playersFinalTable").empty();

    // Construct the leaderboard table line by line
    let rank = 1;
    $.each(data.leaderboard, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + rank + "</td>";
      html_table_line += "<td>" + value.player_name + "</td>";
      html_table_line += "<td>" + Math.round(value.player_score) + "</td>";
      html_table_line += "</tr>";
      $("#playersFinalTable").append(html_table_line);
      rank++;
    });
  });

  
});