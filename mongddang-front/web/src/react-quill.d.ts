// react-quill 타입 정의 (운영서버에서 모듈을 찾지 못하는 경우를 대비)
declare module 'react-quill' {
  import type { Component } from 'react';
  import type { DeltaStatic, RangeStatic, Sources } from 'quill';

  export interface ReactQuillProps {
    value?: string | DeltaStatic;
    defaultValue?: string | DeltaStatic;
    readOnly?: boolean;
    placeholder?: string;
    bounds?: string | HTMLElement;
    onChange?: (content: string, delta: DeltaStatic, source: Sources, editor: any) => void;
    onChangeSelection?: (selection: RangeStatic, source: Sources, editor: any) => void;
    onFocus?: (selection: RangeStatic, source: Sources, editor: any) => void;
    onBlur?: (previousSelection: RangeStatic, source: Sources, editor: any) => void;
    onKeyPress?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onKeyUp?: (event: any) => void;
    modules?: Record<string, any>;
    formats?: string[];
    theme?: string;
    style?: React.CSSProperties;
    className?: string;
    id?: string;
  }

  export default class ReactQuill extends Component<ReactQuillProps> {}
}

