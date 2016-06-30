import { expect } from 'chai'
import JsonbBuilder from '../dist/JsonbBuilder'

describe("DOES IT WORK?", () => {
    let queries = new JsonbBuilder({ column: 'data' }).build({
        a: { b: { $like: '%word' } },

        equals  : { $eq: 'value' },
        equals2 : 'value',

        "some.thing[0]['!deeper!']": {
            $lt: 5,
            $gt: 2,
        },
    })

    let expectedSelectors = [
        [
            "( data -> 'a' ->> 'b' )"
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

    let expectedComparators = [
        [
            "( data -> 'a' ->> 'b' ) LIKE '%word'"
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


    it("Selectors are valid", () => {
        queries.map((query, index) => {
            let expected = expectedSelectors[index]
            query.get({ asSelector: true }).forEach((value, index2) =>
                expect(value).to.equal(expected[index2])
            )
        })
    })

    it("Comparators are valid", () => {
        queries.map((query, index) => {
            let expected = expectedComparators[index]
            query.get().forEach((value, index2) =>
                expect(value).to.equal(expected[index2])
            )
        })
    })
})
