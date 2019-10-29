from django.db import models
from django.contrib.auth.models import User

import random
import string

def _gen_token():
    return ''.join(
        random.choice(string.ascii_letters + string.digits)
        for i in range(32)
    )

class Garden(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.TextField()
    token = models.TextField(db_index=True, default=_gen_token)

class Reference(models.Model):
    garden = models.ForeignKey(Garden, on_delete=models.CASCADE)
    name = models.TextField()
    x = models.FloatField()
    y = models.FloatField()

class Context(models.Model):
    garden = models.ForeignKey(Garden, on_delete=models.CASCADE)
    instructions = models.TextField()

class Plant(models.Model):
    garden = models.ForeignKey(Garden, on_delete=models.CASCADE)
    name = models.TextField()

class Observation(models.Model):
    plant = models.ForeignKey(Plant, on_delete=models.CASCADE)
    x = models.FloatField()
    y = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField()
    icon_params = models.TextField()
    gone = models.BooleanField()
