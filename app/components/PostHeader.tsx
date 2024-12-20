import { formatDate } from "@/lib/formatDate";

export const PostHeader = ({
  title,
  date,
}: {
  title?: string;
  date?: string;
}) => {
  if (!title) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-2">{title}</h2>
      {date && <div className="text-gray-500 text-sm">{formatDate(date)}</div>}
    </div>
  );
};
