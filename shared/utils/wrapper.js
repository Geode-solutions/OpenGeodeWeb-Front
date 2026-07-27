import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";




function getAllowedFiles({ beforeFunction, afterFunction }) {
  beforeFunction();
  const backStore = useBackStore();
  const schema = schemas.opengeodeweb_back.allowed_files;
  return backStore.request(
    { schema },
    {
      response_function: (response) => {
        accept.value = response.extensions.map((extension) => `.${extension}`).join(",");
      },
    },
  );
  afterFunction();
}


export { getAllowedFiles };