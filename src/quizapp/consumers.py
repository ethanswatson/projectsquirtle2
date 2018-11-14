#This file is very similar to urls. It handels all the websockets messages that are passed to each consumer class. like urls are passed to views, websockets are passed to consumers.

from channels.generic.websocket import AsyncWebsocketConsumer

from django.contrib.auth.models import User
from .models import Quiz
import json

class AccountConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass
        
    async def receive(self, text_data):
        pass

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        #Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):

            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            msg_type = text_data_json['msg_type']

            if msg_type == '0':
                #msg_type = '3'
                
                message = {'questionText': message,
                            'answers':[
                                {'text': 'answer1',
                                'id': 0
                                },
                                {'text': 'answer2',
                                'id': 1
                                },
                                {'text': 'answer3',
                                'id': 2
                                },
                                {'text': 'answer4',
                                'id': 3
                                }
                            ]}
                
                """
                message = {'currentUserScore': 755,
                            'users':[
                                {'username': 'user1',
                                'score': 1450
                                },
                                {'username': 'user2',
                                'score': 1350
                                },
                                {'username': 'user3',
                                'score': 1120
                                },
                                {'username': 'user4',
                                'score': 955
                                }
                            ]}
                """
                message = json.dumps(message)
                

            if msg_type == '2':
                roomName = message['roomName']
                userName = message['userName']
                if self.scope['session'].get('roomName', False) != roomName:
                    self.scope['session']['quiz'] = {'roomName': roomName, 'userName': userName}
                    self.scope['session'].save()
                message = message['userName']


            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'msg_type': msg_type
                }
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        msg_type = event['msg_type']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'msg_type': msg_type
        }))
