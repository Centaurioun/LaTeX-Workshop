import * as vscode from 'vscode'
import * as lw from '../lw'
import { TeXElement, TeXElementType } from './structure'
import { buildBibTeX } from './structurelib/bibtex'
import { construct as constructLaTeX } from './structurelib/latex'
import { construct } from './structurelib/doctex'

export class DocSymbolProvider implements vscode.DocumentSymbolProvider {

    async provideDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
        if (document.languageId === 'bibtex') {
            return buildBibTeX(document).then((sections: TeXElement[]) => this.sectionToSymbols(sections))
        } else if (document.languageId === 'doctex') {
            return construct(document).then((sections: TeXElement[]) => this.sectionToSymbols(sections))
        }
        if (lw.lwfs.isVirtualUri(document.uri)) {
            return []
        }
        const sections = await constructLaTeX(document.fileName, false)
        return this.sectionToSymbols(sections)
    }

    private sectionToKind(section: TeXElement): vscode.SymbolKind {
        if (section.type === TeXElementType.Section || section.type === TeXElementType.SectionAst) {
            return vscode.SymbolKind.Module
        }
        if (section.type === TeXElementType.Environment) {
            return vscode.SymbolKind.Class
        }
        if (section.type === TeXElementType.Command) {
            return vscode.SymbolKind.Method
        }
        if (section.type === TeXElementType.SubFile) {
            return vscode.SymbolKind.Interface
        }
        if (section.type === TeXElementType.BibItem) {
            return vscode.SymbolKind.Package
        }
        if (section.type === TeXElementType.BibField) {
            return vscode.SymbolKind.Property
        }
        return vscode.SymbolKind.Constant
    }

    private sectionToSymbols(sections: TeXElement[]): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = []

        sections.forEach(section => {
            const range = new vscode.Range(section.lineFr, 0, section.lineTo, 65535)
            const symbol = new vscode.DocumentSymbol(
                section.label || 'empty', '',
                this.sectionToKind(section),
                range, range)
            symbols.push(symbol)
            if (section.children.length > 0) {
                symbol.children = this.sectionToSymbols(section.children)
            }
        })

        return symbols
    }

}
