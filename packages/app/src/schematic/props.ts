export type Props = Record<string, string>;

export function setProp(props: Props, name: string, value: string): Props {
  return Object.assign({}, props, { [name]: value });
}

export function clearProp(props: Props, name: string): Props {
  return Object.assign({}, props, { [name]: undefined });
}
