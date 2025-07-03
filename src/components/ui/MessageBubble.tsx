// MessageBubble component
import Image from 'next/image';

type MessageBubbleProps = {
  content: string;
  author?: string;
  avatarUrl?: string;
  isSender: boolean;
};

export default function MessageBubble({
  content,
  author,
  avatarUrl,
  isSender,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end gap-2">
        {!isSender && avatarUrl && (
          <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
            <Image src={avatarUrl} alt={author || 'User'} width={32} height={32} />
          </div>
        )}
        <div>
          {!isSender && author && <div className="text-xs text-gray-500 mb-1">{author}</div>}
          <div
            className={`rounded-2xl py-2 px-4 max-w-xs ${
              isSender
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
