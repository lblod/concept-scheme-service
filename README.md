# Concept-scheme service

This service will help you manage your concept-schemes and there concepts.

## Types

|Ontology|Class|uri|
|-|-|-|
|<http://www.w3.org/2004/02/skos/core#>|**skos:ConceptScheme**|<http://www.w3.org/2004/02/skos/core#ConceptScheme>|
|<http://www.w3.org/2004/02/skos/core#>|**skos:Concept**|<http://www.w3.org/2004/02/skos/core#Concept>|

## Endpoints

### Concept-scheme

|Method|Path|Description|
|-|-|-|
|GET|`/:id/has-usage`| This will search for usage of this concept-scheme. This could be handy to call before deleting the actual concept-scheme|
|DELETE|`/:id`| This will delete the concept-scheme together with all usages|

### Concept

|Method|Path|Description|
|-|-|-|
|GET|`/:id/has-usage`| This will search for usage of this concept. This could be handy to call before deleting the actual concept|
|DELETE|`/:id`| This will delete the concept together with all usages|
|DELETE|`/batch`| This will do the same as deleting just one concept but accepts multiple concept ids in the request body|

## Adding it to your project

This can easely be done by adding it as a service in your _docker-compose.yml_

```yml
services:
  concept-scheme:
    image: lblod/concept-scheme-service:latest
    labels:
      - "logging=true"
    restart: always
```

## Dispatcher

When using this service in your stack you probably want to update the dispatcher configuration.

The match below is the endpoint that the frontend can call (in this example is "concept-scheme-api"). All these calls will be forwarded to this concept-scheme-service.

```ex
  match "/concept-scheme-api/*path", %{layer: :api_services, accept: %{any: true}} do
    forward(conn, path, "http://concept-scheme/")
  end
```

For not letting resources handle the deletion of the models, you can pass these delete calls on to this new service.

```ex
  delete "/concept-schemes/:id", %{layer: :api_services, accept: %{json: true}} do
    forward(conn, [], "http://concept-scheme-api/concept-scheme/" <> id)
  end

  delete "/concepts/:id", %{layer: :api_services, accept: %{json: true}} do
    forward(conn, [], "http://concept-scheme-api/concept/" <> id)
  end
```
