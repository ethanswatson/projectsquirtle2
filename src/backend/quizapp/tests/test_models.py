from django.test import TestCase
from ..models import Quiz, Question, Answer, Session
from django.contrib.auth.models import User
import random

class QuizTestCase(TestCase):
    # Tests getQuestions method when there are questions associated with the quiz
    def testGetQuestions(self):
        # setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(owner=owner, quizName='Test Quiz', quizDescription='TestDescription')
        question1 = Question.objects.create(quiz=quiz, questionText='Question 1')
        question2 = Question.objects.create(quiz=quiz, questionText='Question 2')

        # act
        questionSet = quiz.getQuestions()

        # assert
        self.assertEqual(questionSet[0], question1)
        self.assertEqual(questionSet[1], question2)

    # Tests getQuestions method when there are NO questions associated with the quiz
    def testGetQuestionsEmpty(self):
        # setup
        owner = User(username='test', password='password')
        quiz = Quiz(owner=owner, quizName='Test Quiz', quizDescription='TestDescription')

        # act
        questionSet = quiz.getQuestions()

        # assert
        # Empty QuerySet should evaluate to false
        self.assertFalse(questionSet)

class QuestionTestCase(TestCase):
    def testGetAnswers(self):
        #setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(owner=owner, quizName='Test Quiz', quizDescription='TestDescription')
        question = Question.objects.create(_quiz=quiz, questionText='Question Text')
        answer1 = Answer.objects.create(question=question, text="Answer 1", correct=True, pointValue=10)
        answer2 = Answer.objects.create(question=question, text="Answer 2", correct=True, pointValue=10)

        #act
        answerSet = question.getAnswers()

        #assert
        self.assertEqual(answerSet[0], answer1)
        self.assertEqual(answerSet[1], answer2)

    def testAddAnswer(self):
        # setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(owner=owner, quizName='Test Quiz', quizDescription='TestDescription')
        question = Question.objects.create(quiz=quiz, questionText='Question Text')

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
        owner = User.objects.create(username='Owner', password='password')
        voter = User.objects.create(username='Voter', password="password")
        quiz = Quiz.objects.create(owner=owner, quizName='Test Quiz', quizDescription='TestDescription')
        question = Question.objects.create(quiz=quiz, questionText='Question Text')
        answer = Answer.objects.create(question=question, text='Answer', correct=True, pointValue=10)

        # act
        answer.vote(voter)
        voteCount = answer.getVotes()
        voterSet = answer.getVoters()

        # assert
        self.assertEqual(voteCount, 1)
        self.assertEqual(voterSet[0], voter)

class SessionTestCase(TestCase):
    def testIdGen(self):
        # setup
        owner = User.objects.create(username='test', password='password')
        quiz = Quiz.objects.create(owner=owner, quizName='Test Quiz', quizDescription='TestDescription')
        question = Question.objects.create(quiz=quiz, questionText='Question Text')
        answer1 = Answer.objects.create(question=question, text="Answer 1", correct=True, pointValue=10)
        session = Session.objects.create(quiz=quiz)
        def mockGetRandomChar(self):
            return 'A'
        Session.getRandomChar = mockGetRandomChar

        # act
        idVal = session.idGen()

        # assert
        print(idVal)
        self.assertEqual(idVal, "AAAAAA")

