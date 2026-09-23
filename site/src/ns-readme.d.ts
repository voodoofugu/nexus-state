declare module "virtual:ns-readme" {
  export type ReadmeNode = {
    name: string;
    section: string;
    kind: "section" | "entry";
    note: string;
    group: string;
    body: string;
    children: ReadmeNode[];
  };

  export type ReadmeSection = { title: string; body: string };

  const readme: {
    sections: ReadmeSection[];
    api: ReadmeNode[];
    extras: ReadmeSection[];
  };

  export default readme;
}
