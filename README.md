# config-watch

> Simple configuration manager for node

Read and save a config from a JSON file and trigger an event when the file changes.

## Installation

`$ npm install --save config-watch`

## Usage

Create a new config with `new Config(pathToJSON, options, callback)`:

```javascript
const Config = require("config-watch");

let config = new Config("config.json", {
    defaults: {
        foo: "bar",
        colors: {
            tree: "green",
            sky: "blue"
        }
    }
});
```

`callback(err, config)` is run once config is ready.

Get values:

```javascript
let foo = config.get("foo");
let treeColor = config.get("colors:tree");
```

Set values:

```javascript
config.set("foo", "BAZ");
config.set("colors:snow", "white");
```

Watch for changes in config file:

```javascript
config.on("change", (err) => {
    if (err) console.error(err);
    else console.log("Config changed. The new config is:\n", config.get());
});
```

## Options

### `defaults`

A JSON object which contains the default config.

### `watch`

Set this to `false` to disable watching the JSON file.

## License

The MIT License (MIT) - Copyright (c) 2016 Thomas Brouard