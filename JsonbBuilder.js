import { typeOf } from 'lutils'
import Transposer from 'transposer'

const transpose = Transposer.prototype.transpose

export default class JsonbBuilder {
    constructor(config = {}) {
        this.column = config.column || ''
    }

    /**
     *  Builds an array of jsonb query objects
     *
     *  @param    {Object}  config
     *  @return   {Array of JsonbQuery}
     */
    get(input, inputSearch) {
        let paramTrees = input

        if ( typeOf.String(input) ) paramTrees = { [ input ]: inputSearch }

        const queries = []
        for ( let key in paramTrees ) {
            // Casts the key into a proper tree if necessary
            let pointer = transpose(key, paramTrees[key])

            let query = new JsonbQuery({ column: this.column }).parse(pointer)

            queries.push(query)
        }

        return typeOf.String(input) ? queries[0] : queries
    }
}

export class JsonbQuery {
    comparators = {
        $eq   : (value) => this._compare({ value, operator: '=' }),
        $gt   : (value) => this._compare({ value, operator: '>' }),
        $lt   : (value) => this._compare({ value, operator: '<' }),
        $like : (value) => this._compare({ value, type: 'string', operator: 'LIKE' }),
    };

    types = {
        'number': '::int',
    }

    constructor({ column } = {}) {
        this.column = column || ''
    }

    parse(tree) {
        let { keys, search } = this._parseTree(tree)

        this.keys   = keys
        this.search = search

        return this
    }

    get({ asSelector = false, search = this.search } = {}) {
        return this.buildQuery([ ...this.keys ], ( asSelector ? null : search ))
    }

    buildQuery(keys , search) {
        let items = []

        if ( this.column )
            keys.unshift(this.column)

        let lastIndex = keys.length - 1
        let parts     = keys.map((key, index) => {
            // Ensures the first joiner is ignored, and the last is ->>
            let joiner = index === 0
                ? ''
                : index === lastIndex ? ' ->> ' : ' -> '

            return [ joiner, key ].join('')
        })

        if ( search ) {
            for ( let key in search ) {
                let value     = search[key]
                let comparitor = this.comparators[key]

                items.push(`( ${parts.join('')} )${ comparitor(value) }`)
            }
        } else {
            items.push(`( ${parts.join('')} )`)
        }

        return items
    }

    _compare({ value, type = typeOf(value), operator = '='} = {}) {
        if ( type !== 'number' ) value = `'${value}'`

        return `${this.types[type] || ''} ${operator} ${value}`
    }

    _isSearch(obj) {
        return Object.keys(obj).some((key) => key in this.comparators)
    }

    _parseTree(pointer, keys = []) {
        let type = typeOf(pointer)

        for ( let key in pointer ) {
            let value = pointer[key]

            if ( type === 'object' ) key = `'${key}'`

            keys.push(key)
            type = typeOf(value) // Ensures type matches the wrapper for keys

            switch ( type ) {
                case 'object':
                    if ( this._isSearch(value) )
                        return { keys, search: value }

                case 'array':
                case 'object':
                    return this._parseTree(value, keys)

                default:
                    return { keys, search: { $eq: value } }
            }
        }
    }
}
