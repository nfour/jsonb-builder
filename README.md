# JSONB BUILDER

## WIP Development stub

`npm install jsonb-builder`

```js
import JsonbBuilder from 'jsonb-builder'

let queries = new JsonbBuilder({ column: 'data' }).get({
    something : { $like: '%word'},
    equals    : { $eq: 'value'},
    equals2   : 'value',

    "some.thing[0]['!deeper!']": {
        $lt: 5,
        $gt: 2,
    },
})

let comparisons = queries.map((query) => query.get())
/*
    [
        [
            "( data ->> 'something' ) LIKE '%word'"
        ],
        [
            "( data ->> 'equals' ) = 'value'"
        ],
        [
            "( data ->> 'equals2' ) = 'value'"
        ],
        [
            "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )::int < 5",
            "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )::int > 2"
        ]
    ]
*/

// use `asSelector` to exclude the comparison logic
let statements = queries.map((query) => query.get({ asSelector: true }))
/*
    [
        [
            "( data ->> 'something' )"
        ],
        [
            "( data ->> 'equals' )"
        ],
        [
            "( data ->> 'equals2' )"
        ],
        [
            "( data -> 'some' -> 'thing' -> 0 ->> '!deeper!' )"
        ]
    ]
*/
```


### Search comparitors
- `$gt` - `> 5` - greater than
- `$lt` - `< 5` - lesser than
- `$eq` - `= 5` - equal to
- `$like` - `LIKE '%str%'` (`%` signs must already exist in input)
- more soon...
