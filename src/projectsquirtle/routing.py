from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import quizapp.routing

#This directs all websocket connections to the quizapp routing.py, where it further decides the proper place to route them, very similar to urls directing the apps urls, and from there to a view.

application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
        URLRouter(
            quizapp.routing.websocket_urlpatterns
        )
    ),
})