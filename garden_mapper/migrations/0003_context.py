# Generated by Django 2.2 on 2019-09-28 17:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('garden_mapper', '0002_observation_gone'),
    ]

    operations = [
        migrations.CreateModel(
            name='Context',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('instructions', models.TextField()),
                ('garden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='garden_mapper.Garden')),
            ],
        ),
    ]
