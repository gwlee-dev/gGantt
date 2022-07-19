import autoprefixer from "autoprefixer";
import sync from "browser-sync";
import cssnano from "cssnano";
import { src, dest } from "gulp";
import postcss from "gulp-postcss";
import rename from "gulp-rename";
import { logger } from "./_logger";
import { PATH } from "./_paths";
import { sass } from "./sass";

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
        });

    await src(`${PATH.assets.src}/bsLib.scss`)
        .pipe(
            sass({
                includePaths: "node_modules",
                outputStyle: "compressed",
            }).on("error", sass.logError)
        )
        .on("error", (e) => logger.failed("sass", e))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .on("error", (e) => logger.failed("postcss", e))
        .pipe(dest(PATH.assets.dest))
        .on("error", (e) => logger.failed("write", e))
        .on("end", () => {
            logger.success("Tooltip: SASS");
        });

    await src(`${PATH.assets.src}/bundle.scss`)
        .pipe(
            sass({
                includePaths: "node_modules",
                outputStyle: "compressed",
            }).on("error", sass.logError)
        )
        .on("error", (e) => logger.failed("sass", e))
        .pipe(rename("ggantt.bundle.css"))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .on("error", (e) => logger.failed("postcss", e))
        .pipe(dest(PATH.assets.dest))
        .on("error", (e) => logger.failed("write", e))
        .on("end", () => {
            logger.success("bundle: SASS");
            sync.reload();
        });
};
