from django.views.generic import RedirectView
from django.urls import path, include
from django.conf.urls import url

from . import views

app_name = 'quizapp'

urlpatterns = [
    path('', views.index, name='index'),
    path('joinquiz/', views.joinQuiz, name='joinQuiz'),
    path('createaccount/', views.createAccount, name='createAccount'),
    path('accounts/profile/', views.profile, name='profile'),
    path('accounts/createQuiz/', views.createQuiz, name='createQuiz'),
    path('accounts/deleteQuiz/', views.deleteQuiz, name='deleteQuiz'),
    path('accounts/deleteQuestion/', views.deleteQuestion, name='deleteQuestion'),
    path('accounts/deleteAnswer/', views.deleteAnswer, name='deleteAnswer'),
    path('accounts/editQuiz/quiz-<int:quizID>/', views.editQuiz, name = 'editQuiz'),
    path('accounts/editQuestion/quiz-<int:quizID>/question-<int:questionID>/', views.editQuestion, name = 'editQuestion'),
    path('accounts/editAnswer/quiz-<int:quizID>/question-<int:questionID>/answer-<int:answerID>/', views.editAnswer, name = 'editAnswer'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('startquiz/quiz-<int:quizID>/', views.startQuiz, name='startQuiz'),
    path('testquiz/<room_name>/', views.roomTest, name='roomTest'),
    path('joinquiz/<room_name>/', views.roomJoin, name="roomJoin"),
    path('favicon.ico', RedirectView.as_view(url='/static/quizapp/images/favicon.png')),
    path('hostquiz/<room_name>/', views.teacherView , name='roomMain'),
]