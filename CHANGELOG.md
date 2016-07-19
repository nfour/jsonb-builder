### `0.3.0` July 19th
- Add `new JsonbBuilder().get({ asSelector: true })`
    - Remove need to get individual items via `.build()`
    - Output is an array of strings
    - `new JsonbBuilder({ column: 'data' }).get("a['33_1'].a", 1)`
        - Returns `"( data -> 'a' -> '33_1' ->> 'a' )::int = 1"`

### `0.2.0` June 30th
- Renamed `get` to `build`
    - eg. `new Jsonb().build()[0].get()`

### `0.1.2` April 23rd
- Init
