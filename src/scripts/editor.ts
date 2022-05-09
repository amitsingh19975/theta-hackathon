/* eslint-disable import/no-unresolved */
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { editor } from 'monaco-editor';
import loader from '@monaco-editor/loader';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
    getWorker() {
        return new EditorWorker();
    },
};

const graphConfig = {
    language: 'graphql',
    minimap: {
        enabled: false,
    },
    fontSize: 15,
} as editor.IEditorOverrideServices;

let gEditor: editor.IStandaloneCodeEditor|null = null;
let gBoundedElement: HTMLElement|null = null;

const createEditor = async (el: HTMLElement, callback: (val: string) => void) => {
    gBoundedElement = el;
    const ed = await loader.init();
    ed.editor.setTheme('vs-dark');
    gEditor = ed.editor.create(gBoundedElement, graphConfig);
    gEditor.onDidChangeModelContent(() => callback(gEditor?.getValue() || ''));
};

export const getEditor = () => gEditor;
export const disposeEditor = () => {
    let temp = getEditor();
    if (temp) {
        temp.dispose();
        temp = null;
    }
};

export default async (el: HTMLElement, callback: (val: string) => void) => {
    if (gEditor !== null) {
        if (el === gBoundedElement) {
            gEditor.setValue('');
            return gEditor;
        }
    }
    disposeEditor();
    await createEditor(el, callback);
    return gEditor;
};
