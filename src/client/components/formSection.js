/* eslint-disable react/prop-types */
import { Children } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { mergeIds } from './core/helpers';
import { containers } from '.';
import SectionContent, {
  FormPanelHeader,
} from './formSectionContent';
import { containerStyle, styleItem } from './helpers';
//import { useDrag } from '@app/components/core/dnd';
import './core/styles.css';

Section.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any,
  items: PropTypes.array,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  loc: PropTypes.object,
};

export default function Section(props) {
  const {
      id,
      title,
      layout = 'column',
      className,
      children,
      items,
      loc,
      ...rest
    } = props,
    klass = classNames([className, 'form-grid']),
    content = (
      <section className={klass} style={containerStyle(layout)}>
        <SectionContent {...rest} id={id} items={items}>
          {children}
        </SectionContent>
      </section>
    );

  return loc ? (
    <div className="form-grid-item" style={styleItem(loc)}>
      <FormPanelHeader title={title} className="section" />
      {content}
    </div>
  ) : (
    content
  );
}

InDesignSection.propTypes = {
  title: PropTypes.string,
  parent: PropTypes.string,
  scope: PropTypes.string,
  ctx: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
  items: PropTypes.array,
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  schema: PropTypes.object,
  model: PropTypes.object,
  wrapStyle: PropTypes.object,
  params: PropTypes.object,
  row: PropTypes.object,
  column: PropTypes.object,
  loc: PropTypes.object,
};

export function InDesignSection(props) {
  const {
      id,
      title,
      layout = 'column',
      className,
      children,
      items,
      ...rest
    } = props,
    klass = classNames([className, 'form-grid']),
    { loc, toolbar, onSelect, selected, inDesign } = rest,
    isSelected = selected === id,
    cols = [...Array(layout.cols)],
    cells = [...Array(layout.rows)]
      .map((_, r) => cols.map((_, c) => ({ row: r + 1, col: c + 1 })))
      .flat(),
    contents =
      items?.map(({ type, ...spec }) => ({ type, spec })) ||
      Children.toArray(children).map(({ type, props }) => {
        const { type: typ, ...spec } = props;
        return { type: typ || type.name, spec };
      }),
    occupiedCells = contents
      .map((e) => {
        const {
            row = 1,
            col = 1,
            rowSpan = 1,
            colSpan = 1,
          } = e.spec.loc,
          rows = [...Array(rowSpan)].map((_, i) => row + i),
          cols = [...Array(colSpan)].map((_, i) => col + i);
        return rows.map((r) => cols.map((c) => `${r}:${c}`)).flat();
      })
      .flat(),
    content = (
      <section className={klass} style={containerStyle(layout)}>
        {inDesign &&
          cells.map((c) => {
            const loc = `${c.row}:${c.col}`,
              _id = mergeIds(id, loc);
            return occupiedCells.includes(loc) ? null : (
              <div
                key={loc}
                role="button"
                tabIndex="-1"
                onMouseDown={() => {
                  onSelect?.(mergeIds(id, loc));
                }}
                data-drop={mergeIds(id, loc)}
                className={classNames(['form-grid-filler'], {
                  outlined: _id === selected,
                })}
                style={styleItem(c)}></div>
            );
          })}
        <SectionContent {...rest} inDesign id={id} items={items}>
          {children}
        </SectionContent>
        {contents.map(({ type, spec }) => {
          const isContainer = !!containers[type],
            itemId = mergeIds(id, spec.id);
          // Hide it based on condition - only containers hidden
          //disable containers by setting
          //console.log(itemId, isContainer, styleItem(rest.loc));
          return (
            !isContainer && (
              <div
                key={itemId}
                role="button"
                tabIndex="-1"
                onMouseDown={() => {
                  onSelect?.(itemId);
                }}
                className={classNames(['form-grid-cover'], {
                  outlined: selected === itemId,
                })}
                style={styleItem(spec.loc)}></div>
            )
          );
        })}
      </section>
    );

  return loc ? (
    <div
      className={classNames(['form-grid-item'], {
        outlined: isSelected,
      })}
      style={styleItem(loc)}>
      <FormPanelHeader
        title={title || (inDesign && '<Section title>')}
        className="section"
        toolbar={toolbar}>
        {toolbar?.({ name: 'Section', id })}
      </FormPanelHeader>
      {content}
    </div>
  ) : (
    content
  );
}
