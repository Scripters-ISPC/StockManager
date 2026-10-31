from django.db import migrations, models
import django.db.models.deletion


def migrate_provider_names(apps, schema_editor):
    Proveedor = apps.get_model('inventario', 'Proveedor')
    Material = apps.get_model('inventario', 'Material')

    for material in Material.objects.exclude(proveedor='').iterator():
        proveedor, _ = Proveedor.objects.get_or_create(
            nombre=material.proveedor.strip()
        )
        material.proveedor_fk_id = proveedor.pk
        material.save(update_fields=['proveedor_fk'])


class Migration(migrations.Migration):
    dependencies = [
        ('inventario', '0002_categoria_alter_material_categoria'),
    ]

    operations = [
        migrations.CreateModel(
            name='Proveedor',
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
                ('nombre', models.CharField(max_length=120, unique=True)),
                ('contacto', models.CharField(blank=True, default='', max_length=150)),
                ('activo', models.BooleanField(default=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
            ],
            options={'ordering': ['nombre']},
        ),
        migrations.AddField(
            model_name='material',
            name='proveedor_fk',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='materiales',
                to='inventario.proveedor',
            ),
        ),
        migrations.RunPython(
            migrate_provider_names,
            migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name='material',
            name='proveedor',
        ),
        migrations.RenameField(
            model_name='material',
            old_name='proveedor_fk',
            new_name='proveedor',
        ),
    ]
