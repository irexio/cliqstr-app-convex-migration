import React from 'react';
import cn from 'classnames';

export type BaseCardProps = React.HTMLAttributes<HTMLDivElement>;

const BaseCard: React.FC<BaseCardProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-lg border border-gray-200 bg-white text-black shadow-sm p-4 transition-all',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default BaseCard;
