import { Tooltip } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';

export const VaultTagContent = observer(
  ({
    tag,
    bgColor,
    textColor,
    tooltip,
  }: {
    tag: string;
    bgColor: string;
    textColor: string;
    tooltip?: string;
  }) => {
    return (
      <div
        className="flex items-center gap-2 rounded-full px-2 cursor-pointer"
        style={{ backgroundColor: bgColor, color: textColor }}
        tabIndex={0}
        role="button"
      >
        <span className="text-sm">{tag}</span>
      </div>
    );
  }
);

export const VaultTag = observer(
  ({
    tag,
    bgColor,
    textColor,
    tooltip,
  }: {
    tag: string;
    bgColor: string;
    textColor: string;
    tooltip?: string;
  }) => {
    return (
      <div className="flex items-center gap-2 relative mb-2">
        <Tooltip
          content={tooltip}
          placement="top"
          delay={0}
          closeDelay={0}
          classNames={{
            content: 'max-w-[200px]',
          }}
        >
          <div className="cursor-pointer" tabIndex={0} role="button">
            <VaultTagContent
              tag={tag}
              bgColor={bgColor}
              textColor={textColor}
            />
          </div>
        </Tooltip>
      </div>
    );
  }
);
