// WIP Test runner for jsonbbuilder

import JsonbBuilder from '../lib/JsonbBuilder'

describe("DOES IT WORK?", () => {
    it("HELL YES", () => {
        let queries = new JsonbBuilder({ column: 'data' }).get({
            a: { b: { $like: '%word'} },

            equals  : { $eq: 'value' },
            equals2 : 'value',

            "some.thing[0]['!deeper!']": {
                $lt: 5,
                $gt: 2,
            },
        }).map((query) => query.get({ asStatement: true }))

        console.log( JSON.stringify( queries, 4, 4) )
    })
})
