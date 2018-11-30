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

        await self.sendToClients(self.channel_name, 'hostnameMessage')

        await self.getPage()

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
            await self.updateQuestion(message['message'])
            await self.sendCurrentQuestion()
            
        elif msgType == 'msgAdd':
            await self.addQuestion(message['message'])
            await self.getPage()
        
        elif msgType == 'msgEdit':
            await self.sendCurrentQuestionFull()

        elif msgType == 'msgRequestCurrent':
            await self.sendCurrentQuestion()

        elif msgType == 'msgDelete':
            await self.deleteQuestionMessage()
        
        elif msgType == 'msgSkip':
            await self.skipQuestion()

    async def sendCurrentQuestion(self):
        question = await self.getCurrentQuestion()
        
        if question != False:

            # Send message to WebSocket
            await self.sendToSelf(question, 'msgQuestion')

            # Send message to client channel group
            await self.sendToClients(question, 'msgQuestion')

            await self.setSessionState('question')

    async def sendCurrentQuestionFull(self):
        question = await self.getCurrentQuestionFull()

        if question != False:
       
            # Send message to WebSocket
            await self.sendToSelf(question, 'msgEdit')


    async def answerResults(self):
        message = await self.getAnswerResults()
        msgType = 'msgAnswerResults'

        # Send message to WebSocket
        await self.sendToSelf(message, msgType)
       
        # Send message to client channel group
        await self.sendToClients('', msgType)

        await self.setSessionState('answerResults')

    async def results(self):
        results = await self.getResults()
        isEnd =  await self.checkForEnd()
        results['quizEnd'] = isEnd
        

        # Send message to WebSocket
        await self.sendToSelf(results, 'msgResults')

        await self.sendToClients(results, 'msgResults')
        
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
        state = self.session.getSessionState()
        if state == 'start':
            userName = data['message']['userName']
            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': {'userName': userName },
                'msgType': 'msgJoin'
            }))

    async def getPage(self):
        state = self.session.getSessionState()
        if state == 'start':
            users = await self.getUsers()
            message = []
            for user in users:
                message += [user.getUserID()]
            self.sendToSelf(message, 'msgStart')
        elif state == 'question':
            currentQuestion = await self.getCurrentQuestion()
            if currentQuestion != False:
                await self.sendToSelf(currentQuestion, 'msgQuestion')
        elif state == 'results' or state == 'end':
            results = await self.getResults()
            await self.sendToSelf(results, 'msgResults')
        elif state == 'answerResults':
            message = await self.getAnswerResults()
            await self.sendToSelf(message, 'msgAnswerResults')


    async def requestCurrentPage(self, message):
        clientName = message['message']
        state = self.session.getSessionState()
        if state == 'start':
            await self.sendToClient(clientName, '', 'msgStart')

        elif state == 'question':
            currentQuestion = await self.getCurrentQuestion()
            if currentQuestion != False:
                # Send message to client channel group
                await self.sendToClient(clientName, currentQuestion, 'msgQuestion')

        elif state == 'results' or state == 'end':
            results = await self.getResults()
            await self.sendToClient(clientName, results, 'msgResults')

        elif state == 'answerResults':
            await self.sendToClient(clientName, '', 'msgAnswerResults')


    async def sendToClient(self, channelName, message, msgType):
        await self.channel_layer.send(
            channelName, 
            {
                "type": msgType,
                "message": message
            }
        )


    async def disconnect(self, close_code):
        if self.getSessionState() == 'end':
            await self.clearSession()

    async def getAnswerResults(self):
        question = await self.getQuestionObject()
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
        return message

    @database_sync_to_async
    def getResults(self):
        users =  self.session.getResults()
        
        results = {
                'users': []
            }

        for user in users:
            results['users'] += [
                {
                    'userID': user.getUserID(),
                    'points': user.getPoints()
                }
            ]
        return results

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
    def getQuestionObject(self):
        return self.session.getCurrentQuestion()

    @database_sync_to_async
    def getCurrentQuestion(self):
        currentQuestion =  self.session.getCurrentQuestion()
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
            return question
        return False

    @database_sync_to_async
    def getCurrentQuestionFull(self):
        currentQuestion =  self.session.getCurrentQuestion()
        if currentQuestion != False and currentQuestion != -1:
            self.currentVotes = 0
            question = {
                'questionText': currentQuestion.getQuestionText(),
                'questionID': currentQuestion.id,
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
            return question
        return False
            

    @database_sync_to_async
    def deleteQuestion(self):
        self.session.deleteQuestion()

    @database_sync_to_async
    def setSessionState(self, newState):
        self.session.setSessionState(newState)

    @database_sync_to_async
    def getSessionState(self):
        return self.session.getSessionState()

    @database_sync_to_async
    def getUsers(self):
        return self.session.getUsers()
        
    def clearSession(self):
        self.session.clearAnswers()
        self.session.delete()
        

   

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

        if self.scope['session'].get('quiz', False) != False:
            if self.scope['session']['quiz']['roomName'] == self.sessionID:
                self.userName = self.scope['session']['quiz'].get('userName')
                self.user = self.session.getUser(self.userName)
                self.user.setChannelName(self.channel_name)
                await self.sendToSelf({'accepted': True, 'userName': self.userName}, 'msgUserName')
                await self.requestCurrentPage()
            else:
                await self.sendToSelf('', 'msgRequestUserName')
        else:
            await self.sendToSelf('', 'msgRequestUserName')
            

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
        userExists = self.session.userExists(userName)
        if not userExists:
            self.userName = userName
            self.session.addUser(userName, self.channel_name)
            self.scope['session']['quiz'] = {'roomName': roomName, 'userName': userName}
            self.scope['session'].save()
            message = {'userName': userName}
            await self.sendToHost(message, 'joinMessage')
            await self.sendToSelf({'accepted': True, 'userName': userName}, 'msgUserName')
            await self.requestCurrentPage()
        else:
            await self.sendToSelf({'accepted': False}, 'msgUserName')

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
    async def msgQuestion(self, question):
        # Send message to WebSocket
        await self.sendToSelf(question['message'], 'msgQuestion')


    async def requestCurrentPage(self):
        await self.sendToHost(self.channel_name, 'requestCurrentPage')

    async def msgStart(self, message):
        await self.sendToSelf('', 'msgStart')

    # Receive fianlResultsMessage from group
    async def msgResults(self, data):
        results = data['message']
        results['currentUserScore'] = self.session.getUser(self.userName).getPoints()
        results = json.dumps(results)    
        

        # Send message to WebSocket
        await self.sendToSelf(results, 'msgResults')

    # Receive answerMessage from group
    async def msgAnswerResults(self, data):
        user = self.session.getUser(self.userName)
    
        message = { 
            "answerCorrect": user.getPreviousCorrect(),
            "answerPointValue": user.getPreviousPoints(),
            "userTotalScore": user.getPoints()
        }
        message = json.dumps(message)  

        # Send message to WebSocket
        await self.sendToSelf(message, 'msgAnswerResult')

    async def hostnameMessage(self, data):
        self.hostChannel = data['message']

    @database_sync_to_async
    def getHostName(self, sessionID):
        return Session.objects.get(_sessionId = sessionID).getHostName()

    @database_sync_to_async
    def getSessionState(self):
        return self.session.getSessionState()