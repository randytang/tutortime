# Generated by Django 4.0.1 on 2022-01-27 04:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('log_in', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='rate',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
    ]