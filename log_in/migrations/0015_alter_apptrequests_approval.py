# Generated by Django 4.0.1 on 2022-02-17 05:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('log_in', '0014_apptrequests'),
    ]

    operations = [
        migrations.AlterField(
            model_name='apptrequests',
            name='approval',
            field=models.BooleanField(blank=True),
        ),
    ]
