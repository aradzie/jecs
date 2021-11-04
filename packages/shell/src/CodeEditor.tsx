import React, {
  CSSProperties,
  DetailedHTMLProps,
  FocusEvent,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  // Props for the component.
  value: string;
  onValueChange: (value: string) => void;
  highlight: (value: string) => ReactNode;

  // Props for the textarea.
  onClick?: (ev: MouseEvent<HTMLTextAreaElement>) => void;
  onFocus?: (ev: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (ev: FocusEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (ev: KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (ev: KeyboardEvent<HTMLTextAreaElement>) => void;
};

type State = {};

export class CodeEditor extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  override state: Readonly<State> = {};

  _handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const { value } = ev.target;
    this.props.onValueChange(value);
  };

  _input: HTMLTextAreaElement | null = null;

  override render(): ReactNode {
    const {
      highlight,
      onBlur,
      onClick,
      onFocus,
      onKeyDown,
      onKeyUp,
      onValueChange,
      style,
      value,
      ...rest
    } = this.props;

    const highlighted = highlight(value);

    return (
      <div
        className="CodeEditor"
        {...rest}
        style={{
          ...styles.container,
          ...style,
        }}
      >
        <textarea
          className="CodeEditor__textArea"
          ref={(el) => (this._input = el)}
          style={{
            ...styles.editor,
            ...styles.textarea,
          }}
          value={value}
          onChange={this._handleChange}
          onClick={onClick}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          autoComplete="off"
          spellCheck={false}
        />
        <pre
          className="CodeEditor__pre"
          aria-hidden="true"
          style={{
            ...styles.editor,
            ...styles.highlight,
          }}
          children={highlighted}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    position: "relative",
    width: "500px",
    height: "500px",
    textAlign: "left",
    boxSizing: "border-box",
    margin: "1rem",
    padding: 0,
    border: "1px solid gray",
    overflow: "hidden",
    fontFamily: "monospace",
  } as CSSProperties,
  editor: {
    margin: 0,
    padding: "1rem",
    border: "none",
    background: "none",
    boxSizing: "border-box",
    display: "block",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontStyle: "inherit",
    fontVariantLigatures: "inherit",
    fontWeight: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    tabSize: "inherit",
    textIndent: "inherit",
    textRendering: "inherit",
    textTransform: "inherit",
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
    overflowWrap: "break-word",
  } as CSSProperties,
  textarea: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    resize: "none",
    color: "inherit",
    overflow: "hidden",
    MozOsxFontSmoothing: "grayscale",
    WebkitFontSmoothing: "antialiased",
    WebkitTextFillColor: "transparent",
  } as CSSProperties,
  highlight: {
    position: "relative",
    pointerEvents: "none",
  } as CSSProperties,
};
