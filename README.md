# CuiQuiz


## 1 - Introduction
Web app quiz game like **Kahoot!** to use in a classroom


## 2 - TODO
### 2.1 - Requirements
Concerning the **teacher** :
- [ ]   As a teacher
		I want to play interactive quizzes
		So that I can reinforce knowledge and evaluate students

- [ ] 	As a teacher
		I want to import users and groups from a csv file
		So that it's easy to create groups of students

- [ ] 	As a teacher
		I want to import quiz in database from a Markdown file
		So that it's easy to use the tool

- [X]	As a teacher
		I want to authenticate
		So that all content is protected

Concerning the **player** :		
- [ ] 	As a player
		I want to participate to a quiz with an autocomplete input
		So that is's easy to subscribe

- [ ]	As a player
		I want to use my smartphone (Android, Apple) and its web browser
		So that I have nothing to install

- [ ]	As a player
		I want to see if I am connected to the server
		So that I know I can play smoothly


### 2.2 - Bugs
- [?] iOS smartphone cannot play
- [X] everybody can access teacher's page
- [X] a player can start a quiz already started


## 3 - Tools/libraries
HTML5/CSS3 template :
- Bootstrap

Javascript client libraries :
- socket.io
- jQuery
- jQuery-ui
- Chart.js
- highlight.js

Javascript server librairies (see package.json) :
- express
- socket.io
- sqlite3

With npm :
```
npm install express@4
npm install socket.io
npm install sqlite3
```


## 4 - Conception
### 4.1 - Socket.io protocol
Message between players, teacher and teh server
```
[teacher]                      [server]        [student]
quizzes_list_request       -->
quizzes_list_response      <--

quizzes_selection_request  --> current_quiz
quizzes_selection_response <--
                                              
players_selection 
```

### 4.2 - Score Formula
For each question :
- bad answer  = 0 
- good answer = (1000 * (question_time - tta))/question_time 


## 5 - Deployment
### 5.1 - Docker
Build and start the docker with the `Dockerfile` and these commands
```
docker build -t cuiquiz-image .
docker run --name cuiquiz-conteneur -p 8085:5000 -d cuiquiz-image
```
