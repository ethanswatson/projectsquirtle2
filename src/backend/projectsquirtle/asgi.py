import os
import django
from channels.routing import get_default_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE','projectsquirtle.settings')
django.setup()
quizapp = get_default_application()

