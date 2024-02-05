/* eslint-disable arrow-body-style */
import schemas from "./schemas.json"
import _ from "lodash"

function createMethods(session) {
  const ogw_viewer = schemas.opengeodeweb_viewer

  var functions_object = {}
  for (const function_name of Object.keys(ogw_viewer)) {
    console.log("function_name", function_name)
    console.log("properties", ogw_viewer[function_name].properties)

    if (_.isEmpty(ogw_viewer[function_name].properties)) {
      functions_object[function_name] = () =>
        session.call(ogw_viewer[function_name].route)
    } else {
      functions_object[function_name] = (params) =>
        session.call(ogw_viewer[function_name].route, [params])
    }
  }

  console.log("functions_object", functions_object)

  return functions_object
}

export default createMethods
