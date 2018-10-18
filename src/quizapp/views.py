from django.urls import reverse
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout

from .forms import CreateQuizForm
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
def createQuiz(request):
    user = request.user
    if request.method == 'POST':
        form = CreateQuizForm(request.POST)
        if form.is_valid():
            quizName = form.cleaned_data.get('quizName')
            quizDes = form.cleaned_data.get('quizDescription')
            user.quiz_set.create(_quizName = quizName, _quizDescription = quizDes)
            return redirect(reverse('quizapp:profile'))
    else:
        form = CreateQuizForm()
    username = user.username
    return render(request, 'quizapp/createquiz.html', {'username': username, 'form': form})

@login_required
def editQuiz(request, quizID):
    user = request.user
    quiz = user.quiz_set.get(id = quizID)
    #questions = quiz.question_set.all()
    if request.method == 'POST':
        if request.POST['quizName'] and request.POST['quizDescription']:
            quizDescription = request.POST['quizDescription']
            quizName = request.POST['quizName']
            if not quizDescription.isspace() and not quizName.isspace():
                quiz.setQuizName(quizName)
                quiz.setQuizDescription(quizDescription)
        #if request.POST['questionText']:
        #    questionText = request.POST['questionText']
        #    if not questionText.isspace():
        #        quiz.question_set.create(_questionText = questionText)
    #return render(request, 'quizapp/editquiz.html', {'username': user.username, 'quiz':quiz, {'questions': questions}})
    return render(request, 'quizapp/editquiz.html', {'username': user.username, 'quiz':quiz})

@login_required
def deleteQuiz(request):
    if request.method == 'POST':
        quizID = int(request.POST.get('quizID'))
        quiz = request.user.quiz_set.get(id = quizID)
        quiz.delete()
    return redirect(reverse('quizapp:profile'))