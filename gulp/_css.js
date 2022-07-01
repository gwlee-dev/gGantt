import autoprefixer from "autoprefixer";
import sync from "browser-sync";
import cssnano from "cssnano";
import { src, dest } from "gulp";
import postcss from "gulp-postcss";
import purgecss from "gulp-purgecss";
import rename from "gulp-rename";
import gulpSass from "gulp-sass";
import dartSass from "sass";

import { logger } from "./_logger";
import { PATH } from "./_paths";

const sass = gulpSass(dartSass);

const { FILE_NAME } = process.env;

export const compressCss = async () => {
    await src(PATH.css.src)
        .pipe(
            sass({
                includePaths: "node_modules",
                outputStyle: "compressed",
            }).on("error", sass.logError)
        )
        .on("error", (e) => logger.failed("sass", e))
        .pipe(rename(`${FILE_NAME}.css`))
        .pipe(
            purgecss({
                content: ["html/*.html"],
            })
        )
        .on("error", (e) => logger.failed("purgecss", e))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .on("error", (e) => logger.failed("postcss", e))
        .pipe(dest(PATH.css.dest))
        .on("error", (e) => logger.failed("write", e))
        .on("end", () => {
            logger.success("SASS");
        });
};

export const css = async () => {
    await src(PATH.css.src, { sourcemaps: true })
        .pipe(
            sass({
                includePaths: "node_modules",
            })
        )
        .on("error", sass.logError)
        .pipe(rename(`${FILE_NAME}.css`))
        .pipe(dest(PATH.css.dest, { sourcemaps: "." }))
        .on("error", (e) => logger.failed("write", e))
        .on("end", () => {
            logger.success("SASS");
            sync.reload();
        });
};
