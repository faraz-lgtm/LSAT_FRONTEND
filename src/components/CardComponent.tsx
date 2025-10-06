import type { CardProps } from "../Interfaces/cardProps";

const Card = ({ title, description, footer, extra, children }: CardProps) => {
  return (
    <div className="rounded-lg shadow-md border border-gray-200 bg-white flex flex-col overflow-hidden">
      {/* Image */}
      {/* {image && (
        <div className="w-full h-48">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )} */}

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title & Extra */}
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold text-yellow-900">{title}</h2>
          {extra}
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm flex-grow">{description}</p>
        )}

        {/* Children (custom slot for details like price) */}
        {children}
      </div>

      {/* Footer / Actions */}
      {footer && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
