from . import views

from django.contrib.auth import views as auth_views
from django.urls import path
from django.views.generic import TemplateView

import inspect

urlpatterns = [
    path('', TemplateView.as_view(template_name='home.html')),
    path('login', auth_views.LoginView.as_view(template_name='login.html')),
]

for name, value in inspect.getmembers(views):
    if getattr(value, '__module__', None) != 'garden_mapper.views': continue
    if not inspect.isfunction(value): continue
    if name.startswith('_'): continue
    urlpatterns.append(path(name, value))
