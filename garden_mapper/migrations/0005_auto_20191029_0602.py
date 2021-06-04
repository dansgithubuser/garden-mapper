# Generated by Django 2.2.6 on 2019-10-29 06:02

from django.db import migrations, models
import garden_mapper.models


class Migration(migrations.Migration):

    dependencies = [
        ('garden_mapper', '0004_garden_token'),
    ]

    operations = [
        migrations.AlterField(
            model_name='garden',
            name='token',
            field=models.TextField(db_index=True, default=garden_mapper.models._gen_token),
        ),
    ]