

export namespace CSV {
    export interface Options {
        delimiter?: string
        string_delimiter?: '"' | '\''
        row_delimiter?:
        '\\r\\n' // Windows
        | '\\n'  // Mac (OS 10+ / Unix/linux)
        | '\\r'  // Mac (OS 9-)
        header?: boolean
        trim_whitespace?: boolean
        NA_values?: string
    }

    const defaultOptions: Options = {
        delimiter: ';',
        string_delimiter: '\'',
        row_delimiter: '\\n',
        header: true,
        trim_whitespace: true,
        NA_values: '<NA>'
    }

    export function parse(input: string, options?: Options) {
        let final_options = { ...defaultOptions, ...options }
        let _delimiter = new RegExp(final_options.delimiter)
        let _row_delimiter = new RegExp(final_options.row_delimiter)
        let string_pattern = new RegExp(/^\'[^\']*\'$|^\"[^\"]*\"$/)
        let NA_pattern = new RegExp('^' + final_options.NA_values + '$')
        let rows = input.trim().split(_row_delimiter)
        if (final_options.header) {
            let headers = rows.shift().split(_delimiter)
            if (final_options.trim_whitespace) headers = headers.map((header) => header.trim())
            return rows.map((row) => {
                let row_dictionary: { [column: string]: string | number } = {}
                let columns = row.split(_delimiter)
                columns.forEach((column, index) => {
                    let column_value: string | number = final_options.trim_whitespace ? column.trim() : column
                    if (string_pattern.test(column_value)) {
                        column_value = column.substring(1, (column_value.length - 1))
                        if (NA_pattern.test(column_value)) column_value = undefined

                    } else {
                        if (NA_pattern.test(column_value)) {
                            column_value = undefined
                        } else {
                            column_value = Number(column_value)
                        }
                    }
                    row_dictionary[headers[index] || 'column_' + index] = column_value
                })
                return { dictionary: row_dictionary, headers: headers }
            })

        } else {
            return rows.map((row) => {
                return row.split(final_options.delimiter)
            })
        }
    }


    export function parseDictionary(input: string, options?: Options) {
        let final_options = { ...defaultOptions, ...options, headers: true }
        let _delimiter = new RegExp(final_options.delimiter)
        let _row_delimiter = new RegExp(final_options.row_delimiter)
        let string_pattern = new RegExp(/^\'[^\']*\'$|^\"[^\"]*\"$/)
        let NA_pattern = new RegExp('^' + final_options.NA_values + '$')
        let rows = input.trim().split(_row_delimiter)
        let headers = rows.shift().split(_delimiter)
        if (final_options.trim_whitespace) headers = headers.map((header) => header.trim())
        let dictionary = rows.map((row) => {
            let row_dictionary: { [column: string]: string | number } = {}
            let columns = row.split(_delimiter)
            columns.forEach((column, index) => {
                let column_value: string | number = final_options.trim_whitespace ? column.trim() : column
                if (string_pattern.test(column_value)) {
                    column_value = column.substring(1, (column_value.length - 1))
                    if (NA_pattern.test(column_value)) column_value = undefined

                } else {
                    if (NA_pattern.test(column_value)) {
                        column_value = undefined
                    } else {
                        column_value = Number(column_value)
                    }
                }
                row_dictionary[headers[index] || 'column_' + index] = column_value
            })
            return row_dictionary
        })
        return { dictionary: dictionary, headers: headers }
    }
}

export default CSV