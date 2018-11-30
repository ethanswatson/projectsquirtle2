from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

import random
import json
import string

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


class Session(models.Model):
    _quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    _owner = models.IntegerField(default = -1)
    _sessionID = models.CharField(max_length=6, default='') 
    _hostChannelName = models.CharField(max_length=255)
    _questionCounter = models.IntegerField(default = -1)
    _currentVotes = models.IntegerField(default = 0)
    _sessionState = models.TextField(max_length= 20, default = 'start')

    def getQuiz(self):
        return self._quiz
	
    def getCurrentQuestion(self):
        numberOfQuestions = self._quiz.question_set.count()
        if self._questionCounter < numberOfQuestions:
            try:
                currentQuestion = self._quiz.question_set.order_by('id')[self._questionCounter]
            except IndexError:
                print("Something Went Wrong, I Couldn't Get That Question.")
                return -1
            return currentQuestion
        else:
            return False

    def updateQuestion(self, updatedQuestion):
        question = self._quiz.question_set.get(id = updatedQuestion['questionID'])
        question.answer_set.all().delete()
        question.setQuestionText(updatedQuestion['questionText'])
        for answer in updatedQuestion['answers']:
            question.addAnswer(answer['answerText'], answer['correct'], int(answer['points']))
        self._currentVotes = 0
        question.save()
        self.save()
    
    def addQuestion(self, newQuestion):
        question = self._quiz.question_set.create(_questionText = newQuestion['questionText'])
        for answer in newQuestion['answers']:
            question.addAnswer(answer['answerText'], answer['correct'], int(answer['points']))
        question.save()

    def deleteQuestion(self):
        question = self._quiz.question_set.order_by('id')[self._questionCounter]
        question.delete()
        numberOfQuestions = self._quiz.question_set.count()
        if self._questionCounter < numberOfQuestions:
            try:
                nextQ = self._quiz.question_set.order_by('id')[self._questionCounter]
            except IndexError:
                print("Something Went Wrong, I Couldn't Get That Question.")
                return -1
            self._currentVotes = 0
            self.save()
            return nextQ
        return False

    def advanceQuestion(self):
        self._questionCounter += 1
        self._currentVotes = 0
        self.save()

    def skipQuestion(self):
        self._questionCounter += 1
        self._currentVotes = 0
        self.save()

    def increaseVotes(self, userID, answerID):
        answer = Answer.objects.get(id = answerID)
        user = self.anonymoususer_set.get(_userID = userID)
        answer.vote(user)
        user.setPoints(answer.getPointValue())
        user.setPreviousCorrect(answer.isCorrect())
        self._currentVotes += 1
        self.save()

    def userExists(self, userID):
        try:
            self.anonymoususer_set.get(_userID=userID)
            return True
        except AnonymousUser.DoesNotExist:
            False

    def addUser(self, userID, channelName):
        user = AnonymousUser.objects.create(_session = self, _userID = userID, _userChannelName = channelName)
        user.save()
        return user

    def clearAnswers(self):
        questions = list(self._quiz.question_set.all())
        for question in questions:
            answers = list(question.answer_set.all())
            for answer in answers:
                answer.clear()
    
    def getUser(self, userID):
        return self.anonymoususer_set.get(_userID = userID)

    def getResults(self):
        return self.anonymoususer_set.order_by('-_points')[:5]

    def checkForEnd(self):
        return self._questionCounter == self._quiz.question_set.count() - 1 or self._questionCounter >= self._quiz.question_set.count()
    
    def getVotes(self):
        return self._currentVotes

    def idGen(self, size=6):
        if self._sessionID is '':
            self._sessionID = ''.join(self.getRandomChar() for _ in range(size))
            self.save()
        return self._sessionID	

    def getRandomChar(self):
        chars = string.ascii_uppercase + string.digits
        return random.choice(chars)

    def getHostName(self):
        return self._hostChannelName

    def setHostName(self, newName):
        self._hostChannelName = newName
        self.save()

    def getSessionID(self):
        return self._sessionID

    def getSessionState(self):
        return self._sessionState

    def setSessionState(self, newState):
        self._sessionState = newState
        self.save()

    def getUsers(self):
        return self.anonymoususer_set.all()

    def getOwner(self):
        return self._owner


class AnonymousUser(models.Model):
    _session = models.ForeignKey(Session, on_delete=models.CASCADE)
    _userID = models.TextField(max_length = 50, default = '')
    _points = models.IntegerField(default = 0)
    _previousPoints = models.IntegerField(default = 0)
    _previousCorrect = models.BooleanField(default = False)
    _userChannelName = models.CharField(max_length=255)

    def getUserID(self):
        return self._userID

    def getPoints(self):
        return self._points
    
    def getPreviousPoints(self):
        return self._previousPoints

    def getPreviousCorrect(self):
        return self._previousCorrect

    def setChannelName(self, newChannelName):
        self._userChannelName = newChannelName
        self.save()

    def setPoints(self, newPoints):
        self._points += newPoints
        self._previousPoints = newPoints
        self.save()

    def setPreviousCorrect(self, correct):
        self._previousCorrect = correct
        self.save()




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
    _voters = models.ManyToManyField(AnonymousUser)

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
        self.save()
    
    def __str__(self):
        return self._text

    def clear(self):
        self._votes = 0
        self.save()


