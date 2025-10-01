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
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}
