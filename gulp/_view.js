import sync from "browser-sync";
import { src, dest } from "gulp";
import pug from "gulp-pug";
import { logger } from "./_logger";
import { PATH } from "./_paths";

export const view = async () => {
    await src(`${PATH.pug.src}`)
        .pipe(
            pug({
                debug: false,
                pretty: true,
            })
        )
        .on("error", (e) => logger.failed("write", e))
        .on("end", () => {
            logger.success("PUG");
            sync.reload();
        });
};
