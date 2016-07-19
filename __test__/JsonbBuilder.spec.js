import { expect } from 'chai'
import JsonbBuilder from '../dist/JsonbBuilder'

console.inspect = (val, options = {}) =>
    console.log( require('util').inspect(val, { depth: 6, hidden: true, colors: true, ...options }) )


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

    it("Works with .get()", () => {
        let getQueries = new JsonbBuilder({ column: 'data' }).get({
            a: { b: { $like: '%word' } },
            equals  : { $eq: 'value' },
        })

        getQueries.forEach((query, index) => {
            let expected = expectedComparators[index]
            query.forEach((value, index2) =>
                expect(value).to.equal(expected[index2])
            )
        })

        let q1 = new JsonbBuilder({ column: 'data' }).get("a['33_1'].a", 1)
        let q2 = new JsonbBuilder({ column: 'data' }).get("a['33_1'].a", 1, { asSelector: true })
        let q3 = new JsonbBuilder({ column: 'data' }).selector("a['33_1'].a", 1)

        expect(q1).to.equal("( data -> \'a\' -> \'33_1\' ->> \'a\' )::int = 1")
        expect(q2).to.equal("( data -> \'a\' -> \'33_1\' ->> \'a\' )")
        expect(q3).to.equal("( data -> \'a\' -> \'33_1\' ->> \'a\' )")
    })
})
