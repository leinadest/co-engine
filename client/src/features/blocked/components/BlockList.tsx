import Block, { BlockProps } from "./Block";

interface BlockListProps {
  blocks: BlockProps[];
}

export default function BlockList({blocks}: BlockListProps) {
  return <ul>
    {blocks.map((block) => <li key={block.id}>
      <Block {...block} />
    </li>)}
  </ul>
}