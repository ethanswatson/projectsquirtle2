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

        await self.channel_layer.group_send(
            self.clientGroupName,
            {
                'type': 'hostnameMessage',
                'message': self.channel_name
            }
        )

        await self.accept()

    @database_sync_to_async
    def setHostName(self, name, sessionID):
        self.session = Session.objects.get(_sessionId = sessionID)
        self.session.setHostName(name)
        self.session.save()

    async def disconnect(self, close_code):
        pass
        
    async def receive(self, text_data):
        message = json.loads(text_data)
        msgType = message['msgType']
        

        if msgType == 'msgQuestion':
            question = message['message']
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
            nextQuestion = await self.getNextQuestion()
            if nextQuestion != False:
                question = {'questionText': nextQuestion.getQuestionText(),
                        'answers': []
                    }

                for answer in nextQuestion.getAnswers():
                    question['answers'] += [{'id': answer.id,
                        'text': answer.getText()}]

                # Send message to WebSocket
                await self.send(text_data = json.dumps({
                    'message': question,
                    'msgType': 'msgNext'
                }))

                await self.channel_layer.group_send(
                    self.clientGroupName,
                    {
                        'type': 'questionMessage',
                        'message': question
                    })

    @database_sync_to_async
    def getNextQuestion(self):
        return self.session.nextQuestion()

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



        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': question['message'],
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

    async def hostnameMessage(self, data):
        self.hostChannel = data['message']