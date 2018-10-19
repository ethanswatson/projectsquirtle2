from django.urls import reverse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout

from .forms import CreateQuizForm, CreateAnswerForm
from .models import Quiz    
# Create your views here.

def index(request):
    return render(request, 'quizapp/index.html')


#Login View is handled by django, as well as logout, and password vies. you do need to create the html templates for each, but it handles the rest. Django authentication is described here https://docs.djangoproject.com/en/2.1/topics/auth/default/

#login_required tells django to look for user authentication in the request, if not it redirects you to the login page.
@login_required
def profile(request):
    user = request.user
    username = user.username
    quizzes = user.quiz_set.all()
    return render(request, 'quizapp/profile.html', {'username': username, 'quizzes': quizzes})

def createAccount(request):
    if request.method == 'GET':
            form = UserCreationForm()

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect(reverse('quizapp:profile'))
    
    return render(request, 'quizapp/createaccount.html', {'form': form})



@login_required
def deleteQuiz(request):
    if request.method == 'POST':
        quizID = int(request.POST['quizID'])
        quiz = request.user.quiz_set.get(id = quizID)
        quiz.delete()
    return redirect(reverse('quizapp:profile'))

@login_required
def deleteQuestion(request):
    if request.method == 'POST':
        questionID = int(request.POST.get('questionID'))
        quizID = int(request.POST.get('quizID'))
        quiz = request.user.quiz_set.get(id = quizID)
        question = quiz.question_set.get(id = questionID)
        question.delete()
    return redirect(reverse('quizapp:editQuiz', kwargs={'quizID':quiz.id}))

@login_required
def deleteAnswer(request):
    if request.method == 'POST':
        questionID = int(request.POST.get('questionID'))
        quizID = int(request.POST.get('quizID'))
        answerID = int(request.POST.get('answerID'))
        quiz = request.user.quiz_set.get(id = quizID)
        question = quiz.question_set.get(id = questionID)
        answer = question.answer_set.get(id = answerID)
        answer.delete()
    return redirect(reverse('quizapp:editQuestion', kwargs={'quizID':quiz.id, 'questionID': questionID}))

@login_required
def createQuiz(request):
    user = request.user
    if request.method == 'POST':
        form = CreateQuizForm(request.POST)
        if form.is_valid():
            quizName = form.cleaned_data.get('quizName')
            quizDes = form.cleaned_data.get('quizDescription')
            quiz = Quiz(_owner = user, _quizName = quizName, _quizDescription = quizDes)
            quiz.save()
            return redirect(reverse('quizapp:editQuiz', kwargs={'quizID':quiz.id}))
    else:
        form = CreateQuizForm()
    username = user.username
    return render(request, 'quizapp/createquiz.html', {'username': username, 'form': form})


@login_required
def editQuiz(request, quizID):
    user = request.user
    quiz = user.quiz_set.get(id = quizID)
    
    if request.method == 'POST':
        if 'quizButton' in request.POST:
            form = CreateQuizForm(request.POST)
            if form.is_valid():
                quiz.setQuizName(form.cleaned_data.get('quizName'))
                quiz.setQuizDescription(form.cleaned_data.get('quizDescription'))
                quiz.save()
    
        elif 'questionButton' in request.POST:
            if request.POST.get('questionText', False):
                questionText = request.POST['questionText']
                if not questionText.isspace():
                    quiz.question_set.create(_questionText = questionText)

        return redirect(reverse('quizapp:editQuiz', kwargs={'quizID':quiz.id}))
    else:
        form = CreateQuizForm(initial = {'quizName': quiz.getQuizName(), 'quizDescription': quiz.getQuizDescription()})

    questions = quiz.question_set.all()
    return render(request, 'quizapp/editquiz.html', {'username': user.username, 'quiz':quiz, 'questions': questions, 'form': form})

@login_required
def editQuestion(request, quizID, questionID):
    user = request.user
    quiz = user.quiz_set.get(id = quizID)
    question = quiz.question_set.get(id = questionID)
    
    if request.method == 'POST':
        if 'answerButton' in request.POST:
            form = CreateAnswerForm(request.POST)
            if form.is_valid():
                answerText = form.cleaned_data.get('answerText')
                correct = form.cleaned_data.get('correct')
                points = form.cleaned_data.get('pointValue', 0)
                question.answer_set.create(_text = answerText, _correct = correct, _pointValue = points)
        elif 'questionButton' in request.POST:
            if request.POST.get('questionText', False):
                questionText = request.POST['questionText']
                if not questionText.isspace():
                    question.setQuestionText(questionText)
                    question.save()
                    
        return redirect(reverse('quizapp:editQuestion', kwargs={'quizID':quiz.id, 'questionID': questionID}))
    else:
        form = CreateAnswerForm()

    answers = question.answer_set.all()
    return render(request, 'quizapp/editquestion.html', {'username': user.username,'quizID':quiz.id, 'question': question, 'answers': answers, 'form': form})