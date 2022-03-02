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

  // Change the screen to print in the browser
  $("#authentication").css("display", "block");
  $("#progressions").css("display", "none");
  $("#quizzes").css("display", "none");
  $("#markdown").css("display", "none");
  $("#sessions").css("display", "none");
  $("#groups").css("display", "none");
  
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
  // Step 0 : authenticating
  //==========================================================================
  
  /**
   * When teacher click to send its password
   */
  $("#administratorPasswordButton").click(function(){
    // Print details of clicked button
    console.log("=> button::administratorPasswordButton : ");

    // Read player's name and send it to the server
    let administrator_password = $("#administratorPasswordInput").val();
    console.log("  + administrator_password : " + administrator_password); 
    socket.emit(
      "admin_password_request",
      {"administrator_password": administrator_password}
    ); 
  });

  /**
   * When the password is validated by the server
   */
  socket.on("admin_password_response", function(data) {  
    // Print details of received data    
    console.log("=> socket.io::admin_password_request : " + JSON.stringify(data));

    if (data.session_token != "NOPE") {
      // Save the session token
      CurrentSession.session_token = data.session_token;

      let notification = "<div class=\"alert alert-success\" role=\"alert\">"
      notification += "Authentication OK, welcome !</div>";
      $("#notification").html(notification);
      $("#authentication").css("display", "none");
      $("#progressions").css("display", "none");
      $("#quizzes").css("display", "none");
      $("#markdown").css("display", "none");
      $("#sessions").css("display", "none");
      $("#groups").css("display", "none");
    }
  });


  //==========================================================================
  // Progressions
  //==========================================================================

  /**
   * When administrator clicks on progressions menu link
   */
  $("#progressionsButton").click(function(){
    // Print details of clicked button
    console.log("=> button::progressionsButton : ");

    // Check authentication
    if (CurrentSession.session_token) {

      // Change the screen to print in the browser
      $("#notification").html("<div class=\"alert alert-xxx\" role=\"alert\"></div>");
      $("#authentication").css("display", "none");
      $("#progressions").css("display", "block");
      $("#quizzes").css("display", "none");
      $("#markdown").css("display", "none");
      $("#sessions").css("display", "none");
      $("#groups").css("display", "none");     

      // Ask for progressions list
      socket.emit("admin_progressions_list_request", {"token": "..."});
    }
  });

  /**
   * When a the list of progression arrive, we build a table 
   */
  socket.on("admin_progressions_list_response", function(data) { 
    // Print details of received data      
    console.log("=> socket.io::admin_progressions_list_response : " + JSON.stringify(data));      
    
    // Build tables's lines (1 quiz = 1 line)
    $("#progressionsTable").html();
    $.each(data.progressions, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + value.progression_id + "</td>";
      html_table_line += "<td>" + value.progression_name + "</td>";
      html_table_line += "<td>" + value.progression_description + "</td>";
      html_table_line += "<td>" + value.group_name + "</td>";
      html_table_line += "<td><button id=\"" + value.progression_id + "\" type=\"button\" ";
      html_table_line += "class=\"btn btn-primary progressionLeadertable\">";
      html_table_line += "Leaderboard</button></td>";
      html_table_line += "</tr>";
      $("#progressionsTable").append(html_table_line);
    });
  });

  /**
   * When clicking to print the leaderboard
   */
  $(document).on("click", ".progressionLeadertable" ,function (event) {      
    // Print details of event
    console.log("=> button::.progressionLeadertable : " + this.id);        

    // Send selected quiz_id thru socket.io
    socket.emit("admin_progression_leaderboard_request", {"progression_id": this.id});
  });


  //==========================================================================
  // Quizzes
  //==========================================================================

  /**
   * When administrator clicks on quizzes menu link
   */
  $("#quizzesButton").click(function(){
    // Print details of clicked button
    console.log("=> button::quizzesButton : ");

    // Check authentication
    if (CurrentSession.session_token) {
      // Change the screen to print in the browser
      $("#notification").html("<div class=\"alert alert-xxx\" role=\"alert\"></div>");
      $("#authentication").css("display", "none");
      $("#progressions").css("display", "none");
      $("#quizzes").css("display", "block");
      $("#markdown").css("display", "none");
      $("#sessions").css("display", "none");
      $("#groups").css("display", "none");  
      
      // Ask for quizzes list
      socket.emit("admin_quizzes_list_request", {"progression_id": 0});
    }
  });

  /**
   * When a the list of quizzes arrive, we build a table 
   */
  socket.on("admin_quizzes_list_response", function(data) { 
    // Print details of received data      
    console.log("=> socket.io::quizzes_list_response : " + JSON.stringify(data));      
    
    // Build tables's lines (1 quiz = 1 line)
    $.each(data.quizzes, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + value.quiz_id + "</td>";
      html_table_line += "<td>" + value.quiz_title + "</td>";
      html_table_line += "<td>" + value.quiz_description + "</td>";
      html_table_line += "<td><button id=\"" + value.quiz_id + "\" type=\"button\" ";
      html_table_line += "class=\"btn btn-danger deletable\">";
      html_table_line += "Delete</button></td>";
      html_table_line += "</tr>";
      $("#quizzesTable").append(html_table_line);
    });
  });

  /**
   * When administrator clicks on new quiz button
   */
  $("#newQuizButton").click(function(){
    // Print details of clicked button
    console.log("=> button::newQuizButton : ");

    // Check authentication
    if (CurrentSession.session_token) {
      // Change the screen to print in the browser
      $("#notification").html("<div class=\"alert alert-xxx\" role=\"alert\"></div>");
      $("#authentication").css("display", "none");
      $("#progressions").css("display", "none");
      $("#quizzes").css("display", "none");
      $("#markdown").css("display", "block");
      $("#sessions").css("display", "none");
      $("#groups").css("display", "none");       
    }
  });

  /**
   * When administrator clicks on add quiz button
   */
  $("#addQuizButton").click(function(){
    // Print details of clicked button
    console.log("=> button::addQuizButton : ");

    // Check authentication
    if (CurrentSession.session_token) {

      // Read markdown quiz and send it to the server
      let quiz_markdown = $("#quizMarkdown").val();
      console.log("  + quiz_markdown : " + quiz_markdown); 
      socket.emit(
        "admin_quiz_add_request",
        {"quiz_markdown": quiz_markdown}
      );
    }
  });


  //==========================================================================
  // Sessions
  //==========================================================================

  /**
   * When administrator clicks on quizzes menu link
   */
  $("#sessionsButton").click(function(){
    // Print details of clicked button
    console.log("=> button::sessionButton : ");

    // Check authentication
    if (CurrentSession.session_token) {
      // Change the screen to print in the browser
      $("#notification").html("<div class=\"alert alert-xxx\" role=\"alert\"></div>");
      $("#authentication").css("display", "none");
      $("#progressions").css("display", "none");
      $("#quizzes").css("display", "none");
      $("#markdown").css("display", "none");
      $("#sessions").css("display", "block");
      $("#groups").css("display", "none"); 
      
      // Ask for sessions list
      socket.emit("admin_sessions_list_request");
    }
  });

  /**
   * When the list of sessions arrive, we build a table 
   */
  socket.on("admin_sessions_list_response", function(data) { 
    // Print details of received data      
    console.log("=> socket.io::sadmin_essions_list_response : " + JSON.stringify(data));      
    
    // Build tables's lines (1 quiz = 1 line)
    $.each(data.sessions, function(key, value) {
      let html_table_line = "<tr>";
      html_table_line += "<td>" + value.session_id + "</td>";
      html_table_line += "<td>" + value.session_date + "</td>";
      html_table_line += "<td>" + value.quiz_id_fk + "</td>";
      html_table_line += "<td>" + value.progression_id_fk + "</td>";
      html_table_line += "<td><button id=\"" + value.session_id + "\" type=\"button\" ";
      html_table_line += "class=\"btn btn-danger sessionDeletable\">";
      html_table_line += "Delete</button></td>";
      html_table_line += "</tr>";
      $("#sessionsTable").append(html_table_line);
    });
  });

  /**
   * When clicking to delete a session
   */
  $(document).on("click", ".sessionDeletable" ,function (event) {      
    // Print details of event
    console.log("=> button::.sessionDeletable : " + this.id);        

    // Send selected quiz_id thru socket.io
    socket.emit("admin_sessions_delete_request", {"session_id": this.id});
  });


  //==========================================================================
  // Groups
  //==========================================================================

  /**
   * When administrator clicks on groups menu link
   */
  $("#groupsButton").click(function(){
    // Print details of clicked button
    console.log("=> button::groupsButton : ");

    // Check authentication
    if (CurrentSession.session_token) {
      // Change the screen to print in the browser
      $("#notification").html("<div class=\"alert alert-xxx\" role=\"alert\"></div>");
      $("#authentication").css("display", "none");
      $("#progressions").css("display", "none");
      $("#quizzes").css("display", "none");
      $("#markdown").css("display", "none");
      $("#sessions").css("display", "none");
      $("#groups").css("display", "block");     
    }
  });

});