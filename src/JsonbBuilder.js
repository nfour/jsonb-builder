import typeOf from 'lutils-typeof'
import Transposer from 'transposer'

const transpose = Transposer.prototype.transpose

export default class JsonbBuilder {
    constructor(config = {}) {
        this.config = config
    }

    /**
     *  Builds an array of jsonb query objects
     *
     *  @param    {Object}  config
     *  @return   {Array of JsonbQuery}
     */
    build(input, search) {
        const inputType = typeOf(input)

        let paramTree = input
        let queries   = []

        if ( inputType === 'string' )
            paramTree = { [ input ]: search }
        else
        if ( inputType === 'array' )
            paramTree = input.reduce((obj, val) => {
                return { ...obj, ...val }
            }, {})

        for ( let key in paramTree ) {
            // Casts the key into a proper tree if necessary
            let pointer = transpose(key, paramTree[key])
            let query = new JsonbQuery(this.config).parse(pointer)

            queries.push(query)
        }

        return inputType === 'string' ? queries[0] : queries
    }

    get(input, search, options) {
        if ( ! typeOf.String(input) ) {
            options = search
            search = null
        }

        const queries = this.build(input, search)

        switch ( typeOf(input) ) {
            case 'string':
                return queries.get(options)[0]

            default:
                return queries.map((query) => query.get(options))
        }
    }

    selector(input, search, options) {
        if ( ! typeOf.String(input) ) {
            options = search
            search = null
        }
        options = options || {}
        options.asSelector = true

        return this.get(input, search, options)
    }
}

export class JsonbQuery {
    comparators = {
        $eq          : (value) => this._compare({ value, operator: '=' }),
        $ne          : (value) => this._compare({ value, operator: '!=' }),

        $like        : (value) => this._compare({ value, type: 'string', operator: 'LIKE' }),
        $notLike     : (value) => this._compare({ value, type: 'string', operator: 'NOT LIKE' }),

        $iLike       : (value) => this._compare({ value, type: 'string', operator: 'ILIKE' }),
        $notILike    : (value) => this._compare({ value, type: 'string', operator: 'NOT ILIKE' }),

        $gt          : (value) => this._compare({ value, operator: '>' }),
        $gte         : (value) => this._compare({ value, operator: '>=' }),

        $lt          : (value) => this._compare({ value, operator: '<' }),
        $lte         : (value) => this._compare({ value, operator: '<=' }),

        $between     : (value) => this._compare({ value, operator: 'BETWEEN' }),
        $notBetween  : (value) => this._compare({ value, operator: 'NOT BETWEEN' }),

        $not         : (value) => this._compare({ value, operator: 'IS NOT' }),

        $in          : (value) => this._compare({ value, operator: 'IN' }),
        $notIn       : (value) => this._compare({ value, operator: 'IN' }),

        $ovalueerlap : (value) => this._compare({ value, operator: '&&' }),
        $contains    : (value) => this._compare({ value, operator: '@>' }),
        $contained   : (value) => this._compare({ value, operator: '<@' }),

        $any         : (value) => this._compare({ value, operator: 'ANY' }),
    }

    types = {
        'number': '::int',
        // TODO: add ::jsonb etc.
    }

    constructor(config = {}) {
        this.config = {
            column: '',
            wrap: true,
            ...config
        }
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

    selector(options = {}) {
        options.asSelector = true
        return this.get(options)
    }

    buildQuery(keys, search) {
        let items = []

        if ( this.config.column )
            keys.unshift(this.config.column)

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
        if ( typeOf.Function(this.config.transform) ) value = this.config.transform(value)

        if ( this.config.wrap )
            switch ( typeOf(value) ) {
                case 'string':
                    value = `'${value}'`
            }

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
