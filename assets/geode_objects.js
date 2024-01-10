const fs = require("fs")
const path = require("path")

const basedir = "./assets/img/geode_objects"
const files = fs.readdirSync(basedir)

var geode_objects = {}
for (const geode_object of files) {
  const class_name = geode_object.replace(".svg", "")
  geode_objects[class_name] = {
    tooltip: class_name,
    image: path.join("assets/img/geode_objects", geode_object),
  }
}

export default geode_objects
