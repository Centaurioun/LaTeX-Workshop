import * as events from 'events'
import type {Extension} from '../../main'

export class IntellisenseWatcher {
    private readonly extension: Extension
    private readonly intellisenseEmitter: events.EventEmitter

    constructor(extension: Extension) {
        this.extension = extension
        this.intellisenseEmitter = new events.EventEmitter()
        this.intellisenseEmitter.on('update', (file: string) => this.onDidUpdateIntellisense(file))
    }

    private onDidUpdateIntellisense(file: string) {
        this.extension.duplicateLabels.run(file)
    }

    emitUpdate(file: string) {
        this.intellisenseEmitter.emit('update', file)
    }
}
