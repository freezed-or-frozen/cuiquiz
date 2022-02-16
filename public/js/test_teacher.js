$(document).ready(function(){
    // Page is loaded and ready
    console.log("=> page is ready...");

    // Send server that a new client is connected
    var socket = io();

    // Tests
    $("#quizzes_list_request").click(function(){      
        console.log("=> quizzes_list_request");  
        socket.emit("quizzes_list_request");      
      });
    $("#quizzes_selection_request").click(function(){      
        console.log("=> quizzes_selection_request");  
        socket.emit("quizzes_selection_request");      
    });
    $("#remove_player").click(function(){      
        console.log("=> remove_player");  
        socket.emit("remove_player");      
    });
    $("#question_send_content").click(function(){      
        console.log("=> question_send_content");  
        socket.emit("question_send_content");      
    });      
    $("#question_time_end").click(function(){      
      console.log("=> question_time_end");  
      socket.emit("question_time_end");       
    });
    $("#quiz_leaderboard_request").click(function(){      
      console.log("=> quiz_leaderboard_request");  
      socket.emit("quiz_leaderboard_request");       
    });
    $("#remove_rows").click(function(){      
      console.log("=> remove_rows");  
      $("#playersTable").empty();
      
      let html_table_line = "<tr class=\"removable\">";
        html_table_line += "<td>1</td>";
        html_table_line += "<td>toto</td>";
        html_table_line += "<td>123</td>";
        html_table_line += "</tr>";
        $("#playersTable").append(html_table_line);
    });

    $("#questionDetailsButton").click(function(){      
      console.log("=> question_details_request_test");  
      let request = {};
      request["quiz_id"] = 14;
      request["question_position"] = 1;
      socket.emit("question_details_request_test", request);       
    });

  /**
   * When a new question arrived
   */
  socket.on("question_details_response", function(data) {
    // Print details of received data    
    console.log("=> socket.io::question_details_response : " + JSON.stringify(data));

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
  });

    $("#add_code").click(function(){      
      console.log("=> add_code");
      /*
      let question = "<p>Qu'affichera cet extrait de code ?</p> \
      <img src=\"static/img/quiz3/q5.png\" />";
      $("#questionText").html(question);
      */
        
      let question = "<p>Qu'affichera cet extrait de code ?</p> \
        <textarea id=\"questionCode\" rows=\"4\"> \
for (int i=0; i<5; i++) {\n \
  cout << i*2;\n \
}\n \
        </textarea>";

      $("#questionText").html(question);
      let questionCode = document.getElementById("questionCode");
      var myCodeMirror = CodeMirror.fromTextArea(questionCode, {
        mode: "text/x-c++src",
        lineNumbers: true
      });

      //$("#questionText").html("data.question.question_text");
      
      //let code_to_hightlight = document.getElementById("mycode")
      //hljs.highlightElement(code_to_hightlight);      
      
    });

    // When questions stats results are received
    socket.on("question_stats", function(data) {
      console.log("=> question_stats : " + JSON.stringify(data));
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
          label: "Question #??",
          data: [
            data.answers_by_players.answer0.length,
            data.answers_by_players.answer1.length,
            data.answers_by_players.answer2.length,
            data.answers_by_players.answer3.length
          ],
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
          legend: {
            
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