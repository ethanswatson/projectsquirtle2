from rest_framework import serializers
from .models import Quiz, Question, Answer

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'owner', 'quizName', 'quizDescription', 'dateCreated', 'question_set')
        model = Quiz

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'questionText', 'answer_set')
        model = Question

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('id', 'text', 'correct', 'pointValue')
        model = Answer
