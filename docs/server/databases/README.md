# Databases

Databases are specified with the `collection.database`
[configuration property](../configuration/configuration.md#properties).

```yml
collections:
  example_collection:
    database: mongodb
```

This means multiple databases can be mixed on the same API, and collections can
either share the same databases or use different ones.

# Options

Databases options are specified with the `databases`
[configuration property](../configuration/configuration.md#properties).

```yml
databases:
  memory:
    save: false
```

specifies that the `memory` database should disable the `save` option.

# Available databases

The available databases are:
  - [`memory`](memorydb.md): an in-memory database, for development purpose.
  - [`mongodb`](mongodb.md)

The default database is `memory`. To change it, use a
[`default` collection](../properties/collections.md#default-collection).