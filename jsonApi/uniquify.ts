import { Transform } from 'stream'
import json_core from './json_core';

function _fullDataprint(data: {}, projection?: Array<string>) {
    if (projection !== undefined) {
        return JSON.stringify(json_core.project(data, projection))
    } else {
        return JSON.stringify(data)
    }
}

// From https://stackoverflow.com/a/7616484
function _hash(str: string) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
function _hashDataprint(data: {}, projection?: Array<string>) {
    if (projection !== undefined) {
        return _hash(JSON.stringify(json_core.project(data, projection)))
    } else {
        return _hash(JSON.stringify(data))
    }
}

class Uniquify extends Transform {
    private _dataprints: Set<string | number> = new Set;
    constructor(dataprintFunction: 'full' | 'hash' = 'hash', dataprintParameters?: { projection?: Array<string> }) {

        super(
            {
                readableObjectMode: true,
                writableObjectMode: true,
                transform: (chunk, encoding, cb) => {
                    let projection;
                    if (dataprintParameters !== undefined) {
                        projection = dataprintParameters.projection
                    } else {
                        projection = undefined;
                    }
                    let dataprint: string | number = 0;
                    switch (dataprintFunction) {
                        case 'full':
                            dataprint = _fullDataprint(chunk, projection)
                            break;
                        case 'hash':
                            dataprint = _hashDataprint(chunk, projection)
                            break;
                    }
                    if (this._dataprints.has(dataprint)) {
                        cb();
                    } else {
                        this._dataprints.add(dataprint)
                        cb(undefined, chunk);
                    }
                },
            }
        )
        this.on('end', () => { console.log('i finished with ' + this._dataprints.size + ' objects processed') })
    }
}

export function streamUniqifier(dataprintFunction: 'full' | 'hash' = 'hash', dataprintParameters?: { projection?: Array<string> }) {
    return new Uniquify(dataprintFunction, dataprintParameters)
}


export default streamUniqifier