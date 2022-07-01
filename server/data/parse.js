import fs from "fs";

export const parseJson = (filename) => {
    const dataFile = fs.readFileSync(
        `${process.cwd()}/server/data/${filename}`,
        "utf-8"
    );
    return JSON.parse(dataFile);
};
