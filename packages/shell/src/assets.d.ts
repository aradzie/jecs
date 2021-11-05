declare module "*.txt" {
  const value: string;
  export default value;
}

declare module "*.css" {
  const value: Record<string, string>;
  export default value;
}
