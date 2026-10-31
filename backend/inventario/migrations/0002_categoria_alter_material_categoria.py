from django.db import migrations, models
import django.db.models.deletion


def migrate_category_names(apps, schema_editor):
    Categoria = apps.get_model('inventario', 'Categoria')
    Material = apps.get_model('inventario', 'Material')

    for material in Material.objects.exclude(categoria='').iterator():
        categoria, _ = Categoria.objects.get_or_create(
            nombre=material.categoria.strip()
        )
        material.categoria_fk_id = categoria.pk
        material.save(update_fields=['categoria_fk'])


class Migration(migrations.Migration):
    dependencies = [
        ('inventario', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Categoria',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('nombre', models.CharField(max_length=80, unique=True)),
            ],
            options={
                'ordering': ['nombre'],
                'verbose_name': 'categoría',
                'verbose_name_plural': 'categorías',
            },
        ),
        migrations.AddField(
            model_name='material',
            name='categoria_fk',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='materiales',
                to='inventario.categoria',
            ),
        ),
        migrations.RunPython(
            migrate_category_names,
            migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name='material',
            name='categoria',
        ),
        migrations.RenameField(
            model_name='material',
            old_name='categoria_fk',
            new_name='categoria',
        ),
    ]
