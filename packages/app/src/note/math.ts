type Marker = {
  open: RegExp;
  close: RegExp;
};

// $ ... $
const inline1: Marker = {
  open: /\$/y,
  close: /\$/y,
};

// \( ... \)
const inline2: Marker = {
  open: /\\\(/y,
  close: /\\\)/y,
};

// $$ ... $$
const block1: Marker = {
  open: /\$\$/y,
  close: /\$\$/y,
};

// \[ ... \]
const block2: Marker = {
  open: /\\\[/y,
  close: /\\\]/y,
};

const ignore = /\s+|\\\{|\\\}|\\\\/y;

export type Result = {
  raw: string;
  text: string;
};

export function findInline(src: string): number | void {
  let open1 = findDelimiters(src, "$", "$");
  let open2 = findDelimiters(src, "\\(", "\\)");
  if (open1 !== -1 && open2 !== -1) {
    return Math.min(open1, open2);
  }
  if (open1 !== -1) {
    return open1;
  }
  if (open2 !== -1) {
    return open2;
  }
}

export function parseInline(src: string, result: Result): boolean {
  return (
    parse(src, inline1, result) || //
    parse(src, inline2, result)
  );
}

export function findBlock(src: string): number | void {
  let open1 = findDelimiters(src, "$$", "$$");
  let open2 = findDelimiters(src, "\\[", "\\]");
  if (open1 !== -1 && open2 !== -1) {
    return Math.min(open1, open2);
  }
  if (open1 !== -1) {
    return open1;
  }
  if (open2 !== -1) {
    return open2;
  }
}

export function parseBlock(src: string, result: Result): boolean {
  return (
    parse(src, block1, result) || //
    parse(src, block2, result)
  );
}

function findDelimiters(src: string, open: string, close: string): number {
  let a = src.indexOf(open);
  if (a !== -1) {
    let b = src.indexOf(close, a + open.length + 1);
    if (b === -1) {
      a = -1;
    }
  }
  return a;
}

function parse(src: string, marker: Marker, result: Result): boolean {
  if (testRegExp(src, marker.open, 0)) {
    let index = marker.open.lastIndex;
    while (index < src.length) {
      if (testRegExp(src, ignore, index)) {
        index = ignore.lastIndex;
      } else {
        if (testRegExp(src, marker.close, index)) {
          result.raw = src.substring(0, marker.close.lastIndex);
          result.text = src.substring(marker.open.lastIndex, index).trim();
          return true;
        }
        index += 1;
      }
    }
  }
  return false;
}

function testRegExp(src: string, re: RegExp, index: number): boolean {
  re.lastIndex = index;
  return re.test(src);
}
