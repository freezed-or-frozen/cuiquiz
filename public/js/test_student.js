$(document).ready(function(){
    // Page is loaded and ready
    console.log("=> page is ready...");

    // Send server that a new client is connected
    var socket = io();

    // Tests
    $("#quizzes_participation_response").click(function(){      
        console.log("=> quizzes_participation_response");  
        socket.emit("quizzes_participation_response");      
      });
    $("#players_list_names").click(function(){      
        console.log("=> players_list_names");  
        socket.emit("players_list_names");      
    });
    $("#player_in_database").click(function(){      
        console.log("=> player_in_database");  
        socket.emit("player_in_database");      
    });
    $("#player_send_name_again").click(function(){      
        console.log("=> player_send_name_again");  
        socket.emit("player_send_name_again");      
    });      
    $("#quiz_start").click(function(){      
      console.log("=> quiz_start");  
      socket.emit("quiz_start");       
    });
    $("#question_receive").click(function(){      
      console.log("=> question_receive");  
      socket.emit("question_receive");       
    });
    $("#question_stats").click(function(){      
      console.log("=> question_stats");  
      //socket.emit("question_stats", broadcast=true);   
      //$("#questionAnswer").("class", "card text-white bg-danger mb-3");    
      $("#questionAnswer").removeClass();
      $("#questionAnswer").addClass("card text-white bg-danger mb-3");
      $("#commentAnswer").html("Sorry... :(");
      $("#goodAnswer").html("Anna");
      $("#yourAnswer").html("Emma");
    });

    // When questions stats results are received
    socket.on("question_stats", function(data) {
      console.log("=> question_stats : " + JSON.stringify(data));
      //$("#questionAnswer").removeClass("card text-white bg-success mb-3");
      $("#questionAnswer").css("class", "card text-white bg-danger mb-3");
    });

    // When questions stats results are received
    socket.on("quiz_leaderboard_response", function(data) {
      console.log("=> quiz_leaderboard_response : " + JSON.stringify(data));

      let rank = 1;
      $.each(data.leaderboard, function(key, value) {
        let html_table_line = "<tr>";
        html_table_line += "<td>" + rank + "</td>";
        html_table_line += "<td>" + value.player_name + "</td>";
        html_table_line += "<td>" + Math.round(value.player_score) + "</td>";
        html_table_line += "</tr>";
        //$("#players").append("<button id=\"" + data.name + "\" type=\"button\" class=\"btn btn-primary btn-close\">" + data.name + "</button>");
        $("#playersTable").append(html_table_line);
        rank++;
      });
    });
    
  });