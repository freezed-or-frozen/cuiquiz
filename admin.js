/**
 * CuiQuiz project :: administrate quizzes from command line
 * 
 * Import quiz from Markdown file into SQLite database
 */

// To read and parse Markdown files
const fs = require("fs");
const md = require('markdown-it')();
const YAML = require('yaml');

// To use custom db driver
const db = require("./db");

//==========================================================================
// Functions definitions
//==========================================================================

/**
 * Transform a Markdown format quiz into a JSON object
 * @param {*} markdown_quiz 
 */
function md2json(markdown_quiz) {

  console.log("===== md2json =====");

  // Convert markdown into an array of tokens thanks to markdown-it library
  const tokens = md.parse(markdown_quiz, {references: {}});
  console.log(tokens);

  // Variables
  let quiz = {};
  quiz["questions"] = [];
  let question = {};

  let new_meta = false;
  let new_question = false;
  let new_answer = false;
  let code_language = "";

  let quiz_id = 0;

  let question_id = 0;
  let question_text = "";
  let question_position = 1;

  let answer_is_correct = false;
  let answer_position = 0;

  // Analyse tokens with a finite state machine
  for (let i=0; i<tokens.length; i++) {

    // Get the iest token
    token = tokens[i];
    
    // New titles
    if (token.type == "heading_open") {
      if (token.level == 0) {
        if (token.markup == '-') {
          new_meta = true;
        }         
      }
    }

    // New paragraph can be a new question or a new answer
    if (token.type == "paragraph_open") {
      if (token.level == 0) {
        new_question = true;
      }
      if (token.level == 2) {
        new_answer = true;
      }
    }

    // New answer can be the correct one or not
    if (token.type == "list_item_open") {
      if (token.level == 1) {
        if (token.markup == '*') {
          answer_is_correct = true;
        }
        if (token.markup == '-') {
          answer_is_correct = false;
        }
      }       
    }
    
    // Get content of the title, description, question or the answer
    if (token.type == "inline") {

      // Get the quiz metadata in YAML format
      if (new_meta == true) {
        // Parse YAML metadata of Mardown file thanks to yaml library
        const quiz_yml = YAML.parse(token.content);
        quiz["quiz_title"] = quiz_yml.quiz_title;
        quiz["quiz_description"] = quiz_yml.quiz_description;
        quiz["question_time"] = quiz_yml.question_time;
        console.log("META => " + JSON.stringify(quiz_yml));
      }
      
      // Get a new question
      if (new_question == true) {
        console.log(token.content + " (" + question_position + ")");
        
        question = {};
        let question_text = "";
        question_text += "<p class=\"lead\">";
        question_text += token.content;
        question_text += "</p>";
        question_text = question_text.replace(
          /!\((https?:\/\/\S+\.\w+)\)/gm,
          "<img src=\"$1\" class=\"img-custom\" alt=\"...\">"
        );
        //question_text.replace("https", "img");
        question["question_text"] = question_text;

        // Transform image
        
        //question["question_text"].replace("!(", "<img src=\"");
        //question["question_text"].replace(")", "\" class=\"img-custom\" alt=\"...\">");

        // Prepare the rest of the question
        question["question_position"] = question_position;
        question["question_time"] = quiz["question_time"];
        question["quiz_id_fk"] = quiz_id;
        question["answers"] = [];
        quiz["questions"].push(question);

        question_position++;
        answer_position = 0;
      }

      // Get a new answer to a question
      if (new_answer == true) {          
        if (answer_is_correct == true) {
          console.log(" * " + token.content + " (" + answer_position + ")");
        } else {
          console.log(" - " + token.content + " (" + answer_position + ")");
        }

        let answer = {};
        answer["answer_text"] = token.content;
        answer["answer_is_correct"] = answer_is_correct;
        answer["answer_position"] = answer_position;
        answer["question_id_fk"] = question_id;
        question["answers"].push(answer);
        answer_position++;
      }
    }

    // Get a piece of code
    if (token.type == "fence") {
      code_language = token.info;
      question["question_text"] += "<pre><code class=\"language-" + token.info + "\">";
      question["question_text"] += token.content;
      question["question_text"] += "</code></pre>";
      new_question = false;
      console.log("[CODE-" + token.info + "]" + token.content + "[CODE]");        
    }    
   
    // End of the question or the answer
    if (token.type == "paragraph_close") {
      if (token.level == 0) {
        if (tokens[i+1].type != "fence") {
          new_question = false;
        }
      }
      if (token.level == 2) {
        new_answer = false;
      }
    }

    // End of titles
    if (token.type == "heading_close") {
      if (token.level == 0) {
        if (token.markup == '-') {
          new_meta = false;
        }          
      }
    }      
  };

  return quiz;
}

