"use strict";

const EventEmitter = require("events");
const fs = require("fs");
const nconf  = require("nconf");
const watch = require("chokidar").watch;

function fileExists (filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

class Config extends EventEmitter {
    constructor(filePath, options, callback) {
        super();
        this.filePath = filePath;
        options = options || {};
        this.defaults = options.defaults;
        this.isSaving = false;
        this.load((err) => {
            if (filePath && options.watch !== false) this.watch();
            if (typeof callback === "function") callback(err, this);
        });
    }

    load(callback) {
        let newConfig = new nconf.Provider();
        try {
            if (this.filePath) {
                // TODO: support multiple conf files. Use: newConfig.file("user", this.filePath);
                if (!fileExists(this.filePath)) {
                    throw new Error("Config file not found");
                }
                newConfig.use("file", { file: this.filePath });
            } else {
                // https://github.com/indexzero/nconf/issues/154
                newConfig.use("memory");
            }
            if (this.defaults) {
                newConfig.use("defaults", { type: "literal", store: this.defaults });
            }
        } catch (err) {
            if (typeof callback === "function") callback(err);
            return;
        }
        this.config = newConfig;
        if (typeof callback === "function") callback();
    }

    get(key) {
        return this.config.get(key);
    }

    set(key, value) {
        return this.config.set(key, value);
    }

    save(callback) {
        if (this.isSaving) return;
        this.isSaving = true;
        this.config.save((err) => {
            this.isSaving = false;
            if (typeof callback === "function") callback(err);
            else if (err) throw Error(err);
        });
    }

    watch() {
        this.watcher = watch(this.filePath);
        this.watcher.on("change", (path, stats) => {
            // Timeout to make sure writing is totally done
            setTimeout(() => {
                if (!this.isSaving) {
                    this.load((err) => this.emit("change", err));
                }
            }, 100);
        });
    }

    unwatch() {
        if (this.watcher) this.watcher.close();
    }
}

module.exports = Config;