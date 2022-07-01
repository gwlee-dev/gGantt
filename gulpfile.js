import "dotenv/config";
import { build, compress, dev } from "./gulp/gulp";

exports.dev = dev;
exports.build = build;
exports.compress = compress;
