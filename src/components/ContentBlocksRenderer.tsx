import type { ServiceContentBlock } from '@/hooks/useAppointmentData';

export const ContentBlock = ({ block }: { block: ServiceContentBlock }) => {
  if (block.type === 'image') {
    return (
      <figure className="space-y-2">
        <img
          src={block.image_url}
          alt={block.title || ''}
          className="w-full rounded-card shadow-card object-cover max-h-[480px]"
        />
        {block.title && (
          <figcaption className="text-small text-muted-foreground text-center">{block.title}</figcaption>
        )}
      </figure>
    );
  }
  if (block.type === 'list') {
    const items = (block.body || '').split('\n').map((s) => s.trim()).filter(Boolean);
    return (
      <div>
        {block.title && <h2 className="text-h3 text-foreground mb-4">{block.title}</h2>}
        <ul className="space-y-2 list-disc list-inside text-foreground">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div>
      {block.title && <h2 className="text-h3 text-foreground mb-4">{block.title}</h2>}
      <p className="text-muted-foreground text-lg whitespace-pre-line">{block.body}</p>
    </div>
  );
};

export const ContentBlocksRenderer = ({ blocks }: { blocks: ServiceContentBlock[] }) => (
  <>
    {blocks.map((b) => (
      <ContentBlock key={b.id} block={b} />
    ))}
  </>
);