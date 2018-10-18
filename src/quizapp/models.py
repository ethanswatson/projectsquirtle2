from django.db import models
from django.contrib.auth.models import User

class Quiz(models.Model):
    _owner = models.ForeignKey(User, on_delete=models.CASCADE)
    _quizName = models.CharField(max_length=20)
    _quizDescription = models.TextField()

    def getOwner(self):
        return self._owner
    def getQuizName(self):
        return self._quizName
    def getQuizDescription(self):
        return self._quizDescription

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
        answer = Answer(self, text, correct, pointValue)
        answer.save()
    def updateAnswer(self, answerToUpdate, newText=None, newCorrect=None, newPointValue=None):
        # TODO: verify that answerToUpdate belongs to this question
        if newText is None:
            newText = answerToUpdate.getText()
        if newCorrect is None:
            newCorrect = answerToUpdate.isCorrect()
        if newPointValue is None:
            newPointValue = answerToUpdate.getPointValue()

        answerToUpdate.update(_text=newText, _correct=newCorrect, _pointValue=newPointValue)

    def delAnswer(self, answerToDelete):
        # TODO: Verify that answerToDelete belongs to this question
        answerToDelete.delete()



class Answer(models.Model):
    _question = models.ForeignKey(Question, on_delete=models.CASCADE)
    _text = models.CharField(max_length=50)
    _correct = models.BooleanField()
    _pointValue = models.IntegerField()
    _votes = models.IntegerField()

    def getText(self):
        return self._text
    def isCorrect(self):
        return self._correct
    def getPointValue(self):
        return self._pointValue
    def getVotes(self):
        return self._votes

    def setText(self, newText):
        self._text = newText
    def setCorrect(self, correct):
        self._correct = correct
    def setPointValue(self, newPointValue):
        self._pointValue = newPointValue
    def incrementVotes(self):
        self._votes += 1

