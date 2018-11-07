
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
    path('hostquiz/<room_name>/', views.roomMain, name='roomMain'),
    path('joinquiz/<room_name>/', views.roomJoin, name="roomJoin"),
    path('hostquiz/<sessionId>/question/<int:questionId>/', views.teacherQuestion , name='teacherQuestion'),
]



#path('accounts/', include('django.contrib.auth.urls')), includes everything down below
    #accounts/login/ [name='login']
    #accounts/logout/ [name='logout']
    #accounts/password_change/ [name='password_change']
    #accounts/password_change/done/ [name='password_change_done']
    #accounts/password_reset/ [name='password_reset']
    #accounts/password_reset/done/ [name='password_reset_done']
    #accounts/reset/<uidb64>/<token>/ [name='password_reset_confirm']
    #accounts/reset/done/ [name='password_reset_complete']
