# CuiQuiz :: Messages

## 1 - Protocol
### Step 0 : authentication and initialization
```
                     [teacher]    [server]    [student]
        teacher_password_request --->|
       teacher_password_response <---|
```

### Step 1 : choosing progression and quiz to play
```
                      [teacher]   [server]    [student]
       progressions_list_request --->|
      progressions_list_response <---|
                                     |
            quizzes_list_request --->|
           quizzes_list_response <---|
                                     |
       quizzes_selection_request --->| 
      quizzes_selection_response <---|---> quizzes_participation_response
```

### Step 2 : subscribing players
```
                     [teacher]    [server]    [student]
                                     |<--- quizzes_participation_request
						 |---> quizzes_participation_response
                                     |
                                     |<--- players_list_request
                                     |---> players_list_response
                                     |
						 |<--- player_subscribe_request
						 |---> player_subscribe_response
                                     |
          player_remove_request ---> |
                                     |---> player_remove_response		
		                         |				 
```

### Step 3 : quiz and its questions
```
                      [teacher]   [server]    [student]
        question_details_request --->|
       question_details_response <---|---> question_details_response
                                     |
                                     |<--- question_answer_request
						 |---> question_answer_response
            question_end_request --->|
           question_end_response <---|---> question_end_response
                                     |
        quiz_leaderboard_request --->|
       quiz_leaderboard_response <---|
                                     |
 progression_leaderboard_request --->|
progression_leaderboard_response <---|
```


### 2 - Score Formula
For each question :
- bad answer  = 0 
- good answer = (1000 * (question_time - tta))/question_time 
