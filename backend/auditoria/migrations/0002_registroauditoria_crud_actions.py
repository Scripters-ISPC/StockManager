from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auditoria', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registroauditoria',
            name='tipo',
            field=models.CharField(
                choices=[
                    ('ingreso', 'Ingreso'),
                    ('egreso', 'Egreso'),
                    ('creacion', 'Creación'),
                    ('edicion', 'Edición'),
                    ('eliminacion', 'Eliminación'),
                ],
                max_length=11,
            ),
        ),
    ]
