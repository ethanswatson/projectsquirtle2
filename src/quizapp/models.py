from django.db import models
from django.contrib.auth.models import User

class Quiz(models.Model):
    _owner = models.ForeignKey(User, on_delete=models.CASCADE)
    _quizName = models.CharField(max_length=60)
    _quizDescription = models.TextField(null=True, default=None)
    _dateCreated = models.DateTimeField(auto_now_add=True)

    def getOwner(self):
        return self._owner
    def getQuizName(self):
        return self._quizName
    def getQuizDescription(self):
        return self._quizDescription
    def getDateCreated(self):
        return self._dateCreated
    def getQuestions(self):
        return self.question_set.all()

    def setOwner(self, newOwner):
        self._owner = newOwner
    def setQuizName(self, newName):
        self._quizName = newName
    def setQuizDescription(self, newDescription):
        self._quizDescription = newDescription

    def __str__(self):
        return self._quizName + ' - ' + self._owner.username

class Question(models.Model):
    _quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    _questionText = models.CharField(max_length=200)
    
    def getQuestionText(self):
        return self._questionText
    def setQuestionText(self, newText):
        self._questionText = newText
    def getAnswers(self):
        return self.answer_set.all()
    def addAnswer(self, text, correct, pointValue):
        answer = Answer(_question=self, _text=text, _correct=correct, _pointValue=pointValue)
        answer.save()
        
    def __str__(self):
        return self._questionText



class Answer(models.Model):
    _question = models.ForeignKey(Question, on_delete=models.CASCADE)
    _text = models.CharField(max_length=50)
    _correct = models.BooleanField()
    _pointValue = models.IntegerField(default=0)
    _votes = models.IntegerField(default=0)
    _voters = models.ManyToManyField(User)

    def getQuestion(self):
        return self._question
    def getText(self):
        return self._text
    def isCorrect(self):
        return self._correct
    def getPointValue(self):
        return self._pointValue
    def getVotes(self):
        return self._votes
    def getVoters(self):
        return self._voters.all()

    def setText(self, newText):
        self._text = newText
    def setCorrect(self, correct):
        self._correct = correct
    def setPointValue(self, newPointValue):
        self._pointValue = newPointValue
    def vote(self, user):
        self._votes += 1
        self._voters.add(user)
    
    def __str__(self):
        return self._text

