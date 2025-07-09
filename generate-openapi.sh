(cd warehouse && npx tsoa spec-and-routes)
(cd orders && npx tsoa spec-and-routes)

npx swagger-merge -i warehouse/build/swagger.json -i orders/build/swagger.json -o docs/swagger.json

npx @openapitools/openapi-generator-cli generate -i ./docs/swagger.json -o ./client -g typescript-fetch