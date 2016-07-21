# JSONB BUILDER

Creates JSONB selector & compartor strings for use in postgres `jsonb` queries.

`npm install jsonb-builder`

```js
import Jsonb from 'jsonb-builder'

//
// Build a comparison for a where statement
//
const jsonbComparison = new Jsonb({ column: 'data' }).get("a['33_1'].a", 1)
/*
    "( data -> 'a' -> '33_1' ->> 'a' )::int = 1"
*/

//
// Get just a selector (for use in columns)
//
const jsonbSelector = new Jsonb({ column: 'data' }).selector("a['33_1'].a", 1)
/*
    "( data -> 'a' -> '33_1' ->> 'a' )"
*/

//
// Escape with a transform
//
const jsonbComparison2 = new Jsonb({
    column: 'data',
    transform: (val) => Knex.raw('?', [val]),
}).selector("a['33_1'].a", "some'; drop table bobby")
/*
    "( data -> 'a' -> '33_1' ->> 'a' ) = 'some\'; drop table bobby'"
*/


//
// Get many
//
const query = new Jsonb({ column: 'test' }).get({
    foo       : { bar: 1 },
    "test[1]" : { $lt: 3 }
})
/*
    [
        [ "( test ->> 'foo' -> 'bar' )::int = 1" ]
        [ "( test ->> 'test' -> 1 )::int < 3" ]
    ]
*/


//
// Get class instances for more control
//
const queries = new Jsonb({ column: 'data' }).build({
    something : { $like: '%word' },
    equals    : { $eq: 'value' },
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
const statements = queries.map((query) => query.selector())
/*
    [
        [ "( data ->> 'something' )" ],
        [ "( data ->> 'equals' )" ],
        [ "( data ->> 'equals2' )" ],
        [ "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )" ]
    ]
*/
```

### Caveats
- Be sure to escape your values.


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
