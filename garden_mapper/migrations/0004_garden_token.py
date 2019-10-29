# Generated by Django 2.2.6 on 2019-10-29 05:47

from django.db import migrations, models
import garden_mapper.models

def tokenize(apps, schema_editor):
    Garden = apps.get_model('garden_mapper', 'garden')
    for garden in Garden.objects.all():
        garden.token = garden_mapper.models._gen_token()
        garden.save()

def detokenize(apps, schema_editor): pass

class Migration(migrations.Migration):

    dependencies = [
        ('garden_mapper', '0003_context'),
    ]

    operations = [
        migrations.AddField(
            model_name='garden',
            name='token',
            field=models.TextField(default=garden_mapper.models._gen_token),
        ),
        migrations.RunPython(tokenize, detokenize),
    ]
