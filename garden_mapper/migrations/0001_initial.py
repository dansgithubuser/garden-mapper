# Generated by Django 2.2 on 2019-08-15 20:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Garden',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Reference',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('x', models.FloatField()),
                ('y', models.FloatField()),
                ('garden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='garden_mapper.Garden')),
            ],
        ),
        migrations.CreateModel(
            name='Plant',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('garden', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='garden_mapper.Garden')),
            ],
        ),
        migrations.CreateModel(
            name='Observation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x', models.FloatField()),
                ('y', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField()),
                ('icon_params', models.TextField()),
                ('plant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='garden_mapper.Plant')),
            ],
        ),
    ]
