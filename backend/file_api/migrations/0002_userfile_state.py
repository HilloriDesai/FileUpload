# Generated by Django 5.2.1 on 2025-05-23 06:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('file_api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userfile',
            name='state',
            field=models.CharField(choices=[('deleted', 'Deleted'), ('restored', 'Restored')], default='restored', help_text='Current state of the file (deleted or restored)', max_length=10),
        ),
    ]
