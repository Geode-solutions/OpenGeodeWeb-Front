/* oxlint-disable vitest/require-hook */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const output_file = path.join(process.cwd(), "assets/geode_objects.ts");

if (fs.existsSync(output_file)) {
  fs.unlinkSync(output_file);
}

const files = fs.readdirSync("assets/img/geode_objects/");
let imports = "";
let geode_objects =
  "interface GeodeObject {\n  tooltip: string;\n  image: string;\n}\n\nconst geode_objects: Record<string, GeodeObject> = {";

for (const file of files) {
  const geode_object = file.replace(".svg", "");
  imports += `import ${geode_object} from "@ogw_front/assets/img/geode_objects/${file}"\n`;
  geode_objects += `${geode_object}:{\n tooltip: "${geode_object}",\n image: ${geode_object},\n},\n`;
}
geode_objects += "}\n\n export default geode_objects";
fs.writeFileSync(output_file, `${imports}\n${geode_objects}`);

console.log("Fichier TS créé avec succès :", output_file);
