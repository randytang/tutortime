# Generated by Django 4.0.1 on 2022-02-08 01:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('log_in', '0007_course_school_offering_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='course_code',
            field=models.CharField(max_length=10),
        ),
        migrations.AddConstraint(
            model_name='course',
            constraint=models.UniqueConstraint(fields=('course_code', 'school_offering'), name='unique_school_course'),
        ),
    ]
