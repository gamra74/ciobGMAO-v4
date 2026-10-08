import React, { useMemo } from 'react';
import { List } from 'react-window';

/**
 * مكون جدول ذكي افتراضي (Virtualized Table) لتحمل آلاف السجلات بسلاسة 60fps
 * متوافق مع `react-window` v2 (`rowCount`, `rowHeight`, `rowComponent`, `rowProps`).
 *
 * يدعم نمطين:
 * 1) نمط `renderRow({ item, index, style, rowNumber })` مع `items` أو `data`
 * 2) نمط `columns` المهيكل مع `data` أو `items`
 */
export function VirtualizedTable({
  items,
  data,
  columns = [],
  itemHeight = 48,
  rowHeight,
  renderRow,
  header = null,
  maxHeight = 600,
  height,
  startIndex = 0,
  showRowNumber = false,
  onRowClick,
  emptyMessage = 'Aucun enregistrement trouvé',
  className = '',
}) {
  const dataset = useMemo(() => items || data || [], [items, data]);
  const effectiveRowHeight = rowHeight || itemHeight || 48;
  const effectiveMaxHeight = height || maxHeight || 560;

  const calculatedHeight = useMemo(() => {
    if (!dataset.length) return 150;
    return Math.min(Math.max(dataset.length * effectiveRowHeight, 120), effectiveMaxHeight);
  }, [dataset.length, effectiveRowHeight, effectiveMaxHeight]);

  // Row renderer compatible with react-window v2 (`rowComponent` receives `{ index, style, ariaAttributes, ...rowProps }`)
  const RowComponent = ({ index, style, ariaAttributes }) => {
    const item = dataset[index];
    if (!item) return null;
    const rowNumber = startIndex + index + 1;

    if (typeof renderRow === 'function') {
      const rendered = renderRow({ item, index, style, rowNumber });
      // If renderRow returns a <tr> (from table-based views), wrap or convert cleanly for virtualized flex container
      if (React.isValidElement(rendered) && rendered.type === 'tr') {
        const childrenArray = React.Children.toArray(rendered.props.children);
        return (
          <div
            {...ariaAttributes}
            style={style}
            onClick={rendered.props.onClick}
            onContextMenu={rendered.props.onContextMenu}
            className={`flex items-center w-full box-border ${rendered.props.className || 'border-b border-slate-100'}`}
          >
            {childrenArray.map((tdChild, cIdx) => {
              if (!React.isValidElement(tdChild)) return tdChild;
              const colSpan = tdChild.props.colSpan;
              const isRowNumCell = showRowNumber && cIdx === 0;
              const colDef = showRowNumber ? columns[cIdx - 1] : columns[cIdx];
              const flexStyle = isRowNumCell
                ? { width: 48, flexShrink: 0 }
                : colSpan && colSpan > 1
                ? { flex: colSpan }
                : colDef?.width
                ? { width: colDef.width, flexShrink: 0 }
                : { flex: 1, minWidth: 0 };

              return (
                <div
                  key={tdChild.key || cIdx}
                  style={flexStyle}
                  className={`truncate ${tdChild.props.className || 'px-3 py-2 text-xs'}`}
                  title={tdChild.props.title}
                >
                  {tdChild.props.children}
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div {...ariaAttributes} style={style} className="w-full box-border">
          {rendered}
        </div>
      );
    }

    const isEven = index % 2 === 0;
    return (
      <div
        {...ariaAttributes}
        style={style}
        onClick={() => onRowClick && onRowClick(item)}
        className={`flex items-center border-b border-slate-100 transition-colors text-xs ${
          onRowClick ? 'cursor-pointer hover:bg-indigo-50/40' : ''
        } ${isEven ? 'bg-white' : 'bg-slate-50/60'}`}
      >
        {showRowNumber && (
          <div className="w-12 py-2.5 px-3 text-center text-slate-400 font-mono text-[10px] bg-slate-50/40 border-r border-slate-100 shrink-0 select-none">
            {rowNumber}
          </div>
        )}
        {columns.length > 0 ? (
          columns.map((col, cIdx) => {
            const cellContent =
              typeof col.render === 'function'
                ? col.render(item, index, rowNumber)
                : item[col.key] !== undefined && item[col.key] !== null
                ? String(item[col.key])
                : '—';

            const alignClass =
              col.align === 'center'
                ? 'justify-center text-center'
                : col.align === 'right'
                ? 'justify-end text-right'
                : 'justify-start text-left';

            return (
              <div
                key={col.key || cIdx}
                style={{
                  width: col.width || `${100 / columns.length}%`,
                  minWidth: 0,
                }}
                className={`px-3.5 py-2.5 truncate flex items-center ${alignClass} ${col.cellClassName || ''}`}
              >
                {cellContent}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-2 truncate text-slate-700">{JSON.stringify(item)}</div>
        )}
      </div>
    );
  };

  if (!dataset || dataset.length === 0) {
    return (
      <div className={`w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
        {header}
        <div className="py-12 text-center text-slate-400 font-medium text-xs">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      {header && <div className="border-b border-slate-200 bg-slate-100">{header}</div>}
      <div className="w-full overflow-x-auto">
        <List
          rowComponent={RowComponent}
          rowCount={dataset.length}
          rowHeight={effectiveRowHeight}
          rowProps={{}}
          overscanCount={5}
          defaultHeight={calculatedHeight}
          style={{ height: calculatedHeight, width: '100%' }}
        />
      </div>
    </div>
  );
}

export default VirtualizedTable;
