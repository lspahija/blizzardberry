interface DataInput {
  name: string;
  type: string;
  description: string;
  isArray: boolean;
}

export const getInputNames = (dataInputs: DataInput[], withBraces = false) => {
  const names = dataInputs
    .map((input) => input.name)
    .filter((name) => name !== '');
  return withBraces ? names.map((name) => `{{${name}}}`) : names;
};

export function toCamelCase(str: string): string {
  return (
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[^a-zA-Z]+/, '') || 'customAction'
  );
}
