import { cp, mkdir, mv } from "shelljs";

cp("-R", ["src/views"], "dist/");
mkdir("dist/public");
mv("-f", "./public", "dist");
