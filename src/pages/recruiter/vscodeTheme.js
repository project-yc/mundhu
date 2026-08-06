// VS Code "Dark+" palette and the matching CodeMirror 6 theme.
//
// Colour values are taken from the VS Code Default Dark+ theme so the viewer
// reads as the editor candidates actually work in. Kept in one module so the
// chrome (sidebar, tabs, status bar) and the editor can't drift apart.

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const VSC = {
  // surfaces
  editorBg: '#1E1E1E',
  sidebarBg: '#252526',
  activityBg: '#333333',
  titleBarBg: '#3C3C3C',
  tabInactiveBg: '#2D2D2D',
  tabActiveBg: '#1E1E1E',
  statusBg: '#007ACC',
  widgetBg: '#252526',

  // lines
  border: '#1E1E1E',
  panelBorder: '#2B2B2B',
  contrastBorder: '#454545',

  // text
  fg: '#D4D4D4',
  fgMuted: '#969696',
  fgFaint: '#6E7681',
  fgBright: '#FFFFFF',

  // interaction
  accent: '#007ACC',
  focusBorder: '#007FD4',
  listHover: '#2A2D2E',
  listActive: '#37373D',
  listSelected: '#04395E',
  selection: '#264F78',
  lineNumber: '#858585',
  lineNumberActive: '#C6C6C6',

  // semantic
  green: '#6A9955',
  orange: '#CE9178',
  blue: '#569CD6',
  lightBlue: '#9CDCFE',
  teal: '#4EC9B0',
  yellow: '#DCDCAA',
  purple: '#C586C0',
  numberGreen: '#B5CEA8',
  red: '#F44747',
  gold: '#D7BA7D',
};

export const MONO_STACK =
  "'Cascadia Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace";

// Token colours — mapped from Dark+ TextMate scopes onto Lezer highlight tags.
const darkPlusHighlight = HighlightStyle.define([
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: VSC.green, fontStyle: 'italic' },
  { tag: [t.string, t.special(t.string), t.docString], color: VSC.orange },
  { tag: [t.number, t.integer, t.float, t.bool, t.null], color: VSC.numberGreen },
  { tag: [t.keyword, t.operatorKeyword, t.definitionKeyword, t.modifier, t.self, t.atom], color: VSC.blue },
  { tag: [t.controlKeyword, t.moduleKeyword], color: VSC.purple },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: VSC.yellow },
  { tag: [t.variableName, t.propertyName, t.attributeName], color: VSC.lightBlue },
  { tag: [t.typeName, t.className, t.namespace, t.annotation], color: VSC.teal },
  { tag: [t.constant(t.variableName), t.standard(t.variableName)], color: '#4FC1FF' },
  { tag: [t.operator, t.punctuation, t.separator, t.bracket, t.paren, t.brace, t.squareBracket], color: VSC.fg },
  { tag: [t.tagName], color: VSC.blue },
  { tag: [t.angleBracket], color: '#808080' },
  { tag: [t.regexp], color: '#D16969' },
  { tag: [t.escape, t.special(t.brace)], color: VSC.gold },
  { tag: [t.meta, t.processingInstruction], color: VSC.blue },
  { tag: [t.link, t.url], color: VSC.orange, textDecoration: 'underline' },
  { tag: [t.heading], color: VSC.blue, fontWeight: 'bold' },
  { tag: [t.emphasis], fontStyle: 'italic' },
  { tag: [t.strong], fontWeight: 'bold' },
  { tag: [t.strikethrough], textDecoration: 'line-through' },
  { tag: [t.list, t.quote], color: VSC.orange },
  { tag: [t.invalid], color: VSC.red },
]);

const darkPlusChrome = EditorView.theme(
  {
    '&': {
      color: VSC.fg,
      backgroundColor: VSC.editorBg,
      height: '100%',
      fontSize: '13px',
    },
    '.cm-content': {
      fontFamily: MONO_STACK,
      padding: '8px 0',
      caretColor: 'transparent',
    },
    '&.cm-editor': { height: '100%' },
    '.cm-scroller': {
      fontFamily: MONO_STACK,
      lineHeight: '1.5',
      overflow: 'auto',
    },
    '.cm-gutters': {
      backgroundColor: VSC.editorBg,
      color: VSC.lineNumber,
      border: 'none',
      paddingRight: '8px',
      userSelect: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '38px', textAlign: 'right' },
    '.cm-foldGutter .cm-gutterElement': { color: VSC.fgFaint },
    '.cm-activeLine': { backgroundColor: 'transparent' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: VSC.lineNumberActive },
    '&.cm-focused': { outline: 'none' },
    '.cm-selectionBackground, ::selection': { backgroundColor: `${VSC.selection} !important` },
    '&.cm-focused .cm-selectionBackground': { backgroundColor: `${VSC.selection} !important` },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'transparent' },
    // Indent guides, matching VS Code's subtle vertical rules.
    '.cm-indent-markers::before': { borderRight: '1px solid #404040' },
    '.cm-panels': { backgroundColor: VSC.widgetBg, color: VSC.fg },
    '.cm-searchMatch': { backgroundColor: '#613214', outline: '1px solid #7f5622' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#9e6a03' },
    '.cm-tooltip': {
      backgroundColor: VSC.widgetBg,
      border: `1px solid ${VSC.contrastBorder}`,
      color: VSC.fg,
    },
    // Scrollbars — VS Code's translucent overlay style.
    '.cm-scroller::-webkit-scrollbar': { width: '14px', height: '14px' },
    '.cm-scroller::-webkit-scrollbar-track': { background: 'transparent' },
    '.cm-scroller::-webkit-scrollbar-thumb': { background: '#79797966', border: '3px solid transparent', backgroundClip: 'content-box' },
    '.cm-scroller::-webkit-scrollbar-thumb:hover': { background: '#646464b3', border: '3px solid transparent', backgroundClip: 'content-box' },
  },
  { dark: true },
);

export const vscodeDark = [darkPlusChrome, syntaxHighlighting(darkPlusHighlight)];
