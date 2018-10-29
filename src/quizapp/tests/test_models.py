from django.test import TestCase
from ..models import Quiz, Question, Answer
from django.contrib.auth.models import User

class QuizTestCase(TestCase):
    # Tests getQuestions method when there are questions associated with the quiz
    def testGetQuestions(self):
        # setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(_owner=owner, _quizName='Test Quiz', _quizDescription='TestDescription')
        question1 = Question.objects.create(_quiz=quiz, _questionText='Question 1')
        question2 = Question.objects.create(_quiz=quiz, _questionText='Question 2')

        # act
        questionSet = quiz.getQuestions()

        # assert
        self.assertEqual(questionSet[0], question1)
        self.assertEqual(questionSet[1], question2)

    # Tests getQuestions method when there are NO questions associated with the quiz
    def testGetQuestionsEmpty(self):
        # setup
        owner = User(username='test', password='password')
        quiz = Quiz(_owner=owner, _quizName='Test Quiz', _quizDescription='TestDescription')

        # act
        questionSet = quiz.getQuestions()

        # assert
        # Empty QuerySet should evaluate to false
        self.assertFalse(questionSet)

class QuestionTestCase(TestCase):
    def testGetAnswers(self):
        #setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(_owner=owner, _quizName='Test Quiz', _quizDescription='TestDescription')
        question = Question.objects.create(_quiz=quiz, _questionText='Question Text')
        answer1 = Answer.objects.create(_question=question, _text="Answer 1", _correct=True, _pointValue=10)
        answer2 = Answer.objects.create(_question=question, _text="Answer 2", _correct=True, _pointValue=10)

        #act
        answerSet = question.getAnswers()

        #assert
        self.assertEqual(answerSet[0], answer1)
        self.assertEqual(answerSet[1], answer2)

    def testAddAnswer(self):
        # setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(_owner=owner, _quizName='Test Quiz', _quizDescription='TestDescription')
        question = Question.objects.create(_quiz=quiz, _questionText='Question Text')

        # act
        question.addAnswer(text='Hello', correct=False, pointValue=10)
        answerSet = question.getAnswers()

        # assert
        self.assertEqual(answerSet[0].getText(), 'Hello')
        self.assertFalse(answerSet[0].isCorrect())
        self.assertEqual(answerSet[0].getPointValue(), 10)

class AnswerTestCase(TestCase):
    def testVoting(self):
        # setup
        user = User.objects.create(username='Voter', password='password')

        # act

        # assert

