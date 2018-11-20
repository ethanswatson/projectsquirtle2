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

        await self.sendToClients(self.channel_name, 'hostnameMessage')

        await self.accept()

    async def receive(self, text_data):
        message = json.loads(text_data)
        msgType = message['msgType']
        
        if  msgType == 'msgNext':
            state = self.session.getSessionState()
            if state == 'question':
                await self.answerResults()
            elif state == 'answerResults':
                await self.results()
            elif state == 'results' or state == 'start':
                await self.nextQuestion()
            
        elif msgType == 'msgUpdate':
            await self.sendQuestionUpdate(message['message'])
            
        elif msgType == 'msgAdd':
            newQuestion = message['message']
            newQuestion = await self.addQuestion(newQuestion)
        
        elif msgType == 'msgEdit':
            await self.sendCurrentQuestionFull()

        elif msgType == 'msgRequestCurrent':
            await self.sendCurrentQuestion()

        elif msgType == 'msgDelete':
            await self.deleteQuestionMessage()
        
        elif msgType == 'msgSkip':
            await self.skipQuestion()

    async def sendCurrentQuestion(self):
        currentQuestion = await self.getCurrentQuestion()
        if currentQuestion != False and currentQuestion != -1:
            self.currentVotes = 0
            question = {
                'questionText': currentQuestion.getQuestionText(),
                'answers': []
            }

            for answer in currentQuestion.getAnswers():
                question['answers'] += [
                    {
                        'id': answer.id,
                        'text': answer.getText()
                    }
                ]

            # Send message to WebSocket
            await self.sendToSelf(question, 'msgQuestion')

            # Send message to client channel group
            await self.sendToClients(question, 'questionMessage')

            await self.setSessionState('question')

    async def sendCurrentQuestionFull(self):
        currentQuestion = await self.getCurrentQuestion()
        if currentQuestion != False and currentQuestion != -1:
            question = {
                'questionText': currentQuestion.getQuestionText(),
                'answers': []
            }

            for answer in currentQuestion.getAnswers():
                question['answers'] += [
                    {
                        'id': answer.id,
                        'text': answer.getText(),
                        'correct': answer.isCorrect(),
                        'points': answer.getPointValue()
                    }
                ]

            # Send message to WebSocket
            await self.sendToSelf(question, 'msgEdit')

            await self.setSessionState('edit')


    async def answerResults(self):
        question = await self.getCurrentQuestion()
        msgType = 'msgAnswerResults'
        message = {
            'questionText': question.getQuestionText(),
            'votes': []

        }
        for answer in question.getAnswers():
            message['votes'] += [
                {
                    'answerText': answer.getText(),
                    'votes': answer.getVotes()
                }
            ]
        # Send message to WebSocket
        await self.sendToSelf(message, msgType)
       
        # Send message to client channel group
        await self.sendToClients(message, msgType)

        await self.setSessionState('answerResults')

    async def results(self):
        users = await self.getResults()
        isEnd = await self.checkForEnd()
        results = {
                'users': [],
                'quizEnd': isEnd
            }

        for user in users:
            results['users'] += [
                {
                    'userID': user.getUserID(),
                    'points': user.getPoints()
                }
            ]

        # Send message to WebSocket
        await self.sendToSelf(results, 'msgResults')
        
        if not isEnd:
            await self.setSessionState('results')
        else:
            await self.setSessionState('end')

        
    async def nextQuestion(self):
        await self.advanceQuestion()
        await self.sendCurrentQuestion()
    
    async def skipQuestion(self):
        await self.skipQuestionDatabase()
        await self.sendCurrentQuestion()

    async def deleteQuestionMessage(self):
        await self.deleteQuestion()
        await self.sendCurrentQuestion()
        
    async def sendQuestionUpdate(self, updatedQuestion):
        await self.updateQuestion(updatedQuestion)
        await self.sendCurrentQuestion()

    async def sendToClients(self, message, msgType):
        await self.channel_layer.group_send(
            self.clientGroupName,
            {
                'type': msgType,
                'message': message
            }
        )

    async def sendToSelf(self, message, msgType):

        await self.send(
            text_data = json.dumps(
            {
                'message': message,
                'msgType': msgType
                }
            )
        )

    async def voteMessage(self, data):
        userID = data['message']['userID']
        answerID = data['message']['answerID']
        self.currentVotes += 1
        self.session.increaseVotes(userID, answerID)
        votes = self.currentVotes

        # Send message to WebSocket
        await self.send(text_data = json.dumps({
            'message': votes,
            'msgType': 'msgVote'
        }))

    async def joinMessage(self, data):
        userName = data['message']['userName']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': {'userName': userName },
            'msgType': 'msgJoin'
        }))

    async def disconnect(self, close_code):
        pass

    @database_sync_to_async
    def getResults(self):
        return self.session.getResults()

    @database_sync_to_async
    def checkForEnd(self):
        return self.session.checkForEnd()

    @database_sync_to_async
    def setHostName(self, name, sessionID):
        self.session = Session.objects.get(_sessionId = sessionID)
        self.session.setHostName(name)
        self.currentVotes = self.session.getVotes()
        self.session.save()
    
    @database_sync_to_async
    def addQuestion(self, newQuestion):
        self.session.addQuestion(newQuestion)

    @database_sync_to_async
    def updateQuestion(self, updatedQuestion):
        self.session.updateQuestion(updatedQuestion)

    @database_sync_to_async
    def advanceQuestion(self):
        self.session.advanceQuestion()

    @database_sync_to_async
    def skipQuestionDatabase(self):
        self.session.skipQuestion()

    @database_sync_to_async
    def getCurrentQuestion(self):
        return self.session.getCurrentQuestion()

    @database_sync_to_async
    def deleteQuestion(self):
        self.session.deleteQuestion()

    @database_sync_to_async
    def setSessionState(self, newState):
        self.session.setSessionState(newState)
        

   

class ClientConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.sessionID = self.scope['url_route']['kwargs']['sessionID']
        self.session = Session.objects.get(_sessionId = self.sessionID)
        self.clientGroupName = 'quiz%s' % self.sessionID

        #Join room group
        await self.channel_layer.group_add(
            self.clientGroupName,
            self.channel_name
        )

        self.score = 0
        self.hostChannel = await self.getHostName(self.sessionID)

        await self.accept()

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
            await self.vote(message)

        if msgType == 'msgJoin':
            await self.join(message)
            

    async def vote(self, message):
        userID = message['userID']
        answerID = message['answerID']
        message = {
            'userID': userID, 
            'answerID': answerID
            }
        await self.sendToHost(message, 'voteMessage')

    async def join(self, message):
        roomName = message['roomName']
        userName = message['userName']
        if self.scope['session'].get('roomName', False) != roomName:
            userExists = self.session.userExists(userName)
            if not userExists:
                self.user = self.session.addUser(userName, self.channel_name)
                self.scope['session']['quiz'] = {'roomName': roomName, 'userName': userName}
                self.scope['session'].save()
                message = {'userName': userName}
                await self.sendToHost(message, 'joinMessage')
                await self.sendToSelf('Accepted', 'msgUserName')
            else:
                await self.sendToSelf('Taken', 'msgUserName')
        else:
            self.user = self.session.getUser(userName)
            self.user.setChannelName(self.channel_name)
            await self.sendToSelf('Accepted', 'msgUserName')

    async def sendToHost(self, message, msgType):
        await self.channel_layer.send(
            self.hostChannel, 
            {
                "type": msgType,
                "message": message
            }
        )

    async def sendToSelf(self, message, msgType):
        await self.send(
            text_data=json.dumps(
                {
                    'message': message,
                    'msgType': msgType
                }
            )
        )

    # Receive questionMessage from group
    async def questionMessage(self, question):
        # Send message to WebSocket
        await self.sendToSelf(question['message'], 'msgQuestion')


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
        await self.sendToSelf(results, 'msgResults')

    # Receive answerMessage from group
    async def msgAnswerResults(self, data):
    
        message = { 
            "answerCorrect": "true",
            "answerPointValue": 10,
            "userTotalScore": 100
        }
        message = json.dumps(message)  

        # Send message to WebSocket
        await self.sendToSelf(message, 'msgAnswerResult')

    async def hostnameMessage(self, data):
        self.hostChannel = data['message']

    @database_sync_to_async
    def getHostName(self, sessionID):
        return Session.objects.get(_sessionId = sessionID).getHostName()