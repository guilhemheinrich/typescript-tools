
import { Transform } from 'stream'

class Join extends Transform {
    private _accumulator = '';
    private _cpt = 0;
    private addDelimitter = false;
    constructor(options: {
        size?: number, prefix: string, suffix: string, delimitter: string
    } = {
            prefix: '[', suffix: ']', delimitter: ',\n'
        }) {
        super(
            {
                readableObjectMode: true,
                writableObjectMode: true,
                flush: (cb) => {
                    this._accumulator += options.suffix
                    this.push(this._accumulator);
                    cb();
                },
                transform: (chunk, encoding, cb) => {
                    if (this.addDelimitter) {
                        this._accumulator += options.delimitter
                    }
                    this._accumulator += chunk
                    if (options.size !== undefined && this._cpt === options.size - 1) {
                        this._accumulator += options.suffix
                        this.push(this._accumulator);
                        cb();
                        // cb(undefined, this._accumulator);
                        this._cpt = 0
                        this.addDelimitter = false;
                        this._accumulator = options.prefix;
                    } else {
                        if (options.size !== undefined) {
                            this._cpt++;
                        }
                        this.addDelimitter = true;
                        cb()
                    }
                },
            }
        )
        this._accumulator += options.prefix;

    }

}

export function streamJoiner(options?: {
    size?: number, prefix: string, suffix: string, delimitter: string
}) {
    return new Join(options)
}


export default streamJoiner