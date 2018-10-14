#This file is very similar to urls. It handels all the websockets messages that are passed to each consumer class. like urls are passed to views, websockets are passed to consumers.

from channels.generic.websocket import AsyncWebsocketConsumer

from django.contrib.auth.models import User
from .models import Quiz

class AccountConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass
        
    async def receive(self, text_data):
        pass