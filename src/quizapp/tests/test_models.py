from django.test import TestCase
from ..models import Quiz, Question, Answer
from django.contrib.auth.models import User

class QuizTestCase(TestCase):
    # Tests getQuestions method when there are questions associated with the quiz
    def testGetQuestions():
        # setup
        owner = User(username='test', password='password')
        quiz = Quiz(_owner=owner, _quizName='Test Quiz', _quizDescription='TestDescription')
        question1 = Question(_quiz=quiz, _questionText='Question 1')
        question2 = Question(_quiz=quiz, _questionText='Question 2')

        # act
        questionSet = quiz.getQuestions()

        # assert
        self.assertEqual(questionSet[0], question1.getQuestionText())
        self.assertEqual(questionSet[1], question2.getQuestionText())

    # Tests getQuestions method when there are NO questions associated with the quiz
    def testGetQuestionsEmpty():
        # setup
        owner = User(username='test', password='password')
        quiz = Quiz(_owner=owner, _quizName='Test Quiz', _quizDescription='TestDescription')

        # act
        questionSet = quiz.getQuestions()

        # assert
        # Empty QuerySet should evaluate to false
        self.assertFalse(questionSet)