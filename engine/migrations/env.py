from alembic import context
from sqlalchemy import create_engine, pool
from nv_engine.storage.snapshots import metadata

config = context.config

if context.is_offline_mode():
    context.configure(url=config.get_main_option('sqlalchemy.url'), target_metadata=metadata,
                      literal_binds=True, dialect_opts={'paramstyle': 'named'})
    with context.begin_transaction():
        context.run_migrations()
else:
    provided = config.attributes.get('connection')
    if provided is not None:
        context.configure(connection=provided, target_metadata=metadata)
        with context.begin_transaction():
            context.run_migrations()
    else:
        engine = create_engine(config.get_main_option('sqlalchemy.url'), poolclass=pool.NullPool)
        with engine.connect() as connection:
            context.configure(connection=connection, target_metadata=metadata)
            with context.begin_transaction():
                context.run_migrations()
        engine.dispose()
