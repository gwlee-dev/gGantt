import sync from "browser-sync";
import browserify from "browserify";
import { dest } from "gulp";
import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import { log } from "gulp-util";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

import { logger } from "./_logger";
import { PATH } from "./_paths";

const { FILE_NAME } = process.env;

export const compressJs = async () => {
    await browserify(`${PATH.js.src}/app.js`)
        .transform("babelify")
        .on("error", (e) => logger.failed("babelify", e))
        .bundle()
        .on("error", (e) => {
            log(`${e}`);
            logger.failed("", "browserify");
        })
        .pipe(source(`${FILE_NAME}.js`))
        .pipe(buffer())
        .pipe(terser())
        .on("error", (e) => logger.failed("terser", e))
        .pipe(dest(PATH.js.dest))
        .on("end", () => {
            logger.success("JS");
        });
};

export const js = async () => {
    await browserify(`${PATH.js.src}/app.js`, { debug: true })
        .transform("babelify")
        .on("error", (e) => logger.failed("babelify", e))
        .bundle()
        .on("error", (e) => {
            log(`${e}`);
            logger.failed("", "browserify");
        })
        .pipe(source(`${FILE_NAME}.js`))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write("."))
        .pipe(dest(PATH.js.dest))
        .on("end", () => {
            logger.success("JS");
            sync.reload();
        });
};
