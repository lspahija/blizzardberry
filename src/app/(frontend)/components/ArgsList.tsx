'use client';

interface DataInput {
  name: string;
  type: string;
  description: string;
  isArray: boolean;
}

interface ArgsListProps {
  dataInputs: DataInput[];
}

export default function ArgsList({ dataInputs }: ArgsListProps) {
  return (
    <ul className="list-disc pl-6">
      {dataInputs
        .filter((input) => input.name)
        .map((input, idx) => (
          <li key={idx}>
            <span className="font-mono font-semibold">{input.name}</span>
            <span className="ml-2 text-gray-700">
              ({input.type}
              {input.isArray ? '[]' : ''})
            </span>
            <span className="ml-2 text-gray-500">{input.description}</span>
          </li>
        ))}
    </ul>
  );
}
