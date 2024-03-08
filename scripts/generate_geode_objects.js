import * as path from "path"
import * as fs from "fs"
import * as process from "process"

const output_file = path.join(process.cwd(), "assets/geode_objects.js")

if (fs.existsSync(output_file)) {
  fs.unlinkSync(output_file)
}

var files = fs.readdirSync("assets/img/geode_objects/")
var imports = ""
var geode_objects = "const geode_objects = {"

for (const file of files) {
  const geode_object = file.replace(".svg", "")
  imports +=
    `import ${geode_object} from "@/assets/img/geode_objects/${file}"` + "\n"
  geode_objects += `${geode_object}:{\n tooltip: "${geode_object}",\n image: ${geode_object},\n},\n`
}
geode_objects += "}\n\n export default geode_objects"
fs.writeFileSync(output_file, imports + "\n" + geode_objects)

console.log("Fichier JS créé avec succès :", output_file)
