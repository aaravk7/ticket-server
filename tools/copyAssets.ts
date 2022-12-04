import { cp, mkdir } from "shelljs";

cp("-R", ["src/views"], "dist/");
mkdir("dist/public");
mkdir("dist/public/posters");
