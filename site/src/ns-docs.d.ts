declare module "virtual:ns-docs" {
  const docs: Record<string, { text: string; default?: string }>;
  export default docs;
}