/**
 * Add a JSON quiz into a SQLite2 database
 * @param {*} json_quiz 
 */
function json2sql(json_quiz) {
  // Add new quiz
  db.add_new_quiz(
    json_quiz.quiz_title,
    json_quiz.quiz_description,
    (error, quiz_id) => {
      console.log(" + new quiz created (quiz_id=" + quiz_id + ")");
      json_quiz["quiz_id"] = quiz_id;

      // Add new questions for quiz
      json_quiz["questions"].forEach( question => {
        db.add_new_question(
          question.question_position,
          question.question_text,
          question.question_time,
          quiz_id,
          (error, question_id) => {
            console.log(" + new question created (question_id=" + question_id + ")");
            question["question_id"] = question_id;

            // Add new answers for question
            question["answers"].forEach( answer => {
              db.add_new_answer(
                answer.answer_text,
                answer.answer_is_correct,
                answer.answer_position,
                question_id,
                (error, answer_id) => {
                  console.log(" + new answer created (answer_id=" + answer_id + ")");
                  answer["answer_id"] = answer_id;                    
                }
              );
            });
          }
        );
      });
    }
  );
}


//==========================================================================
// Functions usage
//==========================================================================

// Banner
console.log("***********************************");
console.log("*** CuiQuiz administration v0.1 ***");
console.log("***********************************");

// Read command line parameter
var quiz_file = "";
var action = "";
if (process.argv.length < 3) {
  console.log("ERROR : problem with command line action and/or parameter");
  console.log("  + usage   : node ./admin.js [command] [parameter]");
  console.log("  + example : node ./admin.js help");
} else {
  // Isolate action to do
  action = process.argv[2];

  // Help section
  if (action == "help") {
    console.log("Commands :");
    console.log("  + help : print this message");
    console.log("  + quiz_list : list all quizzes into database");
    console.log("  + quiz_import : import [parameter=path_to_file] quiz into database");
    console.log("  + quiz_delete : delete [parameter=quiz_id] quiz");    
  }

  // Quiz section
  else if (action == "quiz_import") {
    if (process.argv.length == 4) {
      // Isolate Markdown quiz file
      quiz_file = process.argv[3];

      // Open and read file content
      fs.readFile(__dirname + "/" + quiz_file, "utf8" , (error, md_quiz) => {

        console.log(" => opening quiz : " + quiz_file);
        if (error) {
          console.error(error)
          return
        }
        console.log(md_quiz);

        // MD -> JSON
        const json_quiz = md2json(md_quiz);
        console.log(json_quiz);

        // JSON -> SQL
        json2sql(json_quiz);        
      });
    } else {
      console.log("ERROR : problem with quiz_import command");
      console.log("  + usage   : node ./admin.js quiz_import [parameter]");
      console.log("  + example : node ./admin.js quiz_import data/test01.md");
    }
  } else if (action == "quiz_list") {
    // Get all quizzes and print on screen
    db.get_all_quizzes( (error, quizzes) => {
      console.log(quizzes);
    });
  } else if (action == "quiz_delete") {
    if (process.argv.length == 4) {
      // Isolate quiz id to delete
      quiz_id = process.argv[3]; 
          
      // Delete quiz
      db.delete_quiz(quiz_id, (error, quiz_id) => {
        console.log(" + quiz deleted !");
      });
      
    } else {
      console.log("ERROR : problem with quiz_delete command");
      console.log("  + usage   : node ./admin.js quiz_delete [parameter]");
      console.log("  + example : node ./admin.js quiz_delete 13");
    }
  }

  // Session section
  else if (action == "session_list") {
    // Get all sessions and print on screen
    db.get_all_sessions( (error, sessions) => {
      console.log(sessions);
    });
  } else if (action == "session_delete") {
    if (process.argv.length == 4) {
      // Isolate session id to delete
      session_id = process.argv[3]; 
          
      // Delete session
      db.delete_session(session_id, (error, session_id) => {
        console.log(" + session deleted !");
      });      
    } else {
      console.log("ERROR : problem with quiz_delete command");
      console.log("  + usage   : node ./admin.js quiz_delete [parameter]");
      console.log("  + example : node ./admin.js quiz_delete 13");
    }
  } else {
      console.log("ERROR : problem with command line action");
      console.log("  + usage   : node ./admin.js [command] [parameter]");
      console.log("  + example : node ./admin.js help");
  }  
}

