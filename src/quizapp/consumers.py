#This file is very similar to urls. It handels all the websockets messages that are passed to each consumer class. like urls are passed to views, websockets are passed to consumers.

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Quiz, Session
import json

class HostConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.sessionID = self.scope['url_route']['kwargs']['sessionID']
        await self.setHostName(self.channel_name, self.sessionID)
        self.clientGroupName = 'quiz%s' % self.sessionID
        await self.accept()

    @database_sync_to_async
    def setHostName(self, name, sessionID):
        session = Session.objects.get(_sessionId = sessionID)
        session.setHostName(name)
        session.save()

    async def disconnect(self, close_code):
        pass
        
    async def receive(self, text_data):
        message = json.loads(text_data)
        msgType = message['msgType']
        question = message['message']

        if msgType == 'msgQuestion':
            await self.channel_layer.group_send(
            self.clientGroupName,
            {
                'type': 'questionMessage',
                #'type': 'finalResultsMessage',
                #'type': 'answerMessage',
                'message': question
            }
        )
        
        if msgType == 'msgNext':
            pass

    async def voteMessage(self, data):
        userID = data['message']['userID']
        answerID = data['message']['answerID']

        # Send message to WebSocket
        await self.send(text_data = json.dumps({
            'message': {
                'userID': userID,
                'answerID': answerID
            },
            'msgType': 'msgVote'
        }))

    async def joinMessage(self, data):
        userName = data['message']['userName']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': {'userName': userName },
            'msgType': 'msgJoin'
        }))








class ClientConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sessionID = self.scope['url_route']['kwargs']['sessionID']
        self.clientGroupName = 'quiz%s' % self.sessionID

        #Join room group
        await self.channel_layer.group_add(
            self.clientGroupName,
            self.channel_name
        )

        self.score = 0
        self.hostChannel = await self.getHostName(self.sessionID)

        await self.accept()

    @database_sync_to_async
    def getHostName(self, sessionID):
        return Session.objects.get(_sessionId = sessionID).getHostName()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.clientGroupName,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):

        data = json.loads(text_data)
        message = data['message']
        message = json.loads(message)
        msgType = data['msgType']

        if msgType == 'msgVote':
            userID = message['userID']
            answerID = message['answerID']
               
            await self.channel_layer.send(self.hostChannel, {
                "type": "voteMessage",
                "message": {
                    'userID': userID,
                    'answerID': answerID
                    },
            })

        if msgType == 'msgJoin':
            roomName = message['roomName']
            userName = message['userName']
            if self.scope['session'].get('roomName', False) != roomName:
                self.scope['session']['quiz'] = {'roomName': roomName, 'userName': userName}
                self.scope['session'].save()
            
            await self.channel_layer.send(self.hostChannel, {
                "type": "joinMessage",
                "message": {
                    'userName': userName,
                    },
            })


    # Receive questionMessage from group
    async def questionMessage(self, question):

        message = {'questionText': question['message'],
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
                
        #answers = question.getAnswers();
        #message = { 'questionText': question.getQuestionText(),
        #            'answers': []}
        #for answer in answers:
        #    message['answer'] += [answer.getText()]

        message = json.dumps(message)

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'msgType': 'msgQuestion'
        }))

    # Receive fianlResultsMessage from group
    async def finalResultsMessage(self, data):
       
        results = {'currentUserScore': 755,
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
        results = json.dumps(results)   
        
        #results = json.loads(data)
        #currentUserScore = self.score
        #results['currentUserScore'] = currentUserScore

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': results,
            'msgType': 'msgResults'
        }))

    # Receive answerMessage from group
    async def answerMessage(self, data):
    
        message = { 
            "answerCorrect": "true",
            "answerPointValue": 10,
            "userTotalScore": 100
        }
        message = json.dumps(message)  

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'msgType': 'msgAnswerResult'
        }))  