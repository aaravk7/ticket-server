import { cp, mkdir, mv } from "shelljs";

cp("-R", ["src/views"], "dist/");
mkdir("dist/public");
mkdir("dist/public/posters");
// mv("-f", "./public", "dist");
