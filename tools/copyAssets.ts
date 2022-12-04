import { cp, mkdir, mv } from "shelljs";

cp("-R", ["src/views"], "dist/");
mv("-f", "./public", "dist");
