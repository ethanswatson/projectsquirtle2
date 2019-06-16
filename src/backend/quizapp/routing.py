from django.urls import path
from django.conf.urls import url
from . import consumers

#Any websocket connection is routed from here to a specific consumer, very similar to urls are passed to their apropriate views. Blank for now.

websocket_urlpatterns = [
    path('ws/quizapp/host/<sessionID>/', consumers.HostConsumer),
    path('ws/quizapp/client/<sessionID>/', consumers.ClientConsumer),
]


