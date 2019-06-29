from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

import random
import json
import string

class Quiz(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    quizName = models.CharField(max_length=60)
    quizDescription = models.TextField(null=True, default=None)
    dateCreated = models.DateTimeField(auto_now_add=True)

    def getOwner(self):
        return self.owner

    def getQuizName(self):
        return self.quizName

    def getQuizDescription(self):
        return self.quizDescription

    def getDateCreated(self):
        return self.dateCreated

    def getQuestions(self):
        return self.question_set.all()

    def setOwner(self, newOwner):
        self.owner = newOwner

    def setQuizName(self, newName):
        self.quizName = newName

    def setQuizDescription(self, newDescription):
        self.quizDescription = newDescription

    def __str__(self):
        return self.quizName + ' - ' + self.owner.username


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
        question = self._quiz.question_set.create(questionText = newQuestion['questionText'])
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
        return self._questionCounter >= (self._quiz.question_set.count() - 1)
    
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
    _userID = models.TextField(max_length = 15, default = '')
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

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    questionText = models.CharField(max_length=200)
    
    def getQuestionText(self):
        return self.questionText

    def setQuestionText(self, newText):
        self.questionText = newText

    def getAnswers(self):
        return self.answer_set.all()

    def addAnswer(self, text, correct, pointValue):
        answer = Answer(question=self, text=text, _correct=correct, pointValue=pointValue)
        answer.save()
        
    def __str__(self):
        return self.questionText


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.CharField(max_length=50)
    correct = models.BooleanField()
    pointValue = models.IntegerField(default=0)
    votes = models.IntegerField(default=0)
    voters = models.ManyToManyField(AnonymousUser)

    def getQuestion(self):
        return self.question
    def getText(self):
        return self.text
    def isCorrect(self):
        return self.correct
    def getPointValue(self):
        return self.pointValue
    def getVotes(self):
        return self.votes
    def getVoters(self):
        return self.voters.all()

    def setText(self, newText):
        self.text = newText
    def setCorrect(self, correct):
        self.correct = correct
    def setPointValue(self, newPointValue):
        self.pointValue = newPointValue
    def vote(self, user):
        self.votes += 1
        self.save()
    
    def __str__(self):
        return self.text

    def clear(self):
        self.votes = 0
        self.save()
