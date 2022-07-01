import sync from "browser-sync";
import { watch } from "gulp";
import { log } from "gulp-util";
import { assets } from "./_assets";
import { css } from "./_css";
import { js } from "./_js";
const { SRC } = process.env;

export const watcher = () => {
    log("👀 Start watching...");
    watch(`${SRC}/**/*.scss`).on("change", (e) => {
        css();
        log(`\n\n🔄 Source Changed: ${e}`);
    });
    watch(`${SRC}/**/*.js`).on("change", (e) => {
        js();
        log(`\n\n🔄 Source Changed: ${e}`);
    });
    watch(`${SRC}/assets/**/*`).on("change", (e) => {
        assets();
        log(`\n\n🔄 Source Changed: ${e}`);
    });
    watch(`${SRC}/**/*.pug`).on("change", (e) => {
        sync.reload();
        log(`\n\n🔄 Source Changed: ${e}`);
    });
};
