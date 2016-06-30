# JSONB BUILDER

Creates JSONB selector & compartor strings for use in postgres `jsonb` queries.

`npm install jsonb-builder`

```js
import Jsonb from 'jsonb-builder'

const queries = new Jsonb({ column: 'data' }).build({
    something : { $like: '%word'},
    equals    : { $eq: 'value'},
    equals2   : 'value',

    "some.thing[0]['!deeper!']": {
        $lt: 5,
        $gt: 2,
    },
})

const comparisons = queries.map((query) => query.get())
/*
    [
        [ "( data ->> 'something' ) LIKE '%word'" ],
        [ "( data ->> 'equals' ) = 'value'" ],
        [ "( data ->> 'equals2' ) = 'value'" ],
        [
            "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )::int < 5",
            "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )::int > 2"
        ]
    ]
*/

// use `asSelector` to exclude the comparison logic
const statements = queries.map((query) => query.get({ asSelector: true }))
/*
    [
        [ "( data ->> 'something' )" ],
        [ "( data ->> 'equals' )" ],
        [ "( data ->> 'equals2' )" ],
        [ "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )" ]
    ]
*/
```


### Search comparitors
- `$eq` -- `= 1`
- `$ne` -- `!= 1`

- `$like` -- `LIKE '%str%'` (`%` must already exist in input)
- `$notLike` -- `NOT LIKE '%str%'`
- `$iLike` -- `ILIKE '%str%'`
- `$notILike` -- `NOT ILIKE '%str%'`

- `$gt` -- `>`
- `$gte` -- `>=`

- `$lt` -- `<`
- `$lte` -- `<=`
- `$between` -- `BETWEEN`
- `$notBetween` -- `NOT BETWEEN`
- `$not` -- `NOT`
- `$in` -- `IN`
- `$notIn` -- `NOT IN`
- `$overlap` -- `&&`
- `$contains` -- `@>`
- `$contained` -- `<@`
- `$any` -- `ANY`

### TODO
- [x] Add more comparitors
    - [ ] Test all comparitors
- [ ] Add more type casting logic
