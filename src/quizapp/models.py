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

